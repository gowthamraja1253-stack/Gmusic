'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { getTimeState, TimeState } from '@/lib/time';

export const DynamicGreeting = ({ onThemeUpdate }: { onThemeUpdate?: (theme: TimeState) => void }) => {
  const { userName, isReady } = useUserPreferences();
  const [timeState, setTimeState] = useState<TimeState | null>(null);

  useEffect(() => {
    const state = getTimeState();
    setTimeState(state);
    if (onThemeUpdate) {
      onThemeUpdate(state);
    }
  }, [onThemeUpdate]);

  // Don't render until client state rehydrates to avoid hydration mismatch
  if (!isReady || !timeState || !userName) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-4 inline-block px-4 py-1.5 rounded-full glass border border-white/10"
      >
        <span className="text-sm md:text-base font-medium text-gray-200">
          {timeState.greeting}, <span className="text-white font-bold">{userName}</span> 🎧
        </span>
      </motion.div>
    </AnimatePresence>
  );
};
