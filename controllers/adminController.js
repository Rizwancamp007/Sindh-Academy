const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Attempt = require('../models/Attempt');
const Exam = require('../models/Exam');

// @desc    Get dashboard telemetry statistics
// @route   GET /api/v1/admin/stats
// @access  Private (Admin)
exports.getStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const verifiedStudents = await User.countDocuments({ role: 'student', isVerified: true });
    const paidStudents = await User.countDocuments({ role: 'student', isPaid: true });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalClerks = await User.countDocuments({ role: 'clerk' });

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        verifiedStudents,
        paidStudents,
        totalTeachers,
        totalClerks
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all users list
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update a user (role, verification, payment)
// @route   PUT /api/v1/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
  try {
    const { name, role, isPaid, isVerified } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const previousState = {
      name: user.name,
      role: user.role,
      isPaid: user.isPaid,
      isVerified: user.isVerified
    };

    if (name !== undefined) user.name = name;
    if (role !== undefined) user.role = role;
    if (isPaid !== undefined) user.isPaid = isPaid;
    if (isVerified !== undefined) user.isVerified = isVerified;

    await user.save();

    // Log Administrative Change in Audit Logs
    await AuditLog.create({
      operatorId: req.user.id,
      action: 'USER_MUTATION',
      targetModel: 'User',
      targetId: user._id,
      ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1',
      changeDelta: {
        previousState,
        newState: {
          name: user.name,
          role: user.role,
          isPaid: user.isPaid,
          isVerified: user.isVerified
        }
      }
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.deleteOne({ _id: req.params.id });

    // Log deletion
    await AuditLog.create({
      operatorId: req.user.id,
      action: 'USER_DELETE',
      targetModel: 'User',
      targetId: req.params.id,
      ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1',
      changeDelta: {
        deletedUserEmail: user.email
      }
    });

    res.status(200).json({ success: true, message: 'User account removed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all administrative mutation logs
// @route   GET /api/v1/admin/logs
// @access  Private (Admin)
exports.getLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('operatorId', 'name email role')
      .sort('-createdAt')
      .limit(100);

    res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get exam telemetry grade results & comparisons
// @route   GET /api/v1/admin/analytics/grades
// @access  Private (Admin)
exports.getGradeAnalytics = async (req, res) => {
  try {
    const attempts = await Attempt.find({ isCompleted: true })
      .populate('studentId', 'name email')
      .populate('examId', 'title subject');

    if (attempts.length === 0) {
      return res.status(200).json({
        success: true,
        analytics: {
          globalStats: { avg: 0, high: 0, low: 0, totalAttempts: 0 },
          studentSubjectAverages: []
        }
      });
    }

    let totalScore = 0;
    let high = -Infinity;
    let low = Infinity;
    const studentMap = {};

    attempts.forEach(att => {
      const score = att.score || 0;
      totalScore += score;
      if (score > high) high = score;
      if (score < low) low = score;

      const studentIdStr = att.studentId ? att.studentId._id.toString() : 'removed';
      const studentName = att.studentId ? att.studentId.name : 'Removed Student';
      const studentEmail = att.studentId ? att.studentId.email : '-';
      const subject = att.examId ? att.examId.subject : 'General';

      if (!studentMap[studentIdStr]) {
        studentMap[studentIdStr] = {
          id: studentIdStr,
          name: studentName,
          email: studentEmail,
          subjects: { Biology: [], Physics: [], Chemistry: [], English: [] }
        };
      }

      if (studentMap[studentIdStr].subjects[subject]) {
        studentMap[studentIdStr].subjects[subject].push(score);
      } else {
        studentMap[studentIdStr].subjects[subject] = [score];
      }
    });

    const studentSubjectAverages = Object.values(studentMap).map(std => {
      const subjectAverages = {};
      Object.keys(std.subjects).forEach(sub => {
        const scores = std.subjects[sub];
        if (scores.length === 0) {
          subjectAverages[sub] = null;
        } else {
          const sum = scores.reduce((a, b) => a + b, 0);
          subjectAverages[sub] = Math.round(sum / scores.length);
        }
      });

      return {
        id: std.id,
        name: std.name,
        email: std.email,
        averages: subjectAverages
      };
    });

    res.status(200).json({
      success: true,
      analytics: {
        globalStats: {
          avg: Math.round(totalScore / attempts.length),
          high: high === -Infinity ? 0 : high,
          low: low === Infinity ? 0 : low,
          totalAttempts: attempts.length
        },
        studentSubjectAverages
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
