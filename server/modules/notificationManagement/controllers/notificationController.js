const Notification = require('../models/Notification');
const { sseClients } = require('../sseClients');

/**
 * @desc    Open SSE stream for real-time notifications
 * @route   GET /api/v1/notifications/stream
 * @access  Private
 */
const streamNotifications = (req, res) => {
  const userId = req.user.userId;

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Register this client
  sseClients.set(userId, res);
  console.log(`[SSE] Client connected: ${userId}`);

  // Send a heartbeat every 30 seconds to keep the connection alive
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  // Clean up when client disconnects
  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(userId);
    console.log(`[SSE] Client disconnected: ${userId}`);
  });
};

/**
 * @desc    Get all notifications for the logged-in user
 * @route   GET /api/v1/notifications
 * @access  Private
 */
const getNotifications = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const query = Notification.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    if (limit) query.limit(limit);

    const notifications = await query;
    const unreadCount = await Notification.countDocuments({ userId: req.user.userId, isRead: false });

    res.status(200).json({
      success: true,
      data: { notifications, unreadCount }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

/**
 * @desc    Mark one or all notifications as read
 * @route   PUT /api/v1/notifications/mark-read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;

    if (notificationId) {
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId: req.user.userId },
        { isRead: true }
      );
    } else {
      // Mark all as read
      await Notification.updateMany({ userId: req.user.userId, isRead: false }, { isRead: true });
    }

    res.status(200).json({ success: true, message: 'Notification(s) marked as read.' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
};

module.exports = { streamNotifications, getNotifications, markAsRead };
