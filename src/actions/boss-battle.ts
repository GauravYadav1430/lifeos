"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { revalidatePath } from "next/cache";

/**
 * Start a new boss battle for a guild.
 */
export async function startBossBattle(
  guildId: string,
  title: string,
  description: string,
  totalHp: number,
  rewardXp: number
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const boss = await prisma.bossBattle.create({
    data: {
      title,
      description,
      totalHp,
      currentHp: totalHp,
      rewardXp,
      guildId,
      isActive: true,
    },
  });

  // Cache initial HP in Redis for fast reads
  await redis.set(`boss_hp:${boss.id}`, totalHp);
  revalidatePath("/guilds");
  return boss;
}

/**
 * Deal damage to an active boss battle.
 * Writes to Redis for fast high-frequency updates.
 * Lazy-syncs back to Postgres.
 */
export async function dealBossDamage(bossId: string, damage: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Atomically decrement HP in Redis
  const newHp = await redis.decrby(`boss_hp:${bossId}`, damage);
  const clampedHp = Math.max(0, newHp);

  // If Redis went negative, clamp it
  if (newHp < 0) {
    await redis.set(`boss_hp:${bossId}`, 0);
  }

  // Log the damage contribution
  await redis.hincrby(`boss_damage:${bossId}`, userId, damage);

  // Lazy sync to Postgres every hit (acceptable for demo; use Trigger.dev cron in production)
  await prisma.bossBattle.update({
    where: { id: bossId },
    data: { currentHp: clampedHp },
  });

  // Check if boss is defeated
  if (clampedHp <= 0) {
    // Mark boss as inactive
    const boss = await prisma.bossBattle.update({
      where: { id: bossId },
      data: { isActive: false, endsAt: new Date() },
    });

    // TODO: Distribute reward XP to all guild members who contributed

    revalidatePath("/guilds");
    return { defeated: true, hp: 0, rewardXp: boss.rewardXp };
  }

  return { defeated: false, hp: clampedHp };
}

/**
 * Get the current boss status from Redis (fast polling).
 */
export async function getBossStatus(bossId: string) {
  const hp = await redis.get<number>(`boss_hp:${bossId}`);
  const contributions = await redis.hgetall<Record<string, number>>(`boss_damage:${bossId}`);
  
  return { hp: hp ?? 0, contributions: contributions ?? {} };
}
