import { logger, schedules } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";
// Note: In a real app we'd import the Resend client and React Email templates here

export const weeklySummaryJob = schedules.task({
  id: "weekly-productivity-summary",
  // Run every Sunday at 9:00 AM
  cron: "0 9 * * 0",
  run: async (payload) => {
    logger.info("Starting Weekly Summary Generation", { timestamp: payload.timestamp });

    // 1. Get all active users
    const users = await prisma.user.findMany({
      where: { currentStreak: { gt: 0 } },
      select: { id: true, email: true, name: true, xp: true, level: true }
    });

    logger.info(`Found ${users.length} active users for weekly summary.`);

    // 2. Loop through users and dispatch emails (mocked for now)
    for (const user of users) {
      try {
        // Here we would use resend.emails.send() with a React Email template
        logger.info(`Sending weekly summary to ${user.email}`, { level: user.level, xp: user.xp });
      } catch (error) {
        logger.error(`Failed to send email to ${user.email}`, { error });
      }
    }

    return { usersProcessed: users.length };
  },
});
