const express = require('express');
const router = express.Router();
const lectureController = require('../controllers/lectureController');
const { protect, authorizeRoles, optionalProtect } = require('../middleware/authMiddleware');

router.get('/lectures', optionalProtect, lectureController.getLectures);
router.post('/lectures', protect, authorizeRoles('teacher', 'admin'), lectureController.createLecture);
router.put('/lectures/:id', protect, authorizeRoles('admin', 'teacher'), lectureController.updateLecture);
router.delete('/lectures/:id', protect, authorizeRoles('admin', 'teacher'), lectureController.deleteLecture);
router.get('/stream/:id', optionalProtect, lectureController.streamLecture);
router.post('/stream/:id/heartbeat', protect, lectureController.logHeartbeat);

// Success stories reviews routes
router.get('/reviews', optionalProtect, lectureController.getReviews);
router.post('/reviews', protect, authorizeRoles('clerk', 'admin'), lectureController.createReview);
router.delete('/reviews/:id', protect, authorizeRoles('clerk', 'admin'), lectureController.deleteReview);

module.exports = router;
