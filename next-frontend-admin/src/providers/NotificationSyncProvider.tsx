"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AppointmentService, Appointment } from "@/services/appointment.service";
import { AuthService } from "@/services/auth.service";
import { API_BASE_URL } from "@/services/api";
import { useNotificationStore } from "@/store/notificationsStore";
import { initAudioOnUserGesture, playNotificationChime } from "@/lib/notification-sound";
import { requestDesktopNotificationPermission, showDesktopNotification } from "@/lib/desktop-notification";
import { initTabTitleListener, notifyTabTitle } from "@/lib/tab-title-notifier";
import { showGroupedAppointmentToast } from "@/lib/notification-toast";

const ACTIVE_POLL_INTERVAL_MS = 8000; // 8 segundos cuando la pestaña está activa (respaldo)
const BACKGROUND_POLL_INTERVAL_MS = 15000; // 15 segundos en segundo plano (respaldo)
const MIN_REFETCH_INTERVAL_MS = 3000; // Mínimo de 3 segundos entre peticiones forzadas

export function NotificationSyncProvider() {
    const queryClient = useQueryClient();
    const isFetchingRef = useRef(false);
    const lastFetchTimeRef = useRef(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    const triggerSensoryAlerts = (newAppointments: Appointment[]) => {
        if (!newAppointments || newAppointments.length === 0) return;

        // 1. Alerta acústica sintetizada (Web Audio API)
        playNotificationChime();

        // 2. Alertas visuales si la pestaña está en segundo plano o minimizada
        if (typeof document !== "undefined" && document.hidden) {
            notifyTabTitle(newAppointments.length);

            if (newAppointments.length === 1) {
                const appt = newAppointments[0];
                const student = appt.user_nombre || appt.usuario_nombre || "Doctorando";
                const topic = appt.materia || "Trámite UGD";
                const time = appt.hora_inicio || "";
                showDesktopNotification({
                    title: "Nueva cita presencial UGD",
                    body: `${student} ha agendado a las ${time} hs. Trámite: ${topic}.`,
                    tag: `ugd-appt-${appt.id}`,
                });
            } else {
                showDesktopNotification({
                    title: "Nuevas citas presenciales UGD",
                    body: `Se han registrado ${newAppointments.length} nuevas citas en la Unidad de Gestión de Doctorados.`,
                    tag: "ugd-multiple-appts",
                });
            }
        }

        // 3. Toast agrupado con control de ráfagas
        showGroupedAppointmentToast(newAppointments.length);

        // 4. Emitir evento para otros componentes
        window.dispatchEvent(
            new CustomEvent<Appointment[]>("ugd:new-appointments", { detail: newAppointments })
        );
    };

    const performSync = async () => {
        if (!AuthService.isAuthenticated()) return;
        if (isFetchingRef.current) return;

        isFetchingRef.current = true;
        try {
            const appointments = await AppointmentService.getAppointments();
            lastFetchTimeRef.current = Date.now();

            const newAppointments = useNotificationStore.getState().syncAppointments(appointments);

            window.dispatchEvent(
                new CustomEvent<Appointment[]>("ugd:appointments-synced", { detail: appointments })
            );

            // Invalidar la caché de TanStack Query para mantener los datos de citas y métricas frescos
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

            if (newAppointments.length > 0) {
                triggerSensoryAlerts(newAppointments);
            }
        } catch (error) {
            console.error("Error en sincronización en segundo plano (UGD):", error);
        } finally {
            isFetchingRef.current = false;
        }
    };

    const scheduleNextPoll = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        const isHidden = typeof document !== "undefined" && document.hidden;
        const interval = isHidden ? BACKGROUND_POLL_INTERVAL_MS : ACTIVE_POLL_INTERVAL_MS;

        timerRef.current = setTimeout(async () => {
            await performSync();
            scheduleNextPoll();
        }, interval);
    };

    // Configuración del canal SSE nativo en tiempo real (0 ms de latencia)
    const connectSSE = async () => {
        if (typeof window === "undefined" || !("EventSource" in window)) return;
        if (!AuthService.isAuthenticated()) return;

        const token = AuthService.getToken();
        if (!token) return;

        let sseUrl = `${API_BASE_URL}/appointments/stream?token=${encodeURIComponent(token)}`;

        // Blindaje de seguridad: Obtener ticket efímero de un solo uso para no exponer el JWT en la URL
        try {
            const ticketRes = await fetch(`${API_BASE_URL}/auth/sse-ticket`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (ticketRes.ok) {
                const { ticket } = await ticketRes.json();
                if (ticket) {
                    sseUrl = `${API_BASE_URL}/appointments/stream?ticket=${encodeURIComponent(ticket)}`;
                }
            }
        } catch {
            // Si el servicio de tickets no está disponible, el fallback con token garantiza continuidad
        }

        try {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }

            const es = new EventSource(sseUrl);
            eventSourceRef.current = es;

            es.addEventListener("appointment:created", (event) => {
                try {
                    const createdAppointments: Appointment[] = JSON.parse(event.data);
                    if (Array.isArray(createdAppointments) && createdAppointments.length > 0) {
                        useNotificationStore.getState().addNotifications(createdAppointments);
                        triggerSensoryAlerts(createdAppointments);
                        queryClient.invalidateQueries({ queryKey: ["appointments"] });
                        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
                        performSync();
                    }
                } catch (err) {
                    console.error("Error al procesar evento SSE appointment:created:", err);
                }
            });

            es.addEventListener("appointment:cancelled", () => {
                queryClient.invalidateQueries({ queryKey: ["appointments"] });
                queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
                performSync();
            });

            es.addEventListener("appointment:rescheduled", () => {
                queryClient.invalidateQueries({ queryKey: ["appointments"] });
                queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
                performSync();
            });

            es.onerror = () => {
                // En caso de desconexión transitoria, el polling de respaldo mantiene la sincronía
            };
        } catch (err) {
            console.warn("No fue posible inicializar el canal SSE:", err);
        }
    };

    useEffect(() => {
        if (!AuthService.isAuthenticated()) return;

        initAudioOnUserGesture();
        const cleanupTabTitle = initTabTitleListener();
        requestDesktopNotificationPermission();

        // Conectar el canal en tiempo real SSE
        connectSSE();

        // Sincronización inicial y arranque de polling de respaldo
        performSync().then(() => {
            scheduleNextPoll();
        });

        const handleVisibilityOrFocus = () => {
            const isVisible = !document.hidden;
            if (isVisible) {
                const elapsed = Date.now() - lastFetchTimeRef.current;
                if (elapsed > MIN_REFETCH_INTERVAL_MS) {
                    performSync().then(() => {
                        scheduleNextPoll();
                    });
                    return;
                }
            }
            scheduleNextPoll();
        };

        document.addEventListener("visibilitychange", handleVisibilityOrFocus);
        window.addEventListener("focus", handleVisibilityOrFocus);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            cleanupTabTitle();
            document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
            window.removeEventListener("focus", handleVisibilityOrFocus);
        };
    }, []);

    return null;
}
