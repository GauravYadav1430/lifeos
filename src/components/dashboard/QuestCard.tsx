"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QuestCardProps {
  id: string;
  title: string;
  xpReward: number;
  type: "HABIT" | "DAILY" | "TASK";
  isCompleted: boolean;
  onComplete: (id: string, xp: number) => void;
  className?: string;
}

export function QuestCard({ id, title, xpReward, type, isCompleted, onComplete, className }: QuestCardProps) {
  const typeColors = {
    HABIT: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
    DAILY: "text-blue-500 border-blue-500/30 bg-blue-500/10",
    TASK: "text-purple-500 border-purple-500/30 bg-purple-500/10",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, x: 4 }}
      whileTap={{ scale: 0.99 }}
      className={`group relative flex items-center justify-between p-4 rounded-xl border border-white/5 bg-secondary/20 hover:bg-secondary/40 backdrop-blur-md transition-colors cursor-pointer ${className} ${isCompleted ? "opacity-50 grayscale" : ""}`}
      onClick={() => !isCompleted && onComplete(id, xpReward)}
    >
      <div className="flex items-center gap-4">
        <button className={`transition-colors ${isCompleted ? "text-emerald-500" : "text-muted-foreground group-hover:text-primary"}`}>
          {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
        </button>
        <div className="flex flex-col">
          <span className={`font-medium ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {title}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Badge variant="outline" className={`text-xs uppercase tracking-wider font-semibold ${typeColors[type]}`}>
          {type}
        </Badge>
        <div className="flex items-center font-mono text-sm font-semibold text-primary">
          +{xpReward} XP
        </div>
      </div>
    </motion.div>
  );
}
