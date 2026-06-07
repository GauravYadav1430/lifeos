"use server";

import { prisma } from "@/lib/prisma";
import { calculateLevelFromXp, XPCategory } from "@/lib/gamification";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export type GrantXpPayload = {
  amount: number;
  reason: string;
  category: XPCategory;
  taskId?: string;
  questId?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Grants XP to a user securely.
 * Checks for level ups, updates the user record, and strictly logs the event to XPEvent
 * for analytics and anti-cheat purposes.
 */
export async function grantXP(payload: GrantXpPayload) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { amount, reason, category, taskId, questId, metadata } = payload;

  // 1. Fetch current user state
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, xp: true, level: true, currentStreak: true }
  });

  if (!user) {
    throw new Error("User not found in database");
  }

  // 2. Apply Streak Multipliers (Example Anti-Cheat / Progression Logic)
  let streakModifier = 1.0;
  if (user.currentStreak >= 7) streakModifier = 1.2;
  if (user.currentStreak >= 30) streakModifier = 1.5;

  const finalAmount = Math.floor(amount * streakModifier);
  const newTotalXp = user.xp + finalAmount;
  const newLevel = calculateLevelFromXp(newTotalXp);
  const didLevelUp = newLevel > user.level;

  // 3. Perform Transaction to ensure data consistency
  await prisma.$transaction([
    // Log the deeply detailed event
    prisma.xPEvent.create({
      data: {
        userId,
        amount: finalAmount,
        reason,
        category,
        streakModifier,
        multiplier: 1.0,
        taskId,
        questId,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      }
    }),
    // Update the User
    prisma.user.update({
      where: { id: userId },
      data: {
        xp: newTotalXp,
        level: newLevel,
        // Update highest streak dynamically if needed, though usually handled by daily cron
      }
    })
  ]);

  // Revalidate app routes so UI updates immediately
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath(`/profile/[username]`, "page");

  return {
    success: true,
    gainedXp: finalAmount,
    newTotalXp,
    newLevel,
    didLevelUp
  };
}
