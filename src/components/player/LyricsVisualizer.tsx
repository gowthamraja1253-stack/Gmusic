'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Song } from '@/types';
import { fetchLyrics, ParsedLyric } from '@/lib/lyrics';
import { Loader2, Music } from 'lucide-react';

export const LyricsVisualizer = ({ song, progress, duration }: { song: Song, progress: number, duration: number }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [lyrics, setLyrics] = useState<ParsedLyric[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch logic
  useEffect(() => {
    let active = true;

    const loadLyrics = async () => {
      setLoading(true);
      setErrorMsg(null);
      
      const artistQuery = song.artists?.primary?.[0]?.name || '';
      const data = await fetchLyrics(song.name, artistQuery);
      
      if (!active) return;

      if (data.error) {
        setErrorMsg(data.error);
        setLyrics([]);
      } else if (data.syncedLyrics && data.syncedLyrics.length > 0) {
        setLyrics(data.syncedLyrics);
        setErrorMsg(null);
      } else {
        setErrorMsg('Lyrics not available or not synced for this track.');
        setLyrics([]);
      }
      setLoading(false);
    };

    loadLyrics();

    return () => { active = false; };
  }, [song.id, song.name, song.artists]);

  // Sync Logic - Find the active lyric index based on actual time
  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    // We give a tiny 0.2s buffer so it lights up exactly as the word hits
    if (progress + 0.2 >= lyrics[i].time) {
      activeIndex = i;
    }
  }

  // Auto-scroll logic targeting the specific child element
  useEffect(() => {
    if (activeIndex >= 0 && scrollRef.current && !loading && !errorMsg) {
      const activeElement = scrollRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        scrollRef.current.scrollTo({
          top: activeElement.offsetTop - scrollRef.current.clientHeight / 2 + activeElement.clientHeight / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex, loading, errorMsg]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="animate-pulse">Locating synced lyrics...</p>
      </div>
    );
  }

  if (errorMsg || lyrics.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-400 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
          <Music className="w-8 h-8 opacity-50" />
        </div>
        <p className="text-xl font-medium text-white">{errorMsg}</p>
        <p className="text-sm">Enjoy the music while we work on bringing these words to life.</p>
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      className="w-full h-full flex flex-col items-center gap-8 overflow-y-auto px-4 py-[40vh] custom-scrollbar"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
      }}
    >
      {lyrics.map((line, idx) => {
        const isActive = idx === activeIndex;
        const isPast = idx < activeIndex;
        
        return (
          <motion.div
            key={idx}
            animate={{ 
              scale: isActive ? 1.15 : 1,
              opacity: isActive ? 1 : isPast ? 0.3 : 0.15
            }}
            transition={{ duration: 0.4 }}
            className={`text-center font-bold transition-all duration-300 max-w-sm cursor-pointer ${
              isActive ? 'text-3xl sm:text-4xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'text-2xl sm:text-3xl text-gray-300'
            }`}
          >
            {line.text}
          </motion.div>
        );
      })}
    </div>
  );
};
