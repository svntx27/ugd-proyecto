"use client";

import { toast } from "sonner";

// Gestor de toasts agrupados con control de ráfagas (Debounce / Burst Control)
// Evita la saturación en pantalla actualizando un único toast interactivo.

let activeToastCount = 0;
const TOAST_ID = "ugd-grouped-appointments-toast";

export function showGroupedAppointmentToast(newIncomingCount: number): void {
    if (typeof window === "undefined") return;

    activeToastCount += newIncomingCount;

    const title = activeToastCount === 1 
        ? "Nueva cita registrada" 
        : `${activeToastCount} nuevas citas registradas`;

    const description = "Revisa el panel de notificaciones en la cabecera para ver los detalles.";

    toast.info(title, {
        id: TOAST_ID,
        description,
        duration: 5000,
        action: {
            label: "Ver en campana",
            onClick: () => {
                window.dispatchEvent(new CustomEvent("ugd:open-notifications"));
            },
        },
        onDismiss: () => {
            activeToastCount = 0;
        },
        onAutoClose: () => {
            activeToastCount = 0;
        },
    });
}
