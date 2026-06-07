"use client";

import { User, Flame, Sword, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface PlayerProfileCardProps {
  name: string;
  playerClass: string;
  avatarUrl?: string;
  streak: number;
  rank: string;
  className?: string;
}

export function PlayerProfileCard({ name, playerClass, avatarUrl, streak, rank, className }: PlayerProfileCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-secondary/30 backdrop-blur-md p-6 ${className}`}>
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 blur-[30px] rounded-full pointer-events-none" />

      <div className="flex items-center gap-6 relative z-10">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-full blur opacity-40" />
          <Avatar className="w-20 h-20 border-2 border-background/50 relative z-10 bg-secondary">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="bg-secondary text-2xl font-bold text-muted-foreground">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 border border-white/10 shadow-lg z-20">
            <div className="bg-primary/20 p-1.5 rounded-full text-primary">
              <Sword className="w-3 h-3" />
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60">
                {name}
              </h2>
              <p className="text-sm text-primary font-medium tracking-widest uppercase">{playerClass}</p>
            </div>
            
            <Badge variant="outline" className="bg-background/50 border-white/10 backdrop-blur-md">
              {rank}
            </Badge>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-lg">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-orange-500">{streak} Day Streak</span>
            </div>
            
            {/* Active Buffs (Mock) */}
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center backdrop-blur-md tooltip-trigger cursor-help" title="Focus Potion Active: +20% XP">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center backdrop-blur-md tooltip-trigger cursor-help" title="Rested Bonus: Double XP for next task">
                <User className="w-3.5 h-3.5 text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
