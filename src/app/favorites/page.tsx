'use client';

import React from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import { SongCard } from '@/components/shared/SongCard';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Favorites() {
  const { favorites } = useFavorites();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[70vh]">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-primary fill-primary" />
        <h1 className="text-3xl font-bold">Your Favorites</h1>
      </div>
      
      {favorites.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <Heart className="w-16 h-16 text-gray-700 mb-4" />
          <h2 className="text-xl font-semibold text-gray-300 mb-2">No favorites yet</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Explore the latest Tamil hits and tap the heart icon to save them to your favorites playlist.
          </p>
          <Link href="/explore">
            <button className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-full font-medium transition-colors">
              Explore Music
            </button>
          </Link>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          {favorites.map((song) => (
            <SongCard key={song.id} song={song} queue={favorites} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
