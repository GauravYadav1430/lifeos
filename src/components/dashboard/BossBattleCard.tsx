"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Crosshair } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BossBattleCardProps {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  totalSteps: number;
  onAttack: (id: string) => void;
  className?: string;
}

export function BossBattleCard({ id, title, description, xpReward, progress, totalSteps, onAttack, className }: BossBattleCardProps) {
  const percentage = Math.min(100, Math.max(0, (progress / totalSteps) * 100));

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`relative overflow-hidden flex flex-col p-5 rounded-2xl border border-orange-500/20 bg-gradient-to-br from-secondary/40 to-orange-950/20 backdrop-blur-xl ${className}`}
    >
      {/* Background Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/20 blur-[50px] rounded-full pointer-events-none" />

      <div className="flex items-start justify-between mb-4 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-orange-500/20 border border-orange-500/30">
            <ShieldAlert className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-orange-50">{title}</h3>
            <p className="text-sm text-orange-200/60 line-clamp-1">{description}</p>
          </div>
        </div>
        <Badge variant="destructive" className="bg-orange-500/20 text-orange-400 border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
          BOSS BATTLE
        </Badge>
      </div>

      <div className="space-y-2 z-10 mb-5">
        <div className="flex justify-between text-xs font-semibold text-orange-200/60 uppercase tracking-widest">
          <span>HP Remaining</span>
          <span>{totalSteps - progress} / {totalSteps}</span>
        </div>
        <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-orange-900/50">
          <motion.div
            className="h-full bg-gradient-to-r from-red-600 to-orange-500"
            initial={{ width: "100%" }}
            animate={{ width: `${100 - percentage}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between z-10 mt-auto">
        <div className="font-mono text-sm font-bold text-orange-400">
          REWARD: +{xpReward} XP
        </div>
        <button
          onClick={() => onAttack(id)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors shadow-[0_0_15px_rgba(249,115,22,0.4)]"
        >
          <Crosshair className="w-4 h-4" />
          ATTACK
        </button>
      </div>
    </motion.div>
  );
}
