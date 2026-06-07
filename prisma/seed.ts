import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

async function main() {
  const connectionString = process.env.DATABASE_URL?.replace("postgresql://", "postgres://");
  
  if (!connectionString) {
    throw new Error("DATABASE_URL is undefined!");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("Seeding Gamification Engine data...");

    // 1. Seed Global Quests
    const quests = [
      {
        title: "The Morning Routine",
        description: "Complete your morning habits before 9 AM.",
        type: "DAILY",
        xpReward: 50,
        coinReward: 10,
      },
      {
        title: "Deep Work Warrior",
        description: "Log 4 hours of uninterrupted focus time.",
        type: "DAILY",
        xpReward: 100,
        coinReward: 25,
      },
      {
        title: "Weekend Review",
        description: "Write your weekly journal entry.",
        type: "WEEKLY",
        xpReward: 250,
        coinReward: 50,
      },
    ];

    for (const quest of quests) {
      await prisma.quest.create({ data: quest });
    }

    // 2. Seed Shop Items / Inventory Cosmetics
    const items = [
      {
        name: "Nebula Dashboard Theme",
        description: "An animated galactic background for your dashboard.",
        type: "THEME",
        rarity: "EPIC",
        price: 500,
      },
      {
        name: "Sword of Focus",
        description: "Displays a legendary sword next to your name in Guilds.",
        type: "AVATAR",
        rarity: "LEGENDARY",
        price: 2500,
      },
      {
        name: "Lo-Fi Beats Soundpack",
        description: "Unlocks the lo-fi focus soundboard.",
        type: "SOUND_PACK",
        rarity: "RARE",
        price: 150,
      },
    ];

    for (const item of items) {
      await prisma.item.create({ data: item });
    }

    // 3. Seed Achievements
    const achievements = [
      {
        title: "First Blood",
        description: "Complete your first task.",
        category: "MASTERY",
        xpReward: 50,
      },
      {
        title: "Unbreakable",
        description: "Reach a 7-day streak.",
        category: "STREAK",
        xpReward: 300,
      },
      {
        title: "Guild Initiate",
        description: "Join your first Guild.",
        category: "SOCIAL",
        xpReward: 100,
      },
    ];

    for (const ach of achievements) {
      await prisma.achievement.create({ data: ach });
    }

    console.log("✅ Gamification Engine seeded successfully.");
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
