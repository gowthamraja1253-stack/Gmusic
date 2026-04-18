'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore, AppNotification } from '@/store/useNotificationStore';
import { Info, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export const ToastProvider = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed bottom-24 right-4 z-[300] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <ToastItem 
            key={notification.id} 
            notification={notification} 
            onClose={() => removeNotification(notification.id)} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem = ({ notification, onClose }: { notification: AppNotification, onClose: () => void }) => {
  const icons = {
    info: <Info className="w-5 h-5 text-blue-400" />,
    success: <CheckCircle2 className="w-5 h-5 text-green-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      layout
      className="bg-gray-900 border border-white/10 rounded-xl shadow-2xl p-4 flex items-start gap-3 w-[300px] pointer-events-auto backdrop-blur-md"
    >
      <div className="shrink-0 mt-0.5">
        {icons[notification.type]}
      </div>
      <div className="flex-1">
        {notification.title && <h4 className="text-white text-sm font-semibold mb-1">{notification.title}</h4>}
        <p className="text-gray-300 text-sm leading-tight">{notification.message}</p>
      </div>
      <button 
        onClick={onClose}
        className="shrink-0 text-gray-500 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
