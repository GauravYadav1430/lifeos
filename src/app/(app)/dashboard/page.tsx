"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Sparkles, Dumbbell, BookOpen, Brain, Zap, Loader2 } from "lucide-react"

// Server Actions
import { getTasks, completeTask } from "@/actions/tasks"
import { getRecentActivities, getUserStats } from "@/actions/gamification"

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Dashboard Gamification Components
import { PlayerProfileCard } from "@/components/dashboard/PlayerProfileCard"
import { XPProgressBar } from "@/components/dashboard/XPProgressBar"
import { StatBar } from "@/components/dashboard/StatBar"
import { QuestCard } from "@/components/dashboard/QuestCard"
import { BossBattleCard } from "@/components/dashboard/BossBattleCard"
import { ActivityFeed, ActivityItem } from "@/components/dashboard/ActivityFeed"

export default function DashboardPage() {
  const { user } = useUser()
  
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ xp: 0, level: 1, currentStreak: 0 })
  const [quests, setQuests] = useState<any[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])

  const maxXP = stats.level * 500

  // Placeholder for boss battle (would be fetched from DB in full implementation)
  const [bossBattle, setBossBattle] = useState({
    id: "b1",
    title: "Project Phoenix Launch",
    description: "Complete all critical bugs before the weekend release.",
    xpReward: 1000,
    progress: 4,
    totalSteps: 10,
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [fetchedTasks, fetchedActivities, fetchedStats] = await Promise.all([
        getTasks(),
        getRecentActivities(),
        getUserStats()
      ])

      setQuests(fetchedTasks.slice(0, 5)) // Only show top 5 active tasks on dashboard
      setActivities(fetchedActivities as ActivityItem[])
      if (fetchedStats) {
        setStats({
          xp: fetchedStats.xp,
          level: fetchedStats.level,
          currentStreak: fetchedStats.currentStreak
        })
      }
    } catch (error) {
      console.error("Failed to load dashboard data", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteQuest = async (id: string, xpReward: number) => {
    // Optimistic UI update
    setQuests(quests.map(q => q.id === id ? { ...q, completed: true } : q))
    
    try {
      const result = await completeTask(id)
      setStats(prev => ({
        ...prev,
        xp: result.newTotalXp,
        level: result.newLevel
      }))
      
      // Refresh activities
      const newActivities = await getRecentActivities()
      setActivities(newActivities as ActivityItem[])
    } catch (error) {
      console.error("Failed to complete task", error)
      // Revert optimistic update
      setQuests(quests.map(q => q.id === id ? { ...q, completed: false } : q))
    }
  }

  const handleAttackBoss = (id: string) => {
    if (bossBattle.progress < bossBattle.totalSteps) {
      setBossBattle(prev => ({ ...prev, progress: prev.progress + 1 }))
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen space-y-8">
      
      {/* Top Section: XP Bar */}
      <div className="mb-8">
        <XPProgressBar currentXP={stats.xp} maxXP={maxXP} level={stats.level} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Profile & Stats (3 cols) */}
        <div className="xl:col-span-3 space-y-6">
          <PlayerProfileCard 
            name={user?.firstName || "Commander"}
            playerClass="Technomancer"
            avatarUrl={user?.imageUrl}
            streak={stats.currentStreak}
            rank={stats.level < 5 ? "Bronze" : stats.level < 10 ? "Silver" : "Gold"}
          />

          <div className="bg-secondary/10 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Attributes</h3>
            <div className="space-y-4">
              <StatBar icon={Dumbbell} label="Strength" value={45} maxValue={100} colorClass="text-red-500" />
              <StatBar icon={Brain} label="Intelligence" value={82} maxValue={100} colorClass="text-blue-500" />
              <StatBar icon={Zap} label="Agility" value={60} maxValue={100} colorClass="text-yellow-500" />
              <StatBar icon={BookOpen} label="Wisdom" value={30} maxValue={100} colorClass="text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Center Column: Quests & Bosses (6 cols) */}
        <div className="xl:col-span-6 space-y-6">
          {/* Active Boss Battle */}
          {bossBattle.progress < bossBattle.totalSteps && (
            <BossBattleCard 
              id={bossBattle.id}
              title={bossBattle.title}
              description={bossBattle.description}
              xpReward={bossBattle.xpReward}
              progress={bossBattle.progress}
              totalSteps={bossBattle.totalSteps}
              onAttack={handleAttackBoss}
            />
          )}

          {/* Daily Quests */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">Active Quests</h2>
              <span className="text-sm font-mono text-muted-foreground">{quests.filter(q => !q.completed).length} Pending</span>
            </div>
            
            <div className="space-y-3">
              {quests.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-white/10 bg-secondary/10">
                  <p className="text-muted-foreground">No active quests found. Go to the Quest Log to add some!</p>
                </div>
              ) : (
                quests.map(quest => (
                  <QuestCard 
                    key={quest.id}
                    id={quest.id}
                    title={quest.title}
                    type={quest.priority === "BOSS" ? "DAILY" : quest.priority === "HIGH" ? "TASK" : "HABIT"}
                    xpReward={quest.xpReward}
                    isCompleted={quest.completed}
                    onComplete={handleCompleteQuest}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Insights & Activity (3 cols) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* AI Insights Card */}
          <Card className="bg-gradient-to-br from-violet-900/20 to-primary/10 border-violet-500/20 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-violet-400">
                <Sparkles className="w-5 h-5" />
                AI Oracle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-violet-100/80">
                You are on a <span className="text-emerald-400 font-bold">{stats.currentStreak}-day streak</span>. 
                Your Intelligence stat is progressing faster than Strength. Consider adding a Fitness quest tomorrow to maintain balance.
              </p>
              <Button variant="outline" className="w-full mt-4 bg-violet-950/30 border-violet-500/30 text-violet-300 hover:bg-violet-900/50 hover:text-white">
                View Full Analysis
              </Button>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <div className="bg-secondary/10 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
            <ActivityFeed activities={activities} />
          </div>
          
        </div>
      </div>
    </div>
  )
}

