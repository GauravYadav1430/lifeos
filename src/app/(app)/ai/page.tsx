"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Send, BrainCircuit, Activity, Loader2, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sendMessageToAI, generateUserInsight, checkBurnoutRisk } from "@/actions/ai";
import type { AIMessage } from "@/lib/ai";

export default function AiPage() {
  const [messages, setMessages] = useState<AIMessage[]>([
    { role: "model", content: "Greetings, Commander. I am your Digital Twin. I analyze your habits, quests, and stats to optimize your life. How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [burnout, setBurnout] = useState<{ risk: "LOW" | "MEDIUM" | "HIGH"; advice: string } | null>(null);
  const [isLoadingWidgets, setIsLoadingWidgets] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function fetchWidgets() {
      setIsLoadingWidgets(true);
      const [insightRes, burnoutRes] = await Promise.all([
        generateUserInsight(),
        checkBurnoutRisk()
      ]);
      
      if (insightRes.success && insightRes.summary) {
        setInsight(insightRes.summary);
      }
      if (burnoutRes.success && burnoutRes.assessment) {
        setBurnout(burnoutRes.assessment);
      }
      setIsLoadingWidgets(false);
    }
    fetchWidgets();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: AIMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const res = await sendMessageToAI(messages, userMsg.content);
    
    if (res.success && res.response) {
      setMessages(prev => [...prev, { role: "model", content: res.response! }]);
    } else {
      setMessages(prev => [...prev, { role: "model", content: "Sorry, my neural link is disrupted. Please try again later." }]);
    }
    
    setIsTyping(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
          <BrainCircuit className="w-9 h-9 text-primary animate-pulse" />
          AI Digital Twin
        </h1>
        <p className="text-muted-foreground text-lg">
          Your personal productivity analyst and gamification coach.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <Card className="col-span-1 lg:col-span-2 border-primary/20 bg-gradient-to-br from-card/80 to-primary/5 backdrop-blur-xl h-[600px] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
          <CardHeader className="border-b border-white/5 relative z-10 bg-card/50">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Bot className="w-6 h-6 text-primary" />
              Neural Link
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 flex flex-col">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-secondary/80 text-secondary-foreground rounded-tl-sm border border-white/5 shadow-lg"}`}>
                    <p className="whitespace-pre-wrap leading-relaxed text-sm">
                      {msg.content}
                    </p>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-secondary/80 p-4 rounded-2xl rounded-tl-sm border border-white/5 shadow-lg flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </CardContent>
          
          <div className="p-4 bg-card/50 border-t border-white/5 relative z-10">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your productivity patterns..."
                className="bg-secondary/50 border-white/10 h-12 rounded-xl focus-visible:ring-primary/50"
                disabled={isTyping}
              />
              <Button type="submit" disabled={isTyping || !input.trim()} size="icon" className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </Card>

        {/* Widgets Area */}
        <div className="col-span-1 space-y-6">
          {/* Weekly Summary Widget */}
          <Card className="border-white/5 bg-secondary/20 backdrop-blur-xl relative overflow-hidden">
             <div className="absolute bottom-0 right-0 w-32 h-32 bg-green-500/10 blur-[50px] rounded-full" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Weekly Tactical Briefing
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingWidgets ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-3">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-sm">Synthesizing data...</p>
                </div>
              ) : insight ? (
                <div className="space-y-4 text-sm leading-relaxed text-secondary-foreground whitespace-pre-wrap">
                  {insight}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unable to generate briefing at this time.</p>
              )}
            </CardContent>
          </Card>

          {/* Burnout Assessment Widget */}
          <Card className="border-white/5 bg-secondary/20 backdrop-blur-xl relative overflow-hidden">
            {burnout?.risk === "HIGH" && <div className="absolute inset-0 border-2 border-red-500/50 rounded-xl animate-pulse pointer-events-none" />}
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-blue-400" />
                System Health Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingWidgets ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-3">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-sm">Scanning vitals...</p>
                </div>
              ) : burnout ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Burnout Risk</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      burnout.risk === "LOW" ? "bg-green-500/20 text-green-400" :
                      burnout.risk === "MEDIUM" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {burnout.risk}
                    </span>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-card/50 border border-white/5 text-sm">
                    <span className="text-primary font-semibold block mb-1">Recommendation:</span>
                    {burnout.advice}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unable to scan vitals at this time.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
