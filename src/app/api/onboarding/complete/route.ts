import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Update Prisma database (use upsert to handle webhook race condition)
    await prisma.user.upsert({
      where: { id: userId },
      update: { onboardingComplete: true },
      create: {
        id: userId,
        email: `placeholder-${userId}@pending-webhook.com`, // Will be updated by webhook later
        onboardingComplete: true,
      }
    });

    // 2. Update Clerk user metadata (so middleware can read it from session claims)
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
      },
    });

    // 3. Set a cookie as a fallback so we don't require the user to configure Clerk JWT templates
    const response = NextResponse.json({ success: true });
    response.cookies.set("onboarding_complete", "true", { path: "/", maxAge: 60 * 60 * 24 * 365 });

    return response;
  } catch (error) {
    console.error("[Onboarding] Error completing onboarding:", error);
    return NextResponse.json({ error: "Failed to complete onboarding" }, { status: 500 });
  }
}
