'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useProfileStore, Profile } from '@/store/useProfileStore';
import { ProfileFormModal, AVATAR_OPTIONS } from './ProfileFormModal';

export const ProfileSelectionScreen = () => {
  const { profiles, setActiveProfile, deleteProfile } = useProfileStore();
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const handleProfileClick = (profile: Profile) => {
    if (isEditingMode) {
      setEditingProfile(profile);
      setModalOpen(true);
    } else {
      setActiveProfile(profile.id);
    }
  };

  const handleAddNew = () => {
    setEditingProfile(null);
    setModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6 bg-gradient-to-b from-black to-gray-900">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center w-full max-w-5xl"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 drop-shadow-lg">
            {isEditingMode ? 'Manage Profiles' : "Who's Listening?"}
          </h1>

          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-12 mb-16">
            {profiles.map((profile) => {
              const avatar = AVATAR_OPTIONS.find(a => a.id === profile.avatarId) || AVATAR_OPTIONS[0];
              const Icon = avatar.icon;
              
              return (
                <motion.div
                  key={profile.id}
                  whileHover={{ scale: 1.05 }}
                  className="relative flex flex-col items-center gap-4 cursor-pointer group"
                  onClick={() => handleProfileClick(profile)}
                >
                  <div className={`relative w-28 h-28 md:w-36 md:h-36 rounded-xl md:rounded-2xl bg-gradient-to-br ${avatar.color} flex items-center justify-center transition-all shadow-xl ${isEditingMode ? 'opacity-60 scale-95' : 'group-hover:ring-4 group-hover:ring-white group-hover:shadow-white/20'}`}>
                    <Icon className="w-14 h-14 md:w-16 md:h-16 text-white" />
                    
                    {isEditingMode && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl md:rounded-2xl transition-all">
                        <Edit2 className="w-10 h-10 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </div>
                  
                  <span className={`text-lg font-medium transition-colors ${isEditingMode ? 'text-gray-400' : 'text-gray-300 group-hover:text-white'}`}>
                    {profile.name}
                  </span>

                  {isEditingMode && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProfile(profile.id);
                      }}
                      className="absolute -bottom-10 p-2 text-gray-500 hover:text-red-500 transition-colors bg-black/50 rounded-full hover:bg-black/80"
                      title="Delete Profile"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </motion.div>
              );
            })}

            {profiles.length < 5 && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center gap-4 cursor-pointer group"
                onClick={handleAddNew}
              >
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-xl md:rounded-2xl border-2 border-dashed border-gray-600 flex items-center justify-center group-hover:bg-white/5 group-hover:border-white transition-all">
                  <Plus className="w-12 h-12 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <span className="text-lg font-medium text-gray-400 group-hover:text-white transition-colors">
                  Add Profile
                </span>
              </motion.div>
            )}
          </div>

          {(profiles.length > 0 || isEditingMode) && (
            <button
              onClick={() => setIsEditingMode(!isEditingMode)}
              className="px-6 py-2 border border-gray-500 text-gray-400 hover:text-white hover:border-white uppercase tracking-widest text-sm font-medium transition-colors rounded-sm"
            >
              {isEditingMode ? 'Done' : 'Manage Profiles'}
            </button>
          )}
        </motion.div>
      </AnimatePresence>

      <ProfileFormModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        editProfile={editingProfile} 
      />
    </div>
  );
};
