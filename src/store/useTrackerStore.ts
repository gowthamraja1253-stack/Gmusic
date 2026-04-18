import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 30 minutes in seconds
export const BREAK_THRESHOLD = 30 * 60; 

interface TrackerState {
  totalListenedSeconds: number;
  continuousSeconds: number;
  hasDismissedReminder: boolean;
  isReminderActive: boolean;

  tick: () => void;
  resetContinuous: () => void;
  dismissReminder: () => void;
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set, get) => ({
      totalListenedSeconds: 0,
      continuousSeconds: 0,
      hasDismissedReminder: false,
      isReminderActive: false,

      tick: () => {
        const { continuousSeconds, totalListenedSeconds, hasDismissedReminder } = get();
        
        const newContinuous = continuousSeconds + 1;
        
        let shouldShowReminder = false;
        if (newContinuous >= BREAK_THRESHOLD && !hasDismissedReminder) {
          shouldShowReminder = true;
        }

        set({
          totalListenedSeconds: totalListenedSeconds + 1,
          continuousSeconds: newContinuous,
          // Only trigger popup if not dismissed
          isReminderActive: shouldShowReminder
        });
      },

      resetContinuous: () => set({ 
        continuousSeconds: 0, 
        hasDismissedReminder: false,
        isReminderActive: false
      }),

      dismissReminder: () => set({ 
        hasDismissedReminder: true,
        isReminderActive: false
      })
    }),
    {
      name: 'tamil-beats-listening-time', // key in local storage
      storage: createJSONStorage(() => localStorage),
      // Prevent syncing modal/continuous state across hard reloads unless preferred, 
      // but keeping it simple by storing everything helps avoid loss of data.
      partialize: (state) => ({ totalListenedSeconds: state.totalListenedSeconds })
    }
  )
);
