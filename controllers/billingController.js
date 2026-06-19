const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Challan = require('../models/Challan');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { grantFolderAccess, revokeFolderAccess } = require('../services/googleDriveService');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/receipts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Multer File filter (size is capped at 5MB in route configuration)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG, and PDF files are allowed.'), false);
  }
};

exports.upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB cap
});

// Helper: Verify File Magic Numbers (Binary Signature Validation)
const verifyMagicNumbers = (filePath) => {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(8);
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    const hex = buffer.toString('hex').toUpperCase();

    // PNG: 89504E470D0A1A0A
    if (hex.startsWith('89504E47')) {
      return 'image/png';
    }
    // JPEG/JPG: FFD8FF
    if (hex.startsWith('FFD8FF')) {
      return 'image/jpeg';
    }
    // PDF: 25504446 (%PDF)
    if (hex.startsWith('25504446')) {
      return 'application/pdf';
    }

    return null; // Unknown signature
  } catch (err) {
    console.error('Magic number read error:', err);
    return null;
  }
};

// @desc    Generate Challan Voucher
// @route   POST /api/v1/billing/challan/generate
// @access  Private (Student)
exports.generateChallan = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { planName } = req.body;

    const plan = planName === 'coaching' ? 'coaching' : 'mdcat/ecat';
    const amount = plan === 'coaching' ? 4000 : 5000;
    const details = plan === 'coaching' 
      ? 'Sindh Academy Board Exam Coaching Fee (Matric/Intermediate Classes)'
      : 'Sindh Academy MDCAT & ECAT Medical/Engineering Entry Test Preparatory Portal Fee';

    // Check if there is an active challan (generated or uploaded)
    const existingChallan = await Challan.findOne({
      studentId,
      status: { $in: ['generated', 'uploaded', 'verified'] }
    });

    if (existingChallan) {
      if (existingChallan.status === 'verified') {
        return res.status(400).json({ success: false, message: 'You are already verified and enrolled.' });
      }
      return res.status(200).json({ success: true, challan: existingChallan, message: 'Existing active challan retrieved.' });
    }

    const challanNumber = `SEA-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const challan = await Challan.create({
      studentId,
      challanNumber,
      amount,
      planName: plan,
      details,
      status: 'generated'
    });

    res.status(201).json({ success: true, challan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Generate Challan by Clerk / Admin for a specific student
// @route   POST /api/v1/billing/challan/generate-by-clerk
// @access  Private (Clerk / Admin)
exports.generateChallanByClerk = async (req, res) => {
  try {
    const { studentId, amount, planName, details } = req.body;

    if (!studentId || !amount || !planName) {
      return res.status(400).json({ success: false, message: 'Student ID, Amount, and Plan Name are required.' });
    }

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Check if there is an active challan (generated or uploaded) for this student
    const existingChallan = await Challan.findOne({
      studentId,
      status: { $in: ['generated', 'uploaded', 'verified'] }
    });

    if (existingChallan) {
      if (existingChallan.status === 'verified') {
        return res.status(400).json({ success: false, message: 'Student is already verified and enrolled.' });
      }
      return res.status(400).json({ success: false, message: 'Student already has an active challan voucher.' });
    }

    const challanNumber = `SEA-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const challan = await Challan.create({
      studentId,
      challanNumber,
      amount,
      planName,
      details: details || 'Invoice generated directly by Clerk desk.',
      status: 'generated'
    });

    // Audit log
    await AuditLog.create({
      operatorId: req.user.id,
      action: 'CHALLAN_CREATE_CLERK',
      targetModel: 'Challan',
      targetId: challan._id,
      ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1'
    });

    res.status(201).json({ success: true, challan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Upload Receipt Proof
// @route   PUT /api/v1/billing/challan/upload-receipt/:id
// @access  Private (Student)
exports.uploadReceipt = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const challanId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a proof receipt file.' });
    }

    const filePath = req.file.path;

    // Verify magic numbers to prevent extension spoofing / code injection
    const verifiedMime = verifyMagicNumbers(filePath);
    if (!verifiedMime) {
      // Delete malicious file immediately
      fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: 'Security check failed: Invalid file binary signature.' });
    }

    const challan = await Challan.findOne({ _id: challanId, studentId: req.user.id });

    if (!challan) {
      fs.unlinkSync(filePath);
      return res.status(404).json({ success: false, message: 'Challan not found' });
    }

    if (challan.status === 'verified') {
      fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: 'Challan is already verified.' });
    }

    // Delete old image if it exists
    if (challan.receiptImage && fs.existsSync(challan.receiptImage)) {
      try {
        fs.unlinkSync(challan.receiptImage);
      } catch (err) {
        console.error('Failed to delete old image:', err);
      }
    }

    challan.status = 'uploaded';
    challan.receiptImage = filePath;
    challan.transactionId = transactionId || '';
    challan.uploadedAt = Date.now();
    await challan.save();

    res.status(200).json({ success: true, challan });
  } catch (error) {
    console.error(error);
    // Cleanup files in case of exceptions
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify Challan Voucher (Approve / Reject)
// @route   PUT /api/v1/billing/challan/verify/:id
// @access  Private (Clerk / Admin)
exports.verifyChallan = async (req, res) => {
  try {
    const { status } = req.body; // 'verified' or 'rejected'
    const challanId = req.params.id;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status validation. Must be verified or rejected.' });
    }

    const challan = await Challan.findById(challanId);
    if (!challan) {
      return res.status(404).json({ success: false, message: 'Challan record not found' });
    }

    const previousStatus = challan.status;

    challan.status = status;
    challan.verifiedAt = Date.now();
    challan.verifiedBy = req.user.id;
    await challan.save();

    // If verified, update the student payment status
    const student = await User.findById(challan.studentId);
    if (student) {
      if (status === 'verified') {
        student.isPaid = true;
        try {
          const permissionId = await grantFolderAccess(student.email, process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID);
          student.drivePermissionId = permissionId;
        } catch (driveErr) {
          console.error('[GOOGLE DRIVE PIPELINE ERROR] Failed to auto-grant folder access:', driveErr.message);
        }
        await student.save();
        console.log(`[GOOGLE DRIVE PIPELINE] Access granted to student: ${student.email}`);
      } else {
        student.isPaid = false;
        if (student.drivePermissionId) {
          try {
            await revokeFolderAccess(process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID, student.drivePermissionId);
            student.drivePermissionId = '';
          } catch (driveErr) {
            console.error('[GOOGLE DRIVE PIPELINE ERROR] Failed to auto-revoke folder access:', driveErr.message);
          }
        }
        await student.save();
      }
    }

    // Log Administrative Change in Audit Logs
    await AuditLog.create({
      operatorId: req.user.id,
      action: 'CHALLAN_VERIFY',
      targetModel: 'Challan',
      targetId: challan._id,
      ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1',
      changeDelta: {
        previousStatus,
        newStatus: status,
        studentId: challan.studentId
      }
    });

    res.status(200).json({ success: true, challan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Securely fetch receipt image
// @route   GET /api/v1/billing/receipt/:id
// @access  Private (Student Owner, Clerk, Admin)
exports.getReceiptImage = async (req, res) => {
  try {
    const challan = await Challan.findById(req.params.id);
    if (!challan) {
      return res.status(404).json({ success: false, message: 'Challan not found' });
    }

    // Auth validation: check if Clerk/Admin, or if the requester is the student who generated the challan
    const isOwner = challan.studentId.toString() === req.user.id;
    const isStaff = ['clerk', 'admin'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: 'Access Denied: Insufficient Privileges.' });
    }

    if (!challan.receiptImage || !fs.existsSync(challan.receiptImage)) {
      return res.status(404).json({ success: false, message: 'Receipt photo not found' });
    }

    const ext = path.extname(challan.receiptImage).toLowerCase();
    let mimeType = 'image/jpeg';
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.pdf') mimeType = 'application/pdf';

    res.setHeader('Content-Type', mimeType);
    fs.createReadStream(challan.receiptImage).pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all challans (Staff view)
// @route   GET /api/v1/billing/challans
// @access  Private (Clerk / Admin)
exports.getAllChallans = async (req, res) => {
  try {
    const challans = await Challan.find()
      .populate('studentId', 'name email')
      .populate('verifiedBy', 'name')
      .sort('-createdAt');

    res.status(200).json({ success: true, challans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get student personal challan status
// @route   GET /api/v1/billing/my-challan
// @access  Private (Student)
exports.getMyChallan = async (req, res) => {
  try {
    const challan = await Challan.findOne({ studentId: req.user.id }).sort('-createdAt');
    if (!challan) {
      return res.status(200).json({ success: true, challan: null });
    }
    res.status(200).json({ success: true, challan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
