const express = require('express');
const router = express.Router();
const { streamNotifications, getNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../../auth/middleware/authMiddleware');

router.get('/stream', protect, streamNotifications);
router.get('/', protect, getNotifications);
router.put('/mark-read', protect, markAsRead);

module.exports = router;