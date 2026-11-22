"use client";

// Gestor de notificaciones visuales en el título de la pestaña del navegador (document.title)

let originalTitle = "";
let blinkInterval: NodeJS.Timeout | null = null;
let currentPendingCount = 0;

function getBaseTitle(): string {
    if (!originalTitle && typeof document !== "undefined") {
        originalTitle = document.title || "Admin Dashboard - Unidad de Gestión de Doctorados (UGD)";
    }
    return originalTitle;
}

export function restoreTabTitle(): void {
    if (typeof document === "undefined") return;

    if (blinkInterval) {
        clearInterval(blinkInterval);
        blinkInterval = null;
    }

    currentPendingCount = 0;
    if (originalTitle) {
        document.title = originalTitle;
    }
}

export function notifyTabTitle(newCount: number): void {
    if (typeof document === "undefined") return;
    if (!document.hidden) {
        restoreTabTitle();
        return;
    }

    currentPendingCount += newCount;
    const base = getBaseTitle();
    const alertMessage = currentPendingCount === 1 
        ? `(1 nueva cita) ${base}` 
        : `(${currentPendingCount} nuevas citas) ${base}`;

    if (blinkInterval) {
        clearInterval(blinkInterval);
    }

    let toggle = false;
    document.title = alertMessage;

    // Alternancia suave cada 2 segundos entre el mensaje de alerta y el título base
    blinkInterval = setInterval(() => {
        if (!document.hidden) {
            restoreTabTitle();
            return;
        }
        document.title = toggle ? alertMessage : base;
        toggle = !toggle;
    }, 2000);
}

export function initTabTitleListener(): () => void {
    if (typeof window === "undefined") return () => {};

    getBaseTitle();

    const handleFocus = () => {
        if (!document.hidden) {
            restoreTabTitle();
        }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
        window.removeEventListener("focus", handleFocus);
        document.removeEventListener("visibilitychange", handleFocus);
        restoreTabTitle();
    };
}
