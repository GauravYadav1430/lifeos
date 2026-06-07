"use client";

import { useGamificationStore } from "@/store/useGamificationStore";
import { getLevelProgress } from "@/lib/gamification";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";

export function XPBar() {
  const { totalXp, level } = useGamificationStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch

  const progress = getLevelProgress(totalXp);

  return (
    <div className="w-full flex items-center gap-3 px-4 py-2 bg-background/50 backdrop-blur-md border-b sticky top-0 z-40 h-14">
      {/* Level Badge */}
      <div className="relative flex items-center justify-center">
        <Star className="w-8 h-8 text-primary fill-primary/20" />
        <span className="absolute text-xs font-bold text-primary-foreground">{level}</span>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-1">
        <div className="flex justify-between items-end text-xs font-medium text-muted-foreground">
          <span>XP: {totalXp.toLocaleString()}</span>
          <span>{progress.xpNeededForNextLevel.toLocaleString()} to Lvl {level + 1}</span>
        </div>
        
        {/* Progress Bar Track */}
        <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden relative">
          {/* Animated Fill */}
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress.progressPercentage}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
          />
          {/* Shimmer Effect */}
          <motion.div 
            className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          />
        </div>
      </div>
    </div>
  );
}
