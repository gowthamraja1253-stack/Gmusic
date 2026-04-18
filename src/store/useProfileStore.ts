import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Profile {
  id: string;
  name: string;
  avatarId: string;
}

interface ProfileState {
  profiles: Profile[];
  activeProfileId: string | null;
  addProfile: (name: string, avatarId: string) => void;
  updateProfile: (id: string, name: string, avatarId: string) => void;
  deleteProfile: (id: string) => void;
  setActiveProfile: (id: string | null) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profiles: [],
      activeProfileId: null,

      addProfile: (name, avatarId) => set((state) => ({
        profiles: [
          ...state.profiles,
          { id: Date.now().toString(), name, avatarId }
        ]
      })),

      updateProfile: (id, name, avatarId) => set((state) => ({
        profiles: state.profiles.map(p => p.id === id ? { ...p, name, avatarId } : p)
      })),

      deleteProfile: (id) => set((state) => {
        const newProfiles = state.profiles.filter(p => p.id !== id);
        return {
          profiles: newProfiles,
          activeProfileId: state.activeProfileId === id ? null : state.activeProfileId
        };
      }),

      setActiveProfile: (id) => set({ activeProfileId: id }),
    }),
    {
      name: 'gmusic-profiles-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
