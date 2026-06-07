"use client";

import { motion } from "framer-motion";

interface XPProgressBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
  className?: string;
}

export function XPProgressBar({ currentXP, maxXP, level, className }: XPProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (currentXP / maxXP) * 100));

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-end mb-2">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Current Level</span>
          <span className="text-2xl font-black text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">
            Lv. {level}
          </span>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium">{currentXP}</span>
          <span className="text-xs text-muted-foreground ml-1">/ {maxXP} XP</span>
        </div>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/30 backdrop-blur-sm border border-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-600 to-indigo-400"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            boxShadow: "0 0 10px rgba(168, 85, 247, 0.4)",
          }}
        />
      </div>
    </div>
  );
}
