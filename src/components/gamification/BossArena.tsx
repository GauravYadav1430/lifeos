"use client";

import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBossStatus, dealBossDamage } from "@/actions/boss-battle";
import { Swords, Skull, Heart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import confetti from "canvas-confetti";

interface BossArenaProps {
  bossId: string;
  title: string;
  description: string;
  totalHp: number;
  rewardXp: number;
}

export function BossArena({ bossId, title, description, totalHp, rewardXp }: BossArenaProps) {
  const queryClient = useQueryClient();
  const [shakeKey, setShakeKey] = useState(0);

  // Poll boss HP every 2 seconds
  const { data: bossStatus } = useQuery({
    queryKey: ["boss-status", bossId],
    queryFn: () => getBossStatus(bossId),
    refetchInterval: 2000,
  });

  const attackMutation = useMutation({
    mutationFn: () => dealBossDamage(bossId, 10),
    onSuccess: (result) => {
      setShakeKey((prev) => prev + 1);
      queryClient.invalidateQueries({ queryKey: ["boss-status", bossId] });
      
      if (result.defeated) {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
          colors: ["#8b5cf6", "#f97316", "#22c55e"],
        });
      }
    },
  });

  const currentHp = bossStatus?.hp ?? totalHp;
  const hpPercentage = Math.max(0, (currentHp / totalHp) * 100);
  const isDefeated = currentHp <= 0;

  const hpColor = hpPercentage > 60 ? "from-red-600 to-red-500" : hpPercentage > 30 ? "from-orange-600 to-orange-400" : "from-yellow-600 to-green-400";

  return (
    <motion.div
      key={shakeKey}
      animate={shakeKey > 0 ? { x: [0, -5, 5, -3, 3, 0] } : {}}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-card/80 to-red-950/10 backdrop-blur-xl p-6"
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 blur-[80px] rounded-full" />
      
      <div className="relative z-10 space-y-5">
        {/* Boss Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Skull className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
            <Zap className="w-3 h-3 mr-1" />
            {rewardXp} XP Reward
          </Badge>
        </div>

        {/* HP Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1 text-red-400">
              <Heart className="w-4 h-4" />
              {currentHp.toLocaleString()} / {totalHp.toLocaleString()} HP
            </span>
            <span className="text-muted-foreground">{Math.round(hpPercentage)}%</span>
          </div>
          <div className="h-4 w-full bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${hpColor} rounded-full relative`}
              animate={{ width: `${hpPercentage}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
            </motion.div>
          </div>
        </div>

        {/* Attack Button */}
        {isDefeated ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center py-4"
          >
            <p className="text-2xl font-black text-green-400">🎉 BOSS DEFEATED!</p>
            <p className="text-muted-foreground text-sm mt-1">+{rewardXp} XP rewarded</p>
          </motion.div>
        ) : (
          <Button
            onClick={() => attackMutation.mutate()}
            disabled={attackMutation.isPending}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all"
            size="lg"
          >
            <Swords className="w-5 h-5 mr-2" />
            {attackMutation.isPending ? "Attacking..." : "Attack! (-10 HP)"}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
