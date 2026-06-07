"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";

/**
 * Silent component that ensures the Prisma user record exists
 * after authentication. Handles the webhook race condition by
 * calling /api/auth/sync on first load.
 */
export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, userId } = useAuth();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (isSignedIn && userId && !hasSynced.current) {
      hasSynced.current = true;
      fetch("/api/auth/sync", { method: "POST" }).catch(console.error);
    }
  }, [isSignedIn, userId]);

  return <>{children}</>;
}
