"use client";

import { motion } from "framer-motion";
import { Zap, Trophy, Shield, Star } from "lucide-react";

export type ActivityType = "XP_GAIN" | "LEVEL_UP" | "BOSS_DEFEATED" | "ACHIEVEMENT";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  xpAmount?: number;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
}

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  const getIcon = (type: ActivityType) => {
    switch (type) {
      case "XP_GAIN": return <Zap className="w-4 h-4 text-primary" />;
      case "LEVEL_UP": return <Star className="w-4 h-4 text-yellow-500" />;
      case "BOSS_DEFEATED": return <Shield className="w-4 h-4 text-orange-500" />;
      case "ACHIEVEMENT": return <Trophy className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getColor = (type: ActivityType) => {
    switch (type) {
      case "XP_GAIN": return "bg-primary/10 border-primary/20";
      case "LEVEL_UP": return "bg-yellow-500/10 border-yellow-500/20";
      case "BOSS_DEFEATED": return "bg-orange-500/10 border-orange-500/20";
      case "ACHIEVEMENT": return "bg-emerald-500/10 border-emerald-500/20";
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-2">Recent Activity</h3>
      
      <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
        {activities.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">No recent activity.</div>
        ) : (
          activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-center justify-between group"
            >
              <div className="flex items-center gap-4 w-full">
                <div className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-full border ${getColor(activity.type)} backdrop-blur-sm`}>
                  {getIcon(activity.type)}
                </div>
                
                <div className="flex-1 bg-secondary/20 border border-white/5 rounded-xl p-3 backdrop-blur-sm group-hover:bg-secondary/40 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-foreground">{activity.title}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{activity.timestamp}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground line-clamp-1">{activity.description}</span>
                    {activity.xpAmount && (
                      <span className="text-xs font-bold text-primary font-mono ml-2">+{activity.xpAmount} XP</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
