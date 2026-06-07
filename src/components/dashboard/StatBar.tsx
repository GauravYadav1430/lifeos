"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatBarProps {
  icon: LucideIcon;
  label: string;
  value: number;
  maxValue: number;
  colorClass: string;
  className?: string;
}

export function StatBar({ icon: Icon, label, value, maxValue, colorClass, className }: StatBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`p-2 rounded-md bg-secondary/50 border border-white/5 ${colorClass} bg-opacity-20`}>
        <Icon className={`w-4 h-4 ${colorClass}`} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
          <span className="font-mono text-muted-foreground">{value}/{maxValue}</span>
        </div>
        <div className="h-1.5 w-full bg-secondary/30 rounded-full overflow-hidden border border-white/5">
          <motion.div
            className={`h-full ${colorClass.replace("text-", "bg-")}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
