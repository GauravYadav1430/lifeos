"use client";

import { useEffect } from "react";
import { useGamificationStore } from "@/store/useGamificationStore";
import { XPBar } from "./XPBar";
import { LevelUpModal } from "./LevelUpModal";

interface GamificationProviderProps {
  initialXp: number;
  initialLevel: number;
  children: React.ReactNode;
}

export function GamificationProvider({
  initialXp,
  initialLevel,
  children,
}: GamificationProviderProps) {
  const { initialize } = useGamificationStore();

  // Initialize store with server state on mount
  useEffect(() => {
    initialize(initialXp, initialLevel);
  }, [initialXp, initialLevel, initialize]);

  return (
    <div className="flex flex-col h-full w-full">
      <XPBar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
      <LevelUpModal />
    </div>
  );
}
