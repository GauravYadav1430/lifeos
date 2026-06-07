"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { revalidatePath } from "next/cache";

export async function createGuild(name: string, description?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const guild = await prisma.guild.create({
    data: {
      name,
      description,
      members: { connect: { id: userId } },
    },
  });

  // Set user presence
  await redis.hset(`guild_presence:${guild.id}`, { [userId]: Date.now() });
  revalidatePath("/guilds");
  return guild;
}

export async function joinGuild(guildId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Leave current guild first
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { guildId: true },
  });

  if (user?.guildId) {
    await prisma.guild.update({
      where: { id: user.guildId },
      data: { members: { disconnect: { id: userId } } },
    });
    await redis.hdel(`guild_presence:${user.guildId}`, userId);
  }

  // Join new guild
  await prisma.guild.update({
    where: { id: guildId },
    data: { members: { connect: { id: userId } } },
  });

  await redis.hset(`guild_presence:${guildId}`, { [userId]: Date.now() });
  revalidatePath("/guilds");
}

export async function leaveGuild() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { guildId: true },
  });

  if (!user?.guildId) return;

  await prisma.guild.update({
    where: { id: user.guildId },
    data: { members: { disconnect: { id: userId } } },
  });

  await redis.hdel(`guild_presence:${user.guildId}`, userId);
  revalidatePath("/guilds");
}

export async function getMyGuild() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { guildId: true },
  });

  if (!user?.guildId) return null;

  const guild = await prisma.guild.findUnique({
    where: { id: user.guildId },
    include: {
      members: {
        select: { id: true, name: true, avatarUrl: true, level: true, xp: true },
      },
      bossBattles: {
        where: { isActive: true },
        take: 1,
      },
    },
  });

  return guild;
}

export async function getAvailableGuilds() {
  return prisma.guild.findMany({
    include: {
      _count: { select: { members: true } },
    },
    orderBy: { xp: "desc" },
    take: 20,
  });
}
