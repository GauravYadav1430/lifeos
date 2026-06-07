"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface AchievementBadgeProps {
  icon: LucideIcon;
  name: string;
  description: string;
  isUnlocked: boolean;
  dateUnlocked?: string;
  className?: string;
}

export function AchievementBadge({ icon: Icon, name, description, isUnlocked, dateUnlocked, className }: AchievementBadgeProps) {
  return (
    <motion.div
      whileHover={isUnlocked ? { scale: 1.05, y: -2 } : {}}
      className={`group relative flex flex-col items-center p-4 rounded-2xl border ${
        isUnlocked 
          ? "border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-transparent" 
          : "border-white/5 bg-secondary/20 grayscale opacity-60"
      } ${className}`}
    >
      <div className={`p-4 rounded-full mb-3 ${isUnlocked ? "bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-secondary/50"}`}>
        <Icon className={`w-8 h-8 ${isUnlocked ? "text-emerald-400" : "text-muted-foreground"}`} />
      </div>
      <h4 className={`text-sm font-bold text-center mb-1 ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
        {name}
      </h4>
      {isUnlocked && dateUnlocked && (
        <span className="text-[10px] font-mono text-emerald-500/70 uppercase tracking-widest">
          {dateUnlocked}
        </span>
      )}

      {/* Tooltip on hover */}
      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-popover text-popover-foreground text-xs px-3 py-2 rounded-md shadow-xl border border-border w-max max-w-[200px] text-center z-50">
        {description}
      </div>
    </motion.div>
  );
}
