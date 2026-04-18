'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Pause, Heart } from 'lucide-react';
import { Song } from '@/types';
import { getHighestQualityImage } from '@/lib/api';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useFavorites } from '@/hooks/useFavorites';
import { motion } from 'framer-motion';

export const SongCard = ({ song, queue }: { song: Song, queue: Song[] }) => {
  const { currentSong, isPlaying, setCurrentSong, setQueue, setIsPlaying } = usePlayerStore();
  const { isFavorite, toggleFavorite } = useFavorites();

  const isCurrent = currentSong?.id === song.id;
  const isHearted = isFavorite(song.id);

  const handlePlayPause = () => {
    if (isCurrent) {
      setIsPlaying(!isPlaying);
    } else {
      setQueue(queue);
      setCurrentSong(song);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(song);
  };

  const imageUrl = getHighestQualityImage(song.image);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="glass rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
      onClick={handlePlayPause}
    >
      <div className="relative aspect-square overflow-hidden">
        <Image 
          src={imageUrl} 
          alt={song.name} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Play Overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <div className="bg-primary/90 text-white rounded-full p-4 transform transition-transform hover:scale-110">
            {isCurrent && isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </div>
        </div>

        {/* Favorite Button Overlay */}
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-10"
        >
          <Heart className={`w-5 h-5 transition-colors ${isHearted ? 'fill-primary text-primary' : ''}`} />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white truncate" dangerouslySetInnerHTML={{ __html: song.name }}></h3>
        <p className="text-sm text-gray-400 truncate mt-1">
          {song.artists?.primary?.map(a => a.name).join(', ') || 'Unknown Artist'}
        </p>
      </div>
    </motion.div>
  );
};
