"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BossArena } from "@/components/gamification/BossArena";
import {
  Shield,
  Users,
  Crown,
  Plus,
  Swords,
  Loader2,
  LogOut,
  Star,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyGuild,
  getAvailableGuilds,
  createGuild,
  joinGuild,
  leaveGuild,
} from "@/actions/guild";
import { startBossBattle } from "@/actions/boss-battle";

export default function GuildsPage() {
  const queryClient = useQueryClient();
  const [newGuildName, setNewGuildName] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { data: myGuild } = useQuery({
    queryKey: ["my-guild"],
    queryFn: getMyGuild,
  });

  const { data: guilds, isLoading: loadingGuilds } = useQuery({
    queryKey: ["available-guilds"],
    queryFn: getAvailableGuilds,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createGuild(name, "A new guild ready for battle!"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-guild"] });
      queryClient.invalidateQueries({ queryKey: ["available-guilds"] });
      setNewGuildName("");
      setShowCreate(false);
    },
  });

  const joinMutation = useMutation({
    mutationFn: joinGuild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-guild"] });
      queryClient.invalidateQueries({ queryKey: ["available-guilds"] });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: leaveGuild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-guild"] });
    },
  });

  const startBossMutation = useMutation({
    mutationFn: () => {
      if (!myGuild) throw new Error("No guild");
      return startBossBattle(
        myGuild.id,
        "Procrastination Dragon",
        "A fearsome beast that feeds on missed deadlines.",
        500,
        1000
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-guild"] });
    },
  });

  const activeBoss = myGuild?.bossBattles?.[0];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <Shield className="w-9 h-9 text-primary" />
          Guild Arena
        </h1>
        <p className="text-muted-foreground mt-1">
          Form alliances. Defeat bosses. Climb the leaderboard.
        </p>
      </motion.div>

      {/* My Guild Section */}
      {myGuild ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Guild Banner */}
          <Card className="border-primary/20 bg-gradient-to-br from-card/80 to-primary/5 backdrop-blur-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Crown className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{myGuild.name}</CardTitle>
                    <p className="text-muted-foreground text-sm">
                      Level {myGuild.level} · {myGuild.xp.toLocaleString()} Guild XP
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => leaveMutation.mutate()}
                  disabled={leaveMutation.isPending}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Leave
                </Button>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Members */}
            <Card className="border-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-blue-400" />
                  Members ({myGuild.members.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {myGuild.members.map((member) => (
                  <motion.div
                    key={member.id}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                      {member.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{member.name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">
                        Level {member.level} · {member.xp.toLocaleString()} XP
                      </p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Boss Battle */}
            <div className="space-y-4">
              {activeBoss ? (
                <BossArena
                  bossId={activeBoss.id}
                  title={activeBoss.title}
                  description={activeBoss.description}
                  totalHp={activeBoss.totalHp}
                  rewardXp={activeBoss.rewardXp}
                />
              ) : (
                <Card className="border-white/5 backdrop-blur-xl">
                  <CardContent className="p-8 text-center space-y-4">
                    <Swords className="w-12 h-12 mx-auto text-muted-foreground/40" />
                    <p className="text-muted-foreground">No active boss battle.</p>
                    <Button
                      onClick={() => startBossMutation.mutate()}
                      disabled={startBossMutation.isPending}
                      className="bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold"
                    >
                      {startBossMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Swords className="w-4 h-4 mr-2" />
                      )}
                      Summon Boss Battle
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        /* No Guild — Show Discovery */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Create Guild */}
          <Card className="border-white/5 backdrop-blur-xl">
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                {showCreate ? (
                  <motion.div
                    key="create"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-3"
                  >
                    <Input
                      placeholder="Enter guild name..."
                      value={newGuildName}
                      onChange={(e) => setNewGuildName(e.target.value)}
                      className="bg-secondary/30 border-white/10"
                    />
                    <Button
                      onClick={() => createMutation.mutate(newGuildName)}
                      disabled={!newGuildName.trim() || createMutation.isPending}
                      className="bg-primary"
                    >
                      {createMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Create"
                      )}
                    </Button>
                    <Button variant="ghost" onClick={() => setShowCreate(false)}>
                      Cancel
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div key="button" className="text-center">
                    <Button
                      onClick={() => setShowCreate(true)}
                      size="lg"
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create a Guild
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Available Guilds */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Available Guilds
            </h2>
            {loadingGuilds ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : guilds && guilds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guilds.map((guild, i) => (
                  <motion.div
                    key={guild.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="border-white/5 hover:border-primary/20 transition-colors backdrop-blur-xl">
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold">{guild.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Users className="w-3 h-3" />
                              {guild._count.members} members
                              <span>·</span>
                              <span>{guild.xp.toLocaleString()} XP</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => joinMutation.mutate(guild.id)}
                          disabled={joinMutation.isPending}
                        >
                          Join
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="border-white/5">
                <CardContent className="p-12 text-center text-muted-foreground">
                  No guilds available yet. Be the first to create one!
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
