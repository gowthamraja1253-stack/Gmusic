'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useTrackerStore } from '@/store/useTrackerStore';
import { getPlayUrl, getHighestQualityImage } from '@/lib/api';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import Image from 'next/image';

export const MusicPlayer = () => {
  const { currentSong, isPlaying, volume, setIsPlaying, playNext, playPrevious, setVolume } = usePlayerStore();
  const { tick, resetContinuous } = useTrackerStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Time tracker engine
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    } else {
      // If we stop completely, we could reset continuous, but pausing usually doesn't mean a "break".
      // Let's reset continuous if the user doesn't play for 5 minutes, OR simply keep it tied to session.
      // For simplicity as requested, we just pause the timer.
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, tick]);

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
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentSong) return null;

  const audioUrl = getPlayUrl(currentSong.downloadUrl);
  const imageUrl = getHighestQualityImage(currentSong.image);

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-panel z-50 animate-in slide-in-from-bottom-full duration-500">
      {/* Progress Bar Top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
        <div 
          className="h-full bg-primary relative" 
          style={{ width: `${(progress / duration) * 100 || 0}%` }}
        >
          {/* Invisible range input overlaid on progress bar for easy seeking */}
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

      <div className="flex items-center justify-between px-4 py-3 md:px-8 h-20 max-w-7xl mx-auto">
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={playNext}
        />
        
        {/* Track Info */}
        <div className="flex items-center gap-4 w-1/3 min-w-0">
          <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-md overflow-hidden flex-shrink-0 animate-spin-slow">
            <Image src={imageUrl} alt="Thumbnail" fill className={`object-cover ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
          </div>
          <div className="min-w-0">
            <h4 className="text-white font-medium truncate text-sm md:text-base" dangerouslySetInnerHTML={{ __html: currentSong.name }}></h4>
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {currentSong.artists?.primary?.map(a => a.name).join(', ')}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center justify-center w-1/3">
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={playPrevious} className="text-gray-400 hover:text-white transition-colors">
              <SkipBack className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-white text-black rounded-full p-2 hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>
            <button onClick={playNext} className="text-gray-400 hover:text-white transition-colors">
              <SkipForward className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
          <div className="hidden md:flex flex-row items-center gap-2 mt-1 text-xs text-gray-400 w-full max-w-md">
            <span>{formatTime(progress)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={progress}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center justify-end gap-3 w-1/3 hidden sm:flex">
          <button onClick={() => setIsMuted(!isMuted)} className="text-gray-400 hover:text-white">
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
            className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>
    </div>
  );
};
