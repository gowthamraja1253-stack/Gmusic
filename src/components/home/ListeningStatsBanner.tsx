'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrackerStore } from '@/store/useTrackerStore';
import { Headphones } from 'lucide-react';

export const ListeningStatsBanner = () => {
  const { totalListenedSeconds } = useTrackerStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || totalListenedSeconds === 0) return null;

  const hours = Math.floor(totalListenedSeconds / 3600);
  const minutes = Math.floor((totalListenedSeconds % 3600) / 60);

  let timeString = '';
  if (hours > 0) timeString += `${hours} hour${hours > 1 ? 's' : ''} `;
  if (minutes > 0) timeString += `${minutes} minute${minutes > 1 ? 's' : ''}`;
  if (hours === 0 && minutes === 0) timeString = "less than a minute";

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-6 flex items-center justify-center md:justify-start gap-3"
      >
        <div className="glass px-5 py-3 rounded-2xl flex items-center gap-3 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
          <div className="bg-primary/20 p-2 rounded-full">
            <Headphones className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm md:text-base text-gray-300 font-medium tracking-wide">
            You've listened for <span className="text-white font-bold">{timeString.trim()}</span> today
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
