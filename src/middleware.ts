import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // --- Public routes: allow through ---
  if (isPublicRoute(req)) {
    // If user is already authenticated and hits auth pages, redirect them away
    if (userId && (req.nextUrl.pathname.startsWith("/sign-in") || req.nextUrl.pathname.startsWith("/sign-up"))) {
      const onboardingCookie = req.cookies.get("onboarding_complete")?.value === "true";
      const onboardingComplete = onboardingCookie || (sessionClaims?.metadata as Record<string, unknown>)?.onboardingComplete;
      const redirectTo = onboardingComplete ? "/dashboard" : "/onboarding";
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }
    return;
  }

  // --- Protected routes: must be authenticated ---
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // --- Onboarding enforcement ---
  // If user hasn't completed onboarding, force them to /onboarding
  const onboardingCookie = req.cookies.get("onboarding_complete")?.value === "true";
  const onboardingComplete = onboardingCookie || (sessionClaims?.metadata as Record<string, unknown>)?.onboardingComplete;

  if (!onboardingComplete && !isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // If user HAS completed onboarding but is still on /onboarding, send to dashboard
  if (onboardingComplete && isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
