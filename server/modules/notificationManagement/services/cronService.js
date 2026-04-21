const cron = require('node-cron');
const Case = require('../../caseManagement/models/Case');
const User = require('../../auth/models/User');
const { createAndSendNotification } = require('./notificationService');

/**
 * Runs every day at midnight.
 * Finds all cases with hearings scheduled for tomorrow
 * and notifies associated users.
 */
const initCronJobs = () => {
  // Run at midnight every day: '0 0 * * *'
  // For testing, use '* * * * *' to run every minute
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running daily hearing reminder check...');

    try {
      // Calculate start and end of tomorrow
      const now = new Date();
      const tomorrowStart = new Date(now);
      tomorrowStart.setDate(now.getDate() + 1);
      tomorrowStart.setHours(0, 0, 0, 0);

      const tomorrowEnd = new Date(tomorrowStart);
      tomorrowEnd.setHours(23, 59, 59, 999);

      // Find all cases with hearings tomorrow
      const upcomingCases = await Case.find({
        hearingDate: { $gte: tomorrowStart, $lte: tomorrowEnd }
      })
        .populate('client', 'name')
        .populate('assignedTo', '_id name email')
        .populate('createdBy', '_id name email');

      if (upcomingCases.length === 0) {
        console.log('[CRON] No hearings scheduled for tomorrow.');
        return;
      }

      console.log(`[CRON] Found ${upcomingCases.length} hearing(s) for tomorrow.`);

      // Get all admin users as they always get notified
      const admins = await User.find({ role: 'admin', isActive: true, isBlocked: false });

      for (const caseItem of upcomingCases) {
        const title = `Upcoming Hearing Tomorrow`;
        const message = `Case "${caseItem.title}" (${caseItem.caseNumber}) has a hearing scheduled for tomorrow, ${tomorrowStart.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;

        // Collect unique user IDs to notify
        const userIdsToNotify = new Set();

        admins.forEach(admin => userIdsToNotify.add(admin._id.toString()));

        if (caseItem.assignedTo?._id) {
          userIdsToNotify.add(caseItem.assignedTo._id.toString());
        }
        if (caseItem.createdBy?._id) {
          userIdsToNotify.add(caseItem.createdBy._id.toString());
        }

        for (const userId of userIdsToNotify) {
          await createAndSendNotification(userId, { title, message, type: 'hearing' });
        }
      }

      console.log('[CRON] Hearing reminders dispatched successfully.');
    } catch (err) {
      console.error('[CRON] Error in hearing reminder job:', err);
    }
  });

  console.log('[CRON] Daily hearing reminder job scheduled.');
};

module.exports = { initCronJobs };