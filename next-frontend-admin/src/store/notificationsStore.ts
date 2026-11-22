import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Appointment } from '@/services/appointment.service';

interface NotificationState {
    notifications: Appointment[];
    dismissedIds: number[];
    unreadCount: number;
    isInitialized: boolean;
    syncAppointments: (fetchedAppointments: Appointment[]) => Appointment[];
    addNotifications: (newAppointments: Appointment[]) => void;
    removeNotification: (id: number) => void;
    clearAllNotifications: () => void;
    clearUnread: () => void;
    resetStore: () => void;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            notifications: [],
            dismissedIds: [],
            unreadCount: 0,
            isInitialized: false,

            syncAppointments: (fetchedAppointments) => {
                if (!fetchedAppointments || fetchedAppointments.length === 0) {
                    return [];
                }

                const state = get();

                // Inicialización única la primera vez que se entra al sistema:
                // Solo precargamos citas iniciales si nunca fue inicializado y no hay historial previo
                if (!state.isInitialized && state.dismissedIds.length === 0 && state.notifications.length === 0) {
                    const initialList = fetchedAppointments.slice(0, 15);
                    set({
                        isInitialized: true,
                        notifications: initialList,
                        dismissedIds: [],
                        unreadCount: 0,
                    });
                    return [];
                }

                if (!state.isInitialized) {
                    set({ isInitialized: true });
                }

                const currentMap = new Map(state.notifications.map((n) => [n.id, n]));

                // Detectar citas genuinamente nuevas
                const brandNewAppointments = fetchedAppointments.filter(
                    (app) => !currentMap.has(app.id) && !state.dismissedIds.includes(app.id)
                );

                // Actualizar citas existentes con datos frescos (estado, horario, etc.)
                const updatedNotifications = state.notifications.map((existing) => {
                    const fresh = fetchedAppointments.find((f) => f.id === existing.id);
                    return fresh ? { ...existing, ...fresh } : existing;
                });

                if (brandNewAppointments.length > 0) {
                    set({
                        notifications: [...brandNewAppointments, ...updatedNotifications],
                        unreadCount: state.unreadCount + brandNewAppointments.length,
                    });
                    return brandNewAppointments;
                } else {
                    set({
                        notifications: updatedNotifications,
                    });
                    return [];
                }
            },

            addNotifications: (newAppointments) => {
                if (!newAppointments || newAppointments.length === 0) return;

                set((state) => {
                    const uniqueNew = newAppointments.filter(
                        (newApp) => 
                            !state.notifications.some((existing) => existing.id === newApp.id) &&
                            !state.dismissedIds.includes(newApp.id)
                    );

                    if (uniqueNew.length === 0) return state;

                    return {
                        notifications: [...uniqueNew, ...state.notifications],
                        unreadCount: state.unreadCount + uniqueNew.length,
                    };
                });
            },

            removeNotification: (id) => set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id),
                dismissedIds: Array.from(new Set([...state.dismissedIds, id])).slice(-300),
            })),

            clearAllNotifications: () => set((state) => ({ 
                dismissedIds: Array.from(new Set([...state.dismissedIds, ...state.notifications.map((n) => n.id)])).slice(-300),
                notifications: [],
                unreadCount: 0,
            })),

            clearUnread: () => set({ unreadCount: 0 }),

            resetStore: () => set({
                notifications: [],
                dismissedIds: [],
                unreadCount: 0,
                isInitialized: false,
            }),
        }),
        {
            name: 'admin-notifications-storage',
            partialize: (state) => ({
                notifications: state.notifications,
                dismissedIds: state.dismissedIds,
                unreadCount: state.unreadCount,
                isInitialized: state.isInitialized,
            }),
        }
    )
);
