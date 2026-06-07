"use client";

import { useGamificationStore } from "@/store/useGamificationStore";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";

export function LevelUpModal() {
  const { level, isLevelUpModalOpen, closeLevelUpModal } = useGamificationStore();

  useEffect(() => {
    if (isLevelUpModalOpen) {
      // Fire confetti when modal opens
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#8b5cf6', '#d946ef', '#f97316']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#8b5cf6', '#d946ef', '#f97316']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    }
  }, [isLevelUpModalOpen]);

  return (
    <Dialog open={isLevelUpModalOpen} onOpenChange={closeLevelUpModal}>
      <DialogContent className="sm:max-w-md text-center border-none bg-transparent shadow-none">
        <AnimatePresence>
          {isLevelUpModalOpen && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="bg-card/80 backdrop-blur-xl border border-primary/20 rounded-2xl p-8 flex flex-col items-center shadow-2xl relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
              
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute w-40 h-40 bg-primary/20 blur-3xl rounded-full"
              />

              <Trophy className="w-20 h-20 text-yellow-400 mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] z-10" />
              
              <DialogHeader className="z-10 relative">
                <DialogTitle className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  LEVEL UP!
                </DialogTitle>
              </DialogHeader>

              <div className="z-10 mt-4 space-y-2">
                <p className="text-muted-foreground font-medium">You have reached</p>
                <div className="text-6xl font-black text-foreground drop-shadow-md">
                  Level {level}
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeLevelUpModal}
                className="z-10 mt-8 w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
              >
                Continue Journey
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
