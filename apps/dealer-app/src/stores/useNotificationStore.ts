import { create } from "zustand";

export interface NotificationEvent {
  id: string;
  type: string;
  title?: string;
  message?: string;
  body?: string;
  data?: any;
  status?: string;
  batchId?: string;
  createdAt: number;
}

interface NotificationState {
  notifications: NotificationEvent[];
  addNotification: (notification: Omit<NotificationEvent, "id" | "createdAt">) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (notification) => {
    set((state) => {
      // If notification has a batchId, check if we already have one with the same batchId
      if (notification.batchId) {
        const existingIndex = state.notifications.findIndex((n) => n.batchId === notification.batchId);
        if (existingIndex !== -1) {
          const updatedNotifications = [...state.notifications];
          updatedNotifications[existingIndex] = {
            ...updatedNotifications[existingIndex],
            ...notification,
            createdAt: Date.now(), // Refresh timestamp
          };
          return { notifications: updatedNotifications };
        }
      }

      const newNotification = {
        ...notification,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: Date.now(),
      };
      // Keep only the 10 most recent notifications to prevent clutter
      const newNotifications = [newNotification, ...state.notifications].slice(0, 10);
      return { notifications: newNotifications };
    });
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));
