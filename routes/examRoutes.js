const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { protect, authorizeRoles, optionalProtect } = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.get('/search-mcq', optionalProtect, examController.searchMCQ);
router.get('/mocks/:id', optionalProtect, examController.getMock);
router.post('/mocks/submit', optionalProtect, examController.submitMock);
router.post('/create', protect, authorizeRoles('teacher', 'admin'), examController.createExam);
router.get('/', optionalProtect, examController.getAllExams);
router.get('/my-attempts', protect, authorizeRoles('student'), examController.getMyAttempts);

// Docx template uploader
router.post(
  '/upload-test-doc',
  protect,
  authorizeRoles('teacher', 'admin'),
  upload.single('document'),
  examController.uploadTestDoc
);

router.get('/questions', protect, authorizeRoles('teacher', 'admin'), examController.getQuestions);
router.delete('/questions/:id', protect, authorizeRoles('teacher', 'admin'), examController.deleteQuestion);
router.delete('/:id', protect, authorizeRoles('teacher', 'admin'), examController.deleteExam);
router.put('/:id', protect, authorizeRoles('teacher', 'admin'), examController.updateExam);

module.exports = router;
