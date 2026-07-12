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
  dismissedToast?: boolean;
}

interface NotificationState {
  notifications: NotificationEvent[];
  addNotification: (notification: Omit<NotificationEvent, "id" | "createdAt">) => void;
  removeNotification: (id: string) => void;
  dismissToast: (id: string) => void;
  markAllAsRead: () => void;
  setNotifications: (notifications: NotificationEvent[]) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (notification) => {
    set((state) => {
      if (notification.batchId) {
        const existingIndex = state.notifications.findIndex((n) => n.batchId === notification.batchId);
        if (existingIndex !== -1) {
          const updatedNotifications = [...state.notifications];
          updatedNotifications[existingIndex] = {
            ...updatedNotifications[existingIndex],
            ...notification,
            createdAt: Date.now(), 
            dismissedToast: false, // pop it up again on update
          };
          return { notifications: updatedNotifications };
        }
      }

      const newNotification = {
        ...notification,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: Date.now(),
        dismissedToast: false,
      };
      const newNotifications = [newNotification, ...state.notifications].slice(0, 50); // Keep up to 50
      return { notifications: newNotifications };
    });
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  dismissToast: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, dismissedToast: true } : n)),
    })),
  markAllAsRead: () => set((state) => ({ 
    notifications: state.notifications.map(n => ({ ...n, status: 'read' })) 
  })),
  setNotifications: (notifications) => set({ notifications: notifications.map(n => ({ ...n, dismissedToast: true })) }), // Historic notifications shouldn't popup
}));
