"use client";

// Gestor de notificaciones nativas de escritorio del navegador (Web Notifications API)

export async function requestDesktopNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === "undefined" || !("Notification" in window)) {
        return "denied";
    }

    if (Notification.permission === "default") {
        try {
            return await Notification.requestPermission();
        } catch {
            return "denied";
        }
    }

    return Notification.permission;
}

interface DesktopNotificationOptions {
    title: string;
    body: string;
    tag?: string;
    onClick?: () => void;
}

export function showDesktopNotification({
    title,
    body,
    tag = "ugd-appointment-notification",
    onClick,
}: DesktopNotificationOptions): void {
    if (typeof window === "undefined" || !("Notification" in window)) {
        return;
    }

    if (Notification.permission !== "granted") {
        return;
    }

    try {
        const notification = new Notification(title, {
            body,
            tag,
            icon: "/favicon.ico",
            silent: false,
        });

        notification.onclick = () => {
            window.focus();
            if (onClick) {
                onClick();
            }
            notification.close();
        };
    } catch (error) {
        console.warn("Error al emitir notificación de escritorio:", error);
    }
}
