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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      reorderQueue(draggedIndex, dropIndex);
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
    <div className="w-full h-full overflow-y-auto custom-scrollbar px-2 sm:px-6 py-4 pb-32">
      <h3 className="text-xl font-bold text-white mb-6 sticky top-0 bg-gray-900/90 backdrop-blur-md py-4 z-10 border-b border-white/10">
        Next In Queue
      </h3>
      
      <div className="flex flex-col gap-2">
        {queue.map((song, index) => {
          const isCurrent = currentSong?.id === song.id;
          return (
            <motion.div
              layout
              key={`${song.id}-${index}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={() => setDraggedIndex(null)}
              className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                isCurrent 
                  ? 'bg-primary/20 border border-primary/30' 
                  : draggedIndex === index
                  ? 'bg-white/10 opacity-50'
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="text-gray-500 cursor-grab active:cursor-grabbing hover:text-white px-1">
                <GripVertical className="w-5 h-5" />
              </div>
              
              <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0 group">
                <Image 
                  src={getHighestQualityImage(song.image)} 
                  alt={song.name} 
                  fill 
                  className="object-cover"
                />
                {!isCurrent && (
                  <div 
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                    onClick={() => setCurrentSong(song)}
                  >
                    <Play className="w-5 h-5 text-white fill-current" />
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="flex gap-1 h-3 items-end">
                      <div className="w-1 bg-primary h-[40%] animate-[bounce_1s_infinite]"></div>
                      <div className="w-1 bg-primary h-[100%] animate-[bounce_1s_infinite_0.2s]"></div>
                      <div className="w-1 bg-primary h-[60%] animate-[bounce_1s_infinite_0.4s]"></div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`truncate font-medium ${isCurrent ? 'text-primary' : 'text-white'}`} dangerouslySetInnerHTML={{ __html: song.name }}></p>
                <p className="truncate text-xs text-gray-400">
                  {song.artists?.primary?.map(a => a.name).join(', ')}
                </p>
              </div>

              <button 
                onClick={() => removeFromQueue(index)}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                title="Remove from queue"
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
