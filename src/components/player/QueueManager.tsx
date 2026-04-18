'use client';

import React, { useState } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { getHighestQualityImage } from '@/lib/api';
import { Trash2, GripVertical, Play } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export const QueueManager = () => {
  const { queue, currentSong, reorderQueue, removeFromQueue, setCurrentSong } = usePlayerStore();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: any, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: any, dropIndex: number) => {
    e.preventDefault();
    const draggedItem = e.dataTransfer.getData('text/plain');

    if (draggedItem !== '') {
      const dragIndex = parseInt(draggedItem, 10);
      if (dragIndex !== dropIndex) {
        reorderQueue(dragIndex, dropIndex);
      }
    }

    setDraggedIndex(null);
  };

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <p>No songs in queue</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto px-2 sm:px-6 py-4 pb-32">
      <h3 className="text-xl font-bold text-white mb-6">
        Next In Queue
      </h3>

      <div className="flex flex-col gap-2">
        {queue.map((song, index) => {
          const isCurrent = currentSong?.id === song.id;

          return (
            <motion.div
              key={`${song.id}-${index}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={() => setDraggedIndex(null)}
              className={`flex items-center gap-4 p-3 rounded-xl ${isCurrent
                  ? 'bg-primary/20'
                  : draggedIndex === index
                    ? 'bg-white/10 opacity-50'
                    : 'hover:bg-white/5'
                }`}
            >
              <div className="text-gray-500 cursor-grab">
                <GripVertical className="w-5 h-5" />
              </div>

              <div className="relative w-12 h-12 rounded-md overflow-hidden">
                <Image
                  src={getHighestQualityImage(song.image)}
                  alt={song.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="truncate text-white">{song.name}</p>
                <p className="truncate text-xs text-gray-400">
                  {song.artists?.primary?.map((a: any) => a.name).join(', ')}
                </p>
              </div>

              <button
                onClick={() => setCurrentSong(song)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <Play className="w-5 h-5" />
              </button>

              <button
                onClick={() => removeFromQueue(index)}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};