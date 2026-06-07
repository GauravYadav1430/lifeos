import { logger, task } from "@trigger.dev/sdk/v3";
import { aiService } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

export const aiInsightsProcessor = task({
  id: "process-ai-insights",
  // Prevent long running tasks from exhausting resources, configure retries
  retry: {
    maxAttempts: 3,
  },
  run: async (payload: { userId: string }) => {
    logger.info("Starting AI Insight Processing", { userId: payload.userId });

    // 1. Fetch user data (tasks, habits, streaks)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        tasks: {
          where: { completed: true, updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        }
      }
    });

    if (!user) {
      logger.error("User not found");
      return;
    }

    // 2. Generate insights via Gemini Abstraction
    const completedTasksCount = user.tasks.length;
    const insights = await aiService.getDailyInsights(completedTasksCount, user.currentStreak);

    // 3. Cache the insights into Upstash Redis for quick dashboard retrieval
    // Note: We would normally import `redis` here and `redis.set(key, insights.content)`
    logger.info("Generated Insight", { insight: insights.content });

    return { success: true, insights: insights.content };
  },
});
