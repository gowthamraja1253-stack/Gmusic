'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useTrackerStore } from '@/store/useTrackerStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';
import { getPlayUrl, getHighestQualityImage } from '@/lib/api';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ChevronDown, Maximize2, ListMusic, Shuffle, Repeat, Repeat1, Disc, Mic2 } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { PlaylistModal } from '@/components/shared/PlaylistModal';
import { LyricsVisualizer } from './LyricsVisualizer';
import { QueueManager } from './QueueManager';

type TabView = 'artwork' | 'lyrics' | 'queue';

export const MusicPlayer = () => {
  const { currentSong, isPlaying, volume, isShuffle, repeatMode, lastProgress, setIsPlaying, playNext, playPrevious, setVolume, toggleShuffle, toggleRepeat, setLastProgress } = usePlayerStore();
  const { tick } = useTrackerStore();
  const { activeProfileId } = useProfileStore();
  const { incrementListeningTime, trackSongPlay } = useAnalyticsStore();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [progress, setProgress] = useState(lastProgress || 0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabView>('artwork');
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  
  // To avoid duplicate tracking per song load
  const lastTrackedSongId = useRef<string | null>(null);

  // Apply Continue Listening initial progress exactly once per song load if needed
  useEffect(() => {
    if (audioRef.current && currentSong && lastProgress > 0 && Math.abs(audioRef.current.currentTime - lastProgress) > 2 && !isPlaying) {
      audioRef.current.currentTime = lastProgress;
      setProgress(lastProgress);
    }
  }, [currentSong]);

  // Analytics & Tracker Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        tick(); // legacy global tracker
        if (activeProfileId) {
          incrementListeningTime(activeProfileId);
        }
        
        // Save current progress for persistent "Continue Listening" state every 2 seconds
        if (audioRef.current && Math.floor(audioRef.current.currentTime) % 2 === 0) {
          setLastProgress(audioRef.current.currentTime);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeProfileId]);

  // Track New Song Play 
  useEffect(() => {
    if (currentSong && activeProfileId && lastTrackedSongId.current !== currentSong.id) {
      trackSongPlay(activeProfileId, currentSong);
      lastTrackedSongId.current = currentSong.id;
    }
  }, [currentSong, activeProfileId]);

  // Core Audio Playback Sync
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Playback prevented:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current && repeatMode === 'one') {
      audioRef.current.loop = true;
    } else if (audioRef.current) {
      audioRef.current.loop = false;
    }
  }, [repeatMode]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setProgress(time);
    setLastProgress(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentSong) return null;

  const audioUrl = getPlayUrl(currentSong.downloadUrl);
  const imageUrl = getHighestQualityImage(currentSong.image);

  return (
    <>
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          if (repeatMode !== 'one') playNext();
        }}
      />

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col"
          >
            {/* Expanded Header */}
            <div className="flex items-center justify-between p-4 md:p-6 shrink-0 border-b border-white/5">
              <button 
                onClick={() => setIsExpanded(false)} 
                className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                title="Minimize player"
              >
                <ChevronDown className="w-8 h-8" />
              </button>
              
              <div className="flex gap-1 md:gap-4 bg-gray-900/50 p-1 rounded-full border border-white/5">
                {(['artwork', 'lyrics', 'queue'] as TabView[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all flex items-center gap-2 ${
                      activeTab === tab ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {tab === 'artwork' && <Disc className="w-4 h-4" />}
                    {tab === 'lyrics' && <Mic2 className="w-4 h-4" />}
                    {tab === 'queue' && <ListMusic className="w-4 h-4" />}
                    <span className="hidden sm:inline capitalize">{tab}</span>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setIsPlaylistModalOpen(true)}
                className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                title="Add to Playlist"
              >
                <ListMusic className="w-6 h-6 md:w-7 md:h-7" />
              </button>
            </div>

            {/* TAB CONTENT AREAS */}
            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence mode="wait">
                
                {/* ARTWORK TAB */}
                {activeTab === 'artwork' && (
                  <motion.div 
                    key="artwork"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-md mx-auto overflow-y-auto custom-scrollbar"
                  >
                    <motion.div 
                      className="relative w-full aspect-square max-h-[40vh] sm:max-h-[50vh] rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 mb-6 shrink-0 bg-gray-900"
                    >
                      <Image src={imageUrl} alt="Thumbnail" fill className="object-cover" priority />
                    </motion.div>
                    <div className="w-full text-center mb-6 shrink-0 px-2 lg:px-0">
                      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 truncate" dangerouslySetInnerHTML={{ __html: currentSong.name }}></h2>
                      <p className="text-base sm:text-lg text-gray-400 truncate">
                        {currentSong.artists?.primary?.map(a => a.name).join(', ')}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* LYRICS TAB */}
                {activeTab === 'lyrics' && (
                  <motion.div 
                    key="lyrics"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute inset-0"
                  >
                    <LyricsVisualizer song={currentSong} progress={progress} duration={duration} />
                  </motion.div>
                )}

                {/* QUEUE TAB */}
                {activeTab === 'queue' && (
                  <motion.div 
                    key="queue"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="absolute inset-0 max-w-3xl mx-auto"
                  >
                    <QueueManager />
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* SHARED CONTROLS FOOTER */}
            <div className="shrink-0 p-4 sm:p-8 bg-black/40 backdrop-blur-md border-t border-white/5 w-full max-w-4xl mx-auto flex flex-col items-center">
              {/* Progress Bar */}
              <div className="w-full max-w-xl mb-4 px-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={progress}
                  onChange={handleSeek}
                  className="w-full h-1.5 sm:h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-pink-500 transition-all"
                />
                <div className="flex justify-between text-xs sm:text-sm text-gray-400 mt-2 font-medium px-1">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Primary Player Controls */}
              <div className="w-full max-w-md flex items-center justify-between shrink-0 px-2 sm:px-0">
                <button 
                  onClick={toggleShuffle} 
                  className={`transition-all hover:scale-110 active:scale-95 ${isShuffle ? 'text-primary drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]' : 'text-gray-500 hover:text-white'}`}
                  title="Shuffle Queue"
                >
                  <Shuffle className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>
                
                <div className="flex items-center gap-6 sm:gap-10">
                  <button onClick={playPrevious} className="text-gray-300 hover:text-white transition-all hover:scale-110 active:scale-95">
                    <SkipBack className="w-8 h-8 sm:w-10 sm:h-10" />
                  </button>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-primary hover:bg-pink-500 text-white rounded-full p-4 sm:p-5 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(236,72,153,0.3)]"
                  >
                    {isPlaying ? <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-current" /> : <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />}
                  </button>
                  <button onClick={playNext} className="text-gray-300 hover:text-white transition-all hover:scale-110 active:scale-95">
                    <SkipForward className="w-8 h-8 sm:w-10 sm:h-10" />
                  </button>
                </div>

                <button 
                  onClick={toggleRepeat} 
                  className={`transition-all hover:scale-110 active:scale-95 relative ${repeatMode !== 'none' ? 'text-primary drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]' : 'text-gray-500 hover:text-white'}`}
                  title={repeatMode === 'none' ? 'Repeat All' : repeatMode === 'all' ? 'Repeat One' : 'Turn Off Repeat'}
                >
                  {repeatMode === 'one' ? <Repeat1 className="w-6 h-6 sm:w-7 sm:h-7" /> : <Repeat className="w-6 h-6 sm:w-7 sm:h-7" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Player */}
      <div className={`fixed bottom-0 left-0 right-0 glass-panel z-50 transition-transform duration-500 ${isExpanded ? 'translate-y-full' : 'translate-y-0 animate-in slide-in-from-bottom-full'}`}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
          <div 
            className="h-full bg-primary relative" 
            style={{ width: `${(progress / duration) * 100 || 0}%` }}
          >
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={progress}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-3 sm:px-6 md:px-8 h-16 sm:h-20 max-w-7xl mx-auto">
          {/* Track Info */}
          <div 
            className="flex items-center gap-3 w-[45%] sm:w-1/3 min-w-0 cursor-pointer group"
            onClick={() => setIsExpanded(true)}
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-md overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
              <Image src={imageUrl} alt="Thumbnail" fill className={`object-cover ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-white font-medium truncate text-sm md:text-base group-hover:text-primary transition-colors" dangerouslySetInnerHTML={{ __html: currentSong.name }}></h4>
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {currentSong.artists?.primary?.map(a => a.name).join(', ')}
              </p>
            </div>
          </div>

          {/* Mini Controls */}
          <div className="flex items-center justify-center w-[55%] sm:w-1/3 gap-3 sm:gap-6">
            <button 
              onClick={() => setIsPlaylistModalOpen(true)}
              className="text-gray-400 hover:text-white transition-colors sm:hidden border border-gray-600 rounded-full p-1"
            >
              <ListMusic className="w-4 h-4" />
            </button>
            <button onClick={playPrevious} className="text-gray-400 hover:text-white transition-colors hidden sm:block">
              <SkipBack className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-white text-black rounded-full p-2 hover:scale-105 active:scale-95 transition-transform"
            >
              {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />}
            </button>
            <button onClick={playNext} className="text-gray-400 hover:text-white transition-colors">
              <SkipForward className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          <div className="items-center justify-end gap-4 w-1/3 hidden sm:flex">
            <button 
              onClick={() => {
                setActiveTab('queue');
                setIsExpanded(true);
              }}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
              title="View Queue"
            >
              <ListMusic className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMuted(!isMuted)} className="text-gray-400 hover:text-white transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setIsMuted(false);
                  setVolume(parseFloat(e.target.value));
                }}
                className="w-20 lg:w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        </div>
      </div>

      <PlaylistModal 
        isOpen={isPlaylistModalOpen} 
        onClose={() => setIsPlaylistModalOpen(false)} 
        songToAdd={currentSong} 
      />
    </>
  );
};
