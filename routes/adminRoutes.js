const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Lock down all admin routes to Admin role only
router.use(protect, authorizeRoles('admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/logs', adminController.getLogs);
router.get('/analytics/grades', adminController.getGradeAnalytics);

module.exports = router;
