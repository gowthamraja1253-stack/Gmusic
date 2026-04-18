'use client';

import React, { useEffect, useState } from 'react';
import { fetchLatestTamil, fetchTrendingTamil } from '@/lib/api';
import { SongCard } from '@/components/shared/SongCard';
import { Song } from '@/types';
import { Sparkles, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Explore() {
  const [latest, setLatest] = useState<Song[]>([]);
  const [trending, setTrending] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [latestData, trendingData] = await Promise.all([
        fetchLatestTamil(),
        fetchTrendingTamil()
      ]);
      setLatest(latestData);
      setTrending(trendingData);
      setLoading(false);
    };
    loadData();
  }, []);

  const renderSkeletons = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="animate-pulse flex flex-col gap-3">
          <div className="aspect-square bg-gray-800 rounded-xl" />
          <div className="h-4 bg-gray-800 rounded w-3/4" />
          <div className="h-3 bg-gray-800 rounded w-1/2" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Flame className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Top Trending Tamil</h1>
          </div>
          
          {loading ? renderSkeletons() : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {trending.map((song) => (
                <SongCard key={song.id} song={song} queue={trending} />
              ))}
            </div>
          )}
        </section>

        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold">Latest Releases</h2>
          </div>
          
          {loading ? renderSkeletons() : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {latest.map((song) => (
                <SongCard key={song.id} song={song} queue={latest} />
              ))}
            </div>
          )}
        </section>
      </motion.div>
    </div>
  );
}
