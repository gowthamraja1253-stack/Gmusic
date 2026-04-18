'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfileStore } from '@/store/useProfileStore';
import { getTimeState, TimeState } from '@/lib/time';

export const DynamicGreeting = ({ onThemeUpdate }: { onThemeUpdate?: (theme: TimeState) => void }) => {
  const { profiles, activeProfileId } = useProfileStore();
  const [timeState, setTimeState] = useState<TimeState | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const state = getTimeState();
    setTimeState(state);
    if (onThemeUpdate) {
      onThemeUpdate(state);
    }
  }, [onThemeUpdate]);

  if (!mounted || !timeState || !activeProfileId) return null;

  const activeProfile = profiles.find(p => p.id === activeProfileId);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-4 inline-block px-4 py-1.5 rounded-full glass border border-white/10"
      >
        <span className="text-sm md:text-base font-medium text-gray-200">
          {timeState.greeting}, <span className="text-white font-bold">{activeProfile?.name || 'Guest'}</span> 🎧
        </span>
      </motion.div>
    </AnimatePresence>
  );
};
