"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle2, Circle, Flame, Shield, Trash2, Clock, Loader2 } from "lucide-react";
import { getTasks, createTask, completeTask, deleteTask } from "@/actions/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type Task = {
  id: string;
  title: string;
  priority: string;
  xpReward: number;
  completed: boolean;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("MEDIUM");
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const xpReward = newTaskPriority === "BOSS" ? 100 : newTaskPriority === "HIGH" ? 50 : 20;

    setIsAdding(true);
    try {
      const newTask = await createTask({
        title: newTaskTitle,
        priority: newTaskPriority,
        xpReward,
      });
      setTasks([newTask, ...tasks]);
      setNewTaskTitle("");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create quest.",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleComplete = async (id: string, xpReward: number) => {
    // Optimistic UI update
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: true } : t));
    
    try {
      const result = await completeTask(id);
      if (result.didLevelUp) {
        toast({
          title: "LEVEL UP!",
          description: `You reached Level ${result.newLevel}!`,
          className: "bg-gradient-to-r from-purple-600 to-indigo-600 border-none text-white font-bold",
        });
      } else {
        toast({
          title: "Quest Completed",
          description: `You earned +${result.gainedXp} XP!`,
        });
      }
    } catch (error) {
      // Revert on failure
      console.error(error);
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: false } : t));
      toast({
        title: "Error",
        description: "Failed to complete quest.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    try {
      await deleteTask(id);
    } catch (error) {
      console.error(error);
      fetchTasks(); // Revert
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "BOSS": return "text-red-500 border-red-500/30 bg-red-500/10";
      case "HIGH": return "text-orange-500 border-orange-500/30 bg-orange-500/10";
      case "MEDIUM": return "text-blue-500 border-blue-500/30 bg-blue-500/10";
      default: return "text-emerald-500 border-emerald-500/30 bg-emerald-500/10";
    }
  };

  return (
    <div className="p-6 lg:p-12 max-w-5xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-2">
            Quest Log
          </h1>
          <p className="text-muted-foreground">Manage your active missions and track completed objectives.</p>
        </div>
      </div>

      {/* Add Task Form */}
      <div className="glass-panel p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500" />
        <form onSubmit={handleCreateTask} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs uppercase font-semibold text-muted-foreground tracking-widest">New Quest Title</label>
            <Input 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="E.g., Defeat the Email Inbox Monster"
              className="bg-background/50 border-white/10 h-12"
              suppressHydrationWarning
            />
          </div>
          <div className="w-full sm:w-48 space-y-2">
            <label className="text-xs uppercase font-semibold text-muted-foreground tracking-widest">Threat Level</label>
            <select 
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
              className="flex h-12 w-full items-center justify-between rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              suppressHydrationWarning
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="BOSS">BOSS BATTLE</option>
            </select>
          </div>
          <Button type="submit" disabled={isAdding || !newTaskTitle.trim()} className="h-12 px-8 bg-primary hover:bg-primary/90">
            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> Add Quest</>}
          </Button>
        </form>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center p-16 glass-panel border-dashed border-white/10">
            <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Active Quests</h3>
            <p className="text-muted-foreground">Your quest log is empty. Time to find a new mission.</p>
          </div>
        ) : (
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group flex items-center justify-between p-5 rounded-xl border border-white/5 bg-secondary/30 backdrop-blur-sm transition-all hover:bg-secondary/50 ${task.completed ? 'opacity-50 grayscale' : ''}`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <button 
                    onClick={() => handleComplete(task.id, task.xpReward)}
                    disabled={task.completed}
                    className={`transition-colors ${task.completed ? 'text-emerald-500' : 'text-muted-foreground hover:text-primary'}`}
                  >
                    {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </button>
                  <span className={`font-medium text-lg ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant="outline" className={`hidden sm:flex ${getPriorityColor(task.priority)}`}>
                    {task.priority === "BOSS" && <Flame className="w-3 h-3 mr-1" />}
                    {task.priority}
                  </Badge>
                  <div className="font-mono text-sm font-bold text-primary">
                    +{task.xpReward} XP
                  </div>
                  <button 
                    onClick={() => handleDelete(task.id)}
                    className="p-2 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
