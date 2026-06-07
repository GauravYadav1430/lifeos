"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Sparkles, Dumbbell, BookOpen, Brain, Zap } from "lucide-react"
import { useGamificationStore } from "@/store/useGamificationStore"

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Dashboard Gamification Components
import { PlayerProfileCard } from "@/components/dashboard/PlayerProfileCard"
import { XPProgressBar } from "@/components/dashboard/XPProgressBar"
import { StatBar } from "@/components/dashboard/StatBar"
import { QuestCard } from "@/components/dashboard/QuestCard"
import { BossBattleCard } from "@/components/dashboard/BossBattleCard"
import { ActivityFeed, ActivityType } from "@/components/dashboard/ActivityFeed"

export default function DashboardPage() {
  const { user } = useUser()
  const { level, xp, addXp } = useGamificationStore()
  
  // Calculate max XP for current level (simple exponential curve)
  const maxXP = level * 500

  const [quests, setQuests] = useState([
    { id: "q1", title: "Morning Review", xp: 50, type: "HABIT" as const, completed: false },
    { id: "q2", title: "Ship landing page update", xp: 150, type: "TASK" as const, completed: false },
    { id: "q3", title: "Read 10 pages of Atomic Habits", xp: 30, type: "DAILY" as const, completed: false },
  ])

  const [bossBattle, setBossBattle] = useState({
    id: "b1",
    title: "Project Phoenix Launch",
    description: "Complete all critical bugs before the weekend release.",
    xpReward: 1000,
    progress: 4,
    totalSteps: 10,
  })

  // Mock activity feed
  const [activities, setActivities] = useState([
    { id: "a1", type: "ACHIEVEMENT" as ActivityType, title: "Early Bird", description: "Logged in before 6 AM", timestamp: "Today, 5:45 AM", xpAmount: 100 },
    { id: "a2", type: "XP_GAIN" as ActivityType, title: "Completed: Meditate", description: "10 minute session", timestamp: "Yesterday, 8:00 PM", xpAmount: 30 },
  ])

  const handleCompleteQuest = (id: string, xpReward: number) => {
    setQuests(quests.map(q => q.id === id ? { ...q, completed: true } : q))
    addXp(xpReward)
    
    // Add to activity feed
    setActivities(prev => [{
      id: Date.now().toString(),
      type: "XP_GAIN",
      title: `Completed: ${quests.find(q => q.id === id)?.title}`,
      description: "Quest completed",
      timestamp: "Just now",
      xpAmount: xpReward
    }, ...prev])
  }

  const handleAttackBoss = (id: string) => {
    if (bossBattle.progress < bossBattle.totalSteps) {
      setBossBattle(prev => ({ ...prev, progress: prev.progress + 1 }))
      addXp(50) // Small XP for attacking
      
      if (bossBattle.progress + 1 === bossBattle.totalSteps) {
        addXp(bossBattle.xpReward) // Big reward for defeating
        setActivities(prev => [{
          id: Date.now().toString(),
          type: "BOSS_DEFEATED",
          title: `Defeated: ${bossBattle.title}`,
          description: "Boss battle completed!",
          timestamp: "Just now",
          xpAmount: bossBattle.xpReward
        }, ...prev])
      }
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen space-y-8">
      
      {/* Top Section: XP Bar */}
      <div className="mb-8">
        <XPProgressBar currentXP={xp} maxXP={maxXP} level={level} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Profile & Stats (3 cols) */}
        <div className="xl:col-span-3 space-y-6">
          <PlayerProfileCard 
            name={user?.firstName || "Commander"}
            playerClass="Technomancer"
            avatarUrl={user?.imageUrl}
            streak={12}
            rank="Silver III"
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
              {quests.map(quest => (
                <QuestCard 
                  key={quest.id}
                  id={quest.id}
                  title={quest.title}
                  type={quest.type}
                  xpReward={quest.xp}
                  isCompleted={quest.completed}
                  onComplete={handleCompleteQuest}
                />
              ))}
              
              {quests.every(q => q.completed) && (
                <div className="p-8 text-center rounded-xl border border-dashed border-white/10 bg-secondary/10">
                  <p className="text-muted-foreground">All quests completed for today. Take a rest!</p>
                </div>
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
                You are on a <span className="text-emerald-400 font-bold">12-day streak</span>. 
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

