'use client';

import React, { useEffect, useEffectEvent, useRef, useState } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useTrackerStore } from '@/store/useTrackerStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';
import { getHighestQualityImage } from '@/lib/api';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ChevronDown,
  Maximize2,
  ListMusic,
  Shuffle,
  Repeat,
  Repeat1,
  Disc,
  Mic2,
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { PlaylistModal } from '@/components/shared/PlaylistModal';
import { LyricsVisualizer } from './LyricsVisualizer';
import { QueueManager } from './QueueManager';

type TabView = 'artwork' | 'lyrics' | 'queue';
type YouTubePlayerState = -1 | 0 | 1 | 2 | 3 | 5;

interface YouTubePlayer {
  cueVideoById(options: { videoId: string; startSeconds?: number }): void;
  loadVideoById(options: { videoId: string; startSeconds?: number }): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead?: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  setVolume(volume: number): void;
  destroy(): void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        config: {
          height: string;
          width: string;
          playerVars: Record<string, number | string>;
          events: {
            onReady: () => void;
            onStateChange: (event: { data: YouTubePlayerState }) => void;
            onError: (event: { data: number }) => void;
          };
        },
      ) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export const MusicPlayer = () => {
  const {
    currentSong,
    isPlaying,
    volume,
    isShuffle,
    repeatMode,
    lastProgress,
    setIsPlaying,
    playNext,
    playPrevious,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    setLastProgress,
  } = usePlayerStore();
  const { tick } = useTrackerStore();
  const { activeProfileId } = useProfileStore();
  const { incrementListeningTime, trackSongPlay } = useAnalyticsStore();

  const playerHostWrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const lastTrackedSongId = useRef<string | null>(null);
  const loadedSongIdRef = useRef<string | null>(null);
  const lastProgressRef = useRef(lastProgress);

  const [progress, setProgress] = useState(lastProgress || 0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabView>('artwork');
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isPlayerApiReady, setIsPlayerApiReady] = useState(
    () => typeof window !== 'undefined' && Boolean(window.YT?.Player),
  );
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    lastProgressRef.current = lastProgress;
  }, [lastProgress]);

  const syncPlayerSnapshot = useEffectEvent(() => {
    const player = playerRef.current;
    if (!player) return;

    const nextProgress = player.getCurrentTime() || 0;
    const nextDuration = player.getDuration() || 0;
    setProgress(nextProgress);
    setDuration(nextDuration);
  });

  const handlePlayerStateChange = useEffectEvent((state: YouTubePlayerState) => {
    if (state === 1) {
      syncPlayerSnapshot();
      setIsPlaying(true);
      return;
    }

    if (state === 2 || state === 5) {
      syncPlayerSnapshot();
      setLastProgress(playerRef.current?.getCurrentTime() || 0);
      setIsPlaying(false);
      return;
    }

    if (state === 0) {
      setProgress(0);
      setLastProgress(0);

      if (repeatMode === 'one' && currentSong) {
        playerRef.current?.seekTo(0, true);
        playerRef.current?.playVideo();
        return;
      }

      playNext();
    }
  });

  const handlePlayerError = useEffectEvent((errorCode: number) => {
    console.error('YouTube player error:', errorCode, currentSong?.id);
    setIsPlaying(false);
  });

  useEffect(() => {
    if (window.YT?.Player) {
      return;
    }

    const previousReadyHandler = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReadyHandler?.();
      setIsPlayerApiReady(true);
    };

    if (!document.getElementById('youtube-iframe-api')) {
      const script = document.createElement('script');
      script.id = 'youtube-iframe-api';
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.head.appendChild(script);
    }

    return () => {
      if (window.onYouTubeIframeAPIReady === previousReadyHandler) {
        return;
      }

      window.onYouTubeIframeAPIReady = previousReadyHandler;
    };
  }, []);

  useEffect(() => {
    const wrapper = playerHostWrapperRef.current;

    if (!isPlayerApiReady || !wrapper || playerRef.current || !window.YT?.Player) {
      return;
    }

    const hostElement = document.createElement('div');
    wrapper.replaceChildren(hostElement);

    playerRef.current = new window.YT.Player(hostElement, {
      height: '0',
      width: '0',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        origin: window.location.origin,
      },
      events: {
        onReady: () => setIsPlayerReady(true),
        onStateChange: (event) => handlePlayerStateChange(event.data),
        onError: (event) => handlePlayerError(event.data),
      },
    });

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
      loadedSongIdRef.current = null;
      wrapper.replaceChildren();
    };
  }, [isPlayerApiReady]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    player.setVolume(Math.round((isMuted ? 0 : volume) * 100));
  }, [volume, isMuted]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isPlayerReady || !currentSong) {
      return;
    }

    const isNewSong = loadedSongIdRef.current !== currentSong.id;

    if (isNewSong) {
      loadedSongIdRef.current = currentSong.id;
      const startSeconds = Math.max(lastProgressRef.current, 0);
      setProgress(startSeconds);

      if (isPlaying) {
        player.loadVideoById({ videoId: currentSong.id, startSeconds });
      } else {
        player.cueVideoById({ videoId: currentSong.id, startSeconds });
      }

      return;
    }

    if (isPlaying) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [currentSong, isPlayerReady, isPlaying]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isPlaying) {
      interval = setInterval(() => {
        tick();
        syncPlayerSnapshot();

        if (activeProfileId) {
          incrementListeningTime(activeProfileId);
        }

        const currentTime = playerRef.current?.getCurrentTime() || 0;
        if (currentTime > 0 && Math.floor(currentTime) % 2 === 0) {
          setLastProgress(currentTime);
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeProfileId, incrementListeningTime, isPlaying, setLastProgress, tick]);

  useEffect(() => {
    if (currentSong && activeProfileId && lastTrackedSongId.current !== currentSong.id) {
      trackSongPlay(activeProfileId, currentSong);
      lastTrackedSongId.current = currentSong.id;
    }
  }, [currentSong, activeProfileId, trackSongPlay]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setProgress(time);
    setLastProgress(time);
    playerRef.current?.seekTo(time, true);
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentSong) return null;

  const imageUrl = getHighestQualityImage(currentSong.image);

  return (
    <>
      <div
        ref={playerHostWrapperRef}
        className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
        aria-hidden="true"
      />

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-3xl"
          >
            <div className="shrink-0 border-b border-white/5 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                  title="Minimize player"
                >
                  <ChevronDown className="h-8 w-8" />
                </button>

                <div className="flex gap-1 rounded-full border border-white/5 bg-gray-900/50 p-1 md:gap-4">
                  {(['artwork', 'lyrics', 'queue'] as TabView[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-all md:text-sm ${
                        activeTab === tab ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {tab === 'artwork' && <Disc className="h-4 w-4" />}
                      {tab === 'lyrics' && <Mic2 className="h-4 w-4" />}
                      {tab === 'queue' && <ListMusic className="h-4 w-4" />}
                      <span className="hidden capitalize sm:inline">{tab}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsPlaylistModalOpen(true)}
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                  title="Add to Playlist"
                >
                  <ListMusic className="h-6 w-6 md:h-7 md:w-7" />
                </button>
              </div>
            </div>

            <div className="relative flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === 'artwork' && (
                  <motion.div
                    key="artwork"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 mx-auto flex w-full max-w-md flex-col items-center justify-center overflow-y-auto p-4 custom-scrollbar sm:p-6"
                  >
                    <motion.div className="relative mb-6 aspect-square max-h-[40vh] w-full shrink-0 overflow-hidden rounded-2xl bg-gray-900 shadow-2xl shadow-primary/20 sm:max-h-[50vh]">
                      <Image src={imageUrl} alt="Thumbnail" fill className="object-cover" priority unoptimized />
                    </motion.div>
                    <div className="mb-6 w-full shrink-0 px-2 text-center lg:px-0">
                      <h2
                        className="mb-1 truncate text-2xl font-bold text-white sm:text-3xl"
                        dangerouslySetInnerHTML={{ __html: currentSong.name }}
                      />
                      <p className="truncate text-base text-gray-400 sm:text-lg">
                        {currentSong.artists?.primary?.map((artist) => artist.name).join(', ')}
                      </p>
                    </div>
                  </motion.div>
                )}

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

                {activeTab === 'queue' && (
                  <motion.div
                    key="queue"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="absolute inset-0 mx-auto max-w-3xl"
                  >
                    <QueueManager />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mx-auto flex w-full max-w-4xl shrink-0 flex-col items-center border-t border-white/5 bg-black/40 p-4 backdrop-blur-md sm:p-8">
              <div className="mb-4 w-full max-w-xl px-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={progress}
                  onChange={handleSeek}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-800 accent-primary transition-all hover:accent-pink-500 sm:h-2"
                />
                <div className="mt-2 flex justify-between px-1 text-xs font-medium text-gray-400 sm:text-sm">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="w-full max-w-md shrink-0 px-2 sm:px-0">
                <div className="flex items-center justify-between">
                  <button
                    onClick={toggleShuffle}
                    className={`transition-all hover:scale-110 active:scale-95 ${
                      isShuffle
                        ? 'text-primary drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]'
                        : 'text-gray-500 hover:text-white'
                    }`}
                    title="Shuffle Queue"
                  >
                    <Shuffle className="h-6 w-6 sm:h-7 sm:w-7" />
                  </button>

                  <div className="flex items-center gap-6 sm:gap-10">
                    <button
                      onClick={playPrevious}
                      className="text-gray-300 transition-all hover:scale-110 hover:text-white active:scale-95"
                    >
                      <SkipBack className="h-8 w-8 sm:h-10 sm:w-10" />
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="rounded-full bg-primary p-4 text-white shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-all hover:scale-105 hover:bg-pink-500 active:scale-95 sm:p-5"
                    >
                      {isPlaying ? (
                        <Pause className="h-8 w-8 fill-current sm:h-10 sm:w-10" />
                      ) : (
                        <Play className="ml-1 h-8 w-8 fill-current sm:h-10 sm:w-10" />
                      )}
                    </button>
                    <button
                      onClick={playNext}
                      className="text-gray-300 transition-all hover:scale-110 hover:text-white active:scale-95"
                    >
                      <SkipForward className="h-8 w-8 sm:h-10 sm:w-10" />
                    </button>
                  </div>

                  <button
                    onClick={toggleRepeat}
                    className={`relative transition-all hover:scale-110 active:scale-95 ${
                      repeatMode !== 'none'
                        ? 'text-primary drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]'
                        : 'text-gray-500 hover:text-white'
                    }`}
                    title={
                      repeatMode === 'none'
                        ? 'Repeat All'
                        : repeatMode === 'all'
                          ? 'Repeat One'
                          : 'Turn Off Repeat'
                    }
                  >
                    {repeatMode === 'one' ? (
                      <Repeat1 className="h-6 w-6 sm:h-7 sm:w-7" />
                    ) : (
                      <Repeat className="h-6 w-6 sm:h-7 sm:w-7" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`glass-panel fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ${
          isExpanded ? 'translate-y-full' : 'translate-y-0 animate-in slide-in-from-bottom-full'
        }`}
      >
        <div className="absolute left-0 right-0 top-0 h-1 bg-gray-800">
          <div className="relative h-full bg-primary" style={{ width: `${(progress / duration) * 100 || 0}%` }}>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={progress}
              onChange={handleSeek}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>
        </div>

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:h-20 sm:px-6 md:px-8">
          <div
            className="group flex w-[45%] min-w-0 cursor-pointer items-center gap-3 sm:w-1/3"
            onClick={() => setIsExpanded(true)}
          >
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md transition-transform group-hover:scale-105 sm:h-12 sm:w-12 md:h-14 md:w-14">
              <Image
                src={imageUrl}
                alt="Thumbnail"
                fill
                unoptimized
                className={`object-cover ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Maximize2 className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h4
                className="truncate text-sm font-medium text-white transition-colors group-hover:text-primary md:text-base"
                dangerouslySetInnerHTML={{ __html: currentSong.name }}
              />
              <p className="mt-0.5 truncate text-xs text-gray-400">
                {currentSong.artists?.primary?.map((artist) => artist.name).join(', ')}
              </p>
            </div>
          </div>

          <div className="flex w-[55%] items-center justify-center gap-3 sm:w-1/3 sm:gap-6">
            <button
              onClick={() => setIsPlaylistModalOpen(true)}
              className="rounded-full border border-gray-600 p-1 text-gray-400 transition-colors hover:text-white sm:hidden"
            >
              <ListMusic className="h-4 w-4" />
            </button>
            <button onClick={playPrevious} className="hidden text-gray-400 transition-colors hover:text-white sm:block">
              <SkipBack className="h-5 w-5 md:h-6 md:w-6" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="rounded-full bg-white p-2 text-black transition-transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-current sm:h-6 sm:w-6" />
              ) : (
                <Play className="ml-0.5 h-5 w-5 fill-current sm:h-6 sm:w-6" />
              )}
            </button>
            <button onClick={playNext} className="text-gray-400 transition-colors hover:text-white">
              <SkipForward className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>

          <div className="hidden w-1/3 items-center justify-end gap-4 sm:flex">
            <button
              onClick={() => {
                setActiveTab('queue');
                setIsExpanded(true);
              }}
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
              title="View Queue"
            >
              <ListMusic className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMuted(!isMuted)} className="text-gray-400 transition-colors hover:text-white">
                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
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
                className="h-1 w-20 cursor-pointer appearance-none rounded-lg bg-gray-700 accent-primary lg:w-24"
              />
            </div>
          </div>
        </div>
      </div>

      <PlaylistModal isOpen={isPlaylistModalOpen} onClose={() => setIsPlaylistModalOpen(false)} songToAdd={currentSong} />
    </>
  );
};
