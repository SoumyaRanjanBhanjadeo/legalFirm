const Notification = require('../models/Notification');
const User = require('../../auth/models/User');
const sendEmail = require('../../auth/utils/sendEmail');

/**
 * Create a notification record and push it via SSE if user has app notifications enabled.
 * Also sends email if user has email notifications enabled.
 */
const createAndSendNotification = async (userId, { title, message, type = 'hearing' }) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Always persist to DB regardless of notification settings
    const notification = await Notification.create({ userId, title, message, type });

    // Push via SSE if user has app notifications on
    if (user.notificationSettings?.appNotifications !== false) {
      const { sseClients } = require('../sseClients');
      const client = sseClients.get(userId.toString());
      if (client) {
        const payload = JSON.stringify({
          _id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          isRead: notification.isRead,
          createdAt: notification.createdAt
        });
        client.write(`data: ${payload}\n\n`);
      }
    }

    // Send email notification if user has email notifications on
    if (user.notificationSettings?.emailNotifications !== false && user.email) {
      try {
        await sendEmail({
          email: user.email,
          subject: `Legal Firm: ${title}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #B8860B;">${title}</h2>
              <p style="color: #333; line-height: 1.6;">${message}</p>
              <hr style="border-color: #eee;" />
              <p style="font-size: 12px; color: #888;">This is an automated notification from LegalFirm. Please do not reply to this email.</p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('Notification email failed:', emailErr.message);
      }
    }

    return notification;
  } catch (err) {
    console.error('createAndSendNotification error:', err);
  }
};

module.exports = { createAndSendNotification };
