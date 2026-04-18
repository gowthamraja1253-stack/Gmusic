'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrackerStore, BREAK_THRESHOLD } from '@/store/useTrackerStore';
import { Coffee, X } from 'lucide-react';

export const BreakReminderModal = () => {
  const { isReminderActive, dismissReminder, resetContinuous } = useTrackerStore();

  const handleDismiss = () => {
    dismissReminder();
  };

  const handleTakeBreak = () => {
    resetContinuous();
    // In a real app we might pause the music here,
    // but a gentle reminder leaves standard controls to the user.
    dismissReminder();
  };

  return (
    <AnimatePresence>
      {isReminderActive && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
            className="glass relative w-full max-w-sm rounded-2xl p-6 border border-white/10 shadow-2xl pointer-events-auto"
          >
            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center mt-2">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
                 <Coffee className="w-8 h-8 text-amber-400" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Time for a Break?</h3>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                You've been listening to music continuously for {Math.round(BREAK_THRESHOLD / 60)} minutes. 
                Consider resting your ears or taking a short walk! 😊
              </p>

              <div className="flex gap-3 w-full">
                <button 
                  onClick={handleDismiss}
                  className="flex-1 py-3 px-4 glass rounded-xl font-medium text-white hover:bg-white/10 transition-colors text-sm"
                >
                  Dismiss
                </button>
                <button 
                  onClick={handleTakeBreak}
                  className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-colors text-sm shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                >
                  Okay, I will!
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
