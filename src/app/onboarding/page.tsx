"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  Target,
  Flame,
  Brain,
  Swords,
  ChevronRight,
  Loader2,
} from "lucide-react";

const ONBOARDING_STEPS = [
  {
    icon: Rocket,
    title: "Welcome to LifeOS",
    subtitle: "Your life is about to level up.",
    description:
      "LifeOS isn't just a productivity app. It's a full RPG for your real life. Every task you complete earns XP. Every habit becomes a quest. Every goal is a boss battle.",
    color: "from-indigo-500 to-purple-600",
  },
  {
    icon: Target,
    title: "Set Your Focus",
    subtitle: "What do you want to master?",
    description:
      "Whether it's deep work, fitness, learning, or creativity — LifeOS adapts to your goals and builds a personalized progression system around them.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: Flame,
    title: "Build Streaks",
    subtitle: "Consistency is your superpower.",
    description:
      "Daily streaks multiply your XP. The longer you maintain your habits, the faster you level up. Break a streak and you'll feel the burn.",
    color: "from-orange-500 to-red-600",
  },
  {
    icon: Swords,
    title: "Join a Guild",
    subtitle: "You don't have to fight alone.",
    description:
      "Form or join guilds with friends. Take on Boss Battles together, compete on leaderboards, and hold each other accountable.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    subtitle: "Your personal productivity AI.",
    description:
      "LifeOS uses AI to analyze your patterns, predict burnout, suggest optimal focus times, and generate weekly performance reports.",
    color: "from-emerald-500 to-green-600",
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();

  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const step = ONBOARDING_STEPS[currentStep];
  const StepIcon = step.icon;

  const handleNext = async () => {
    if (isLastStep) {
      setIsCompleting(true);
      try {
        // Call the API to mark onboarding complete in both Prisma + Clerk
        const res = await fetch("/api/onboarding/complete", { method: "POST" });
        if (!res.ok) throw new Error("Failed to complete onboarding");

        // Force session refresh to pick up new metadata in the JWT cookie
        await user?.reload();
        await getToken({ skipCache: true });

        // Hard navigate to dashboard to ensure middleware runs with fresh cookie
        document.cookie = "onboarding_complete=true; path=/; max-age=31536000";
        window.location.href = "/dashboard";
      } catch (error: any) {
        console.error("Onboarding completion error:", error);
        alert(`Failed to complete onboarding: ${error.message}`);
        setIsCompleting(false);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0"
        key={currentStep}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div
          className={`absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br ${step.color} opacity-20 blur-[150px] rounded-full`}
        />
        <div
          className={`absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br ${step.color} opacity-10 blur-[150px] rounded-full`}
        />
      </motion.div>

      {/* Step Indicator */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {ONBOARDING_STEPS.map((_, i) => (
          <motion.div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentStep
                ? "bg-primary w-8"
                : i < currentStep
                ? "bg-primary/50 w-4"
                : "bg-muted w-4"
            }`}
            layoutId={`step-${i}`}
          />
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="z-10 max-w-lg mx-auto px-6 text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
            className={`mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-8 shadow-2xl`}
          >
            <StepIcon className="w-12 h-12 text-white" />
          </motion.div>

          <h1 className="text-4xl font-black tracking-tight mb-2">
            {step.title}
          </h1>
          <p className="text-lg font-medium text-primary mb-4">
            {step.subtitle}
          </p>
          <p className="text-muted-foreground leading-relaxed mb-10">
            {step.description}
          </p>

          <div className="flex items-center justify-center gap-4">
            {currentStep > 0 && (
              <Button
                variant="ghost"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="text-muted-foreground"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={isCompleting}
              size="lg"
              className={`bg-gradient-to-r ${step.color} text-white font-bold px-8 shadow-lg hover:shadow-xl transition-all`}
            >
              {isCompleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Launching...
                </>
              ) : isLastStep ? (
                "Enter LifeOS"
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
