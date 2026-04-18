'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export const WelcomeModal = () => {
  const { userName, saveUserName, isReady } = useUserPreferences();
  const [inputName, setInputName] = useState('');
  
  // Show modal if hooks are ready, and we don't have a username yet
  const showModal = isReady && !userName;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      saveUserName(inputName.trim());
    }
  };

  return (
    <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="glass relative w-full max-w-md rounded-2xl p-8 border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Subtle Gradient Backlighting */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/30 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
                Welcome to Gmusic
              </h2>
              <p className="text-gray-300 mb-8">
                To personalize your music experience, what should we call you?
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input 
                  type="text" 
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  autoFocus
                  maxLength={20}
                />
                
                <button 
                  type="submit"
                  disabled={!inputName.trim()}
                  className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(236,72,153,0.3)] shadow-primary/20"
                >
                  Start Listening
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
