const fs = require('fs');
const path = require('path');
const Lecture = require('../models/Lecture');
const VideoAccessLog = require('../models/VideoAccessLog');
const AuditLog = require('../models/AuditLog');

// Google Drive API integration placeholder.
// To fully configure Google Drive, place your service account json key file as config/service-account.json
let drive = null;
try {
  const { google } = require('googleapis'); // Optional dependency
  const keyPath = path.join(__dirname, '../config/service-account.json');
  if (fs.existsSync(keyPath)) {
    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });
    drive = google.drive({ version: 'v3', auth });
    console.log('[GOOGLE DRIVE API] Initialized client successfully.');
  }
} catch (e) {
  console.log('[GOOGLE DRIVE API] Library or credential file not configured. local fallback enabled.');
}

// @desc    Get lectures list based on access privileges
// @route   GET /api/v1/resources/lectures
// @access  Public / Private
exports.getLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find({}).sort('-createdAt');
    res.status(200).json({ success: true, lectures });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new lecture resource
// @route   POST /api/v1/resources/lectures
// @access  Private (Teacher / Admin)
exports.createLecture = async (req, res) => {
  try {
    const { title, description, googleDriveFileId, isDemo, subject, topic } = req.body;

    const lecture = await Lecture.create({
      title,
      description,
      googleDriveFileId,
      isDemo: isDemo || false,
      subject,
      topic
    });

    // Audit log
    await AuditLog.create({
      operatorId: req.user.id,
      action: 'LECTURE_CREATE',
      targetModel: 'Lecture',
      targetId: lecture._id,
      ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1'
    });

    res.status(201).json({ success: true, lecture });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update lecture details
// @route   PUT /api/v1/resources/lectures/:id
// @access  Private (Admin)
exports.updateLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found' });
    }

    // Audit log
    await AuditLog.create({
      operatorId: req.user.id,
      action: 'LECTURE_UPDATE',
      targetModel: 'Lecture',
      targetId: lecture._id,
      ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1'
    });

    res.status(200).json({ success: true, lecture });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete lecture
// @route   DELETE /api/v1/resources/lectures/:id
// @access  Private (Admin)
exports.deleteLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findByIdAndDelete(req.params.id);

    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found' });
    }

    // Audit log
    await AuditLog.create({
      operatorId: req.user.id,
      action: 'LECTURE_DELETE',
      targetModel: 'Lecture',
      targetId: req.params.id,
      ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1'
    });

    res.status(200).json({ success: true, message: 'Lecture removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Proxy stream video content securely from Google Drive (or local fallback)
// @route   GET /api/v1/resources/stream/:id
// @access  Private (Paid Student, Teacher, Admin) or Public (if isDemo is true)
exports.streamLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture resource not found' });
    }

    // Access control
    let isAuthorized = false;
    if (lecture.isDemo) {
      isAuthorized = true;
    } else if (req.user && (['admin', 'teacher'].includes(req.user.role) || req.user.isPaid)) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Access Denied: Premium lecture resource.' });
    }

    // Log this access event
    const userId = req.user ? req.user.id : null;
    const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';

    await VideoAccessLog.create({
      userId,
      videoId: lecture._id.toString(),
      ipAddress,
      heartbeats: [{ timestamp: Date.now() }]
    });

    // Check account pooling: find concurrent heartbeats from different IPs for this user within last 5 minutes
    if (userId) {
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
      const activeSessions = await VideoAccessLog.distinct('ipAddress', {
        userId,
        createdAt: { $gte: fiveMinsAgo }
      });
      if (activeSessions.length > 2) {
        console.warn(`[SECURITY WARNING] User ${userId} is accessing lectures from multiple IP addresses:`, activeSessions);
        // We can trigger flags, or logout, or block. For now, log.
      }
    }

    // Stream Routing: Drive vs Local File
    const fileId = lecture.googleDriveFileId;
    const localFilePath = path.join(__dirname, `../uploads/lectures/${fileId}.mp4`);

    if (fs.existsSync(localFilePath)) {
      // Local fallback file streaming using HTTP byte range support
      const stat = fs.statSync(localFilePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(localFilePath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(localFilePath).pipe(res);
      }
    } else if (drive) {
      // Stream directly from Google Drive API, hiding details
      try {
        const driveResponse = await drive.files.get(
          { fileId: fileId, alt: 'media' },
          { responseType: 'stream' }
        );
        res.setHeader('Content-Type', 'video/mp4');
        driveResponse.data.pipe(res);
      } catch (driveErr) {
        console.error('Google Drive streaming failed:', driveErr);
        res.status(500).json({ success: false, message: 'Google Drive video retrieval failed' });
      }
    } else {
      // Standard demo/mock fallback video stream (returns a short sample video buffer to let user verify UI player)
      // We will create a small placeholder if needed, or return 404 with guidance
      res.status(404).json({
        success: false,
        message: 'Lecture file not uploaded. Put .mp4 file in uploads/lectures/ folder matching Drive ID.'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Log stream heartbeat (detects device pooling)
// @route   POST /api/v1/resources/stream/:id/heartbeat
// @access  Private
exports.logHeartbeat = async (req, res) => {
  try {
    const log = await VideoAccessLog.findOne({
      userId: req.user.id,
      videoId: req.params.id
    }).sort('-createdAt');

    if (log) {
      log.heartbeats.push({ timestamp: Date.now() });
      await log.save();
      return res.status(200).json({ success: true });
    }
    res.status(400).json({ success: false, message: 'No active streaming session found.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all success reviews / stories
// @route   GET /api/v1/resources/reviews
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const Review = require('../models/Review');
    const reviews = await Review.find({ isFeatured: true }).sort('-createdAt');
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create student success review
// @route   POST /api/v1/resources/reviews
// @access  Private (Clerk / Admin)
exports.createReview = async (req, res) => {
  try {
    const Review = require('../models/Review');
    const { studentName, achievement, reviewText, avatarName } = req.body;

    if (!studentName || !achievement || !reviewText) {
      return res.status(400).json({ success: false, message: 'Please add all required fields' });
    }

    const review = await Review.create({
      studentName,
      achievement,
      reviewText,
      avatarName: avatarName || 'avatar1'
    });

    // Audit log
    await AuditLog.create({
      operatorId: req.user.id,
      action: 'REVIEW_CREATE',
      targetModel: 'Review',
      targetId: review._id,
      ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1'
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete success review
// @route   DELETE /api/v1/resources/reviews/:id
// @access  Private (Clerk / Admin)
exports.deleteReview = async (req, res) => {
  try {
    const Review = require('../models/Review');
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    await Review.deleteOne({ _id: req.params.id });

    // Audit log
    await AuditLog.create({
      operatorId: req.user.id,
      action: 'REVIEW_DELETE',
      targetModel: 'Review',
      targetId: req.params.id,
      ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1'
    });

    res.status(200).json({ success: true, message: 'Success review removed.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
