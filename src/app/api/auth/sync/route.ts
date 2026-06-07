import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * This endpoint handles the race condition where a user signs in
 * but the Clerk webhook hasn't fired yet. The client calls this
 * to ensure the User record exists in Prisma before loading the app.
 */
export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, onboardingComplete: true },
    });

    if (existingUser) {
      return NextResponse.json({
        synced: true,
        onboardingComplete: existingUser.onboardingComplete,
      });
    }

    // User doesn't exist yet — webhook hasn't fired. Create them now.
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Could not fetch user data" }, { status: 500 });
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress || "";
    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();

    const newUser = await prisma.user.upsert({
      where: { id: userId },
      update: {
        email,
        name,
        avatarUrl: clerkUser.imageUrl,
      },
      create: {
        id: userId,
        email,
        name,
        avatarUrl: clerkUser.imageUrl,
        onboardingComplete: false,
      },
    });

    return NextResponse.json({
      synced: true,
      onboardingComplete: newUser.onboardingComplete,
    });
  } catch (error) {
    console.error("[Auth Sync] Error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
