"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { grantXP } from "./gamification";

export async function getTasks() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return await prisma.task.findMany({
    where: { userId },
    orderBy: [
      { completed: 'asc' },
      { priority: 'desc' },
      { createdAt: 'desc' }
    ]
  });
}

export async function createTask(data: { title: string; priority: string; xpReward: number }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const task = await prisma.task.create({
    data: {
      userId,
      title: data.title,
      priority: data.priority,
      xpReward: data.xpReward,
    }
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return task;
}

export async function completeTask(taskId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const task = await prisma.task.findUnique({
    where: { id: taskId, userId }
  });

  if (!task || task.completed) {
    throw new Error("Task not found or already completed");
  }

  // Transaction to update task and grant XP securely
  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: { completed: true }
    });
  });

  // Grant XP using the centralized gamification service
  const result = await grantXP({
    amount: task.xpReward,
    reason: `Completed task: ${task.title}`,
    category: "PRODUCTIVITY",
    taskId: task.id
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  
  return result;
}

export async function deleteTask(taskId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.task.delete({
    where: { id: taskId, userId }
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}
