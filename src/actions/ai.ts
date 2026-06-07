"use server";

import { auth } from "@clerk/nextjs/server";
import { chatWithAI, AIMessage, generateWeeklySummary, detectBurnout } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

/**
 * Send a message to the AI assistant.
 */
export async function sendMessageToAI(history: AIMessage[], message: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const response = await chatWithAI(history, message);
    return { success: true, response };
  } catch (error) {
    console.error("AI Chat Error:", error);
    return { success: false, error: "Failed to communicate with AI." };
  }
}

/**
 * Generate a quick insight/summary based on the user's current data.
 */
export async function generateUserInsight() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  const userData = {
    tasksCompleted: Math.floor(Math.random() * 20), // Placeholder until tasks are implemented
    totalXp: user.xp,
    currentStreak: user.currentStreak,
    habitsCompleted: Math.floor(Math.random() * 10), // Placeholder
    journalEntries: Math.floor(Math.random() * 5), // Placeholder
    topCategory: "Deep Work",
  };

  try {
    const summary = await generateWeeklySummary(userData);
    return { success: true, summary };
  } catch (error) {
    console.error("AI Insight Error:", error);
    return { success: false, error: "Failed to generate insight." };
  }
}

/**
 * Check user for burnout risk based on recent activity.
 */
export async function checkBurnoutRisk() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  const patterns = {
    avgDailyTasks: 8,
    avgMood: 3.5,
    streakLength: user.currentStreak,
    recentJournalSentiment: "Feeling a bit overwhelmed but pushing through.",
  };

  try {
    const assessment = await detectBurnout(patterns);
    return { success: true, assessment };
  } catch (error) {
    console.error("AI Burnout Error:", error);
    return { success: false, error: "Failed to assess burnout risk." };
  }
}
