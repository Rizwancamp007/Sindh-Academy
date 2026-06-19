const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/challan/generate', protect, authorizeRoles('student'), billingController.generateChallan);
router.post('/challan/generate-by-clerk', protect, authorizeRoles('clerk', 'admin'), billingController.generateChallanByClerk);
router.put('/challan/upload-receipt/:id', protect, authorizeRoles('student'), billingController.upload.single('receipt'), billingController.uploadReceipt);
router.put('/challan/verify/:id', protect, authorizeRoles('clerk', 'admin'), billingController.verifyChallan);
router.get('/receipt/:id', protect, billingController.getReceiptImage);
router.get('/challans', protect, authorizeRoles('clerk', 'admin'), billingController.getAllChallans);
router.get('/my-challan', protect, authorizeRoles('student'), billingController.getMyChallan);

module.exports = router;
