import { create } from 'zustand';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    body?: string;
    category: string;
    read: boolean;
    created_at: string;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    setFromServer: (notifications: Notification[]) => void;
    addOrUpdate: (notification: Notification) => void;
    remove: (id: string) => void;
    markRead: (id: string) => void;
    markAllRead: () => void;
    setLoading: (loading: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,

    setFromServer: (notifications) =>
        set({
            notifications,
            unreadCount: notifications.filter((n) => !n.read).length,
            isLoading: false,
        }),

    addOrUpdate: (notification) =>
        set((state) => {
            const existingIndex = state.notifications.findIndex((n) => n.id === notification.id);
            let newNotifications: Notification[];

            if (existingIndex >= 0) {
                newNotifications = [...state.notifications];
                newNotifications[existingIndex] = notification;
            } else {
                newNotifications = [notification, ...state.notifications];
            }

            return {
                notifications: newNotifications,
                unreadCount: newNotifications.filter((n) => !n.read).length,
            };
        }),

    remove: (id) =>
        set((state) => {
            const newNotifications = state.notifications.filter((n) => n.id !== id);
            return {
                notifications: newNotifications,
                unreadCount: newNotifications.filter((n) => !n.read).length,
            };
        }),

    markRead: (id) =>
        set((state) => {
            const newNotifications = state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
            );
            return {
                notifications: newNotifications,
                unreadCount: newNotifications.filter((n) => !n.read).length,
            };
        }),

    markAllRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
        })),

    setLoading: (isLoading) => set({ isLoading }),
}));
