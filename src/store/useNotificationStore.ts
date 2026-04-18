import { create } from 'zustand';

export type NotificationType = 'info' | 'success' | 'warning';

export interface AppNotification {
  id: string;
  message: string;
  title?: string;
  type: NotificationType;
  duration?: number; // ms
}

interface NotificationState {
  notifications: AppNotification[];
  notify: (notification: Omit<AppNotification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  
  notify: (notification) => {
    const id = Date.now().toString() + Math.random().toString();
    const fullNotification = { ...notification, id };
    
    set((state) => ({
      notifications: [...state.notifications, fullNotification]
    }));

    if (notification.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      }, notification.duration || 3000);
    }
  },

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  }))
}));
