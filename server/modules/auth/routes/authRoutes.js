const express = require('express');
const router = express.Router();
const { login, createUser, getMe, getAllUsers, updateUser, toggleUserBlock, deleteUser, forgotPassword, verifyOTP, resetPassword, updateMyPassword, updateNotificationSettings, getNotificationSettings } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

// Protected routes (require authentication)
router.get('/me', protect, getMe);
router.put('/update-password', protect, updateMyPassword);

// Notification Settings routes
router.get('/settings/notifications', protect, getNotificationSettings);
router.put('/settings/notifications', protect, updateNotificationSettings);

// Admin only routes
router.post('/create-user', protect, authorize('admin'), createUser);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id', protect, authorize('admin'), updateUser);
router.put('/users/:id/toggle-block', protect, authorize('admin'), toggleUserBlock);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);


module.exports = router;
