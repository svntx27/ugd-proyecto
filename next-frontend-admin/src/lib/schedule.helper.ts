/**
 * schedule.helper.ts
 * Utilidades para generación dinámica de horarios, turnos e intervalos de atención UGD
 * según la configuración del sistema (start_hour, end_hour, slot_interval).
 */

export const DEFAULT_START_HOUR = "08:00";
export const DEFAULT_END_HOUR = "16:00";
export const DEFAULT_SLOT_INTERVAL = 30; // minutos

export const DEFAULT_FALLBACK_SLOTS = [
    "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30"
];

export interface SystemScheduleConfig {
    startHour: string;
    endHour: string;
    slotInterval: number; // en minutos
}

/**
 * Parsea configuraciones provenientes del backend (array de SystemSetting o map Record<string, string>)
 */
export function parseScheduleConfig(
    rawSettings?: any
): SystemScheduleConfig {
    let startHour = DEFAULT_START_HOUR;
    let endHour = DEFAULT_END_HOUR;
    let slotInterval = DEFAULT_SLOT_INTERVAL;

    if (!rawSettings) {
        return { startHour, endHour, slotInterval };
    }

    if (Array.isArray(rawSettings)) {
        rawSettings.forEach((item) => {
            if (item && item.key) {
                if (item.key === "start_hour" && item.value) {
                    startHour = String(item.value).trim();
                } else if (item.key === "end_hour" && item.value) {
                    endHour = String(item.value).trim();
                } else if (item.key === "slot_interval" && item.value) {
                    const parsed = parseInt(String(item.value), 10);
                    if (!isNaN(parsed) && parsed > 0) slotInterval = parsed;
                }
            }
        });
    } else if (typeof rawSettings === "object") {
        if (rawSettings.start_hour) startHour = String(rawSettings.start_hour).trim();
        if (rawSettings.end_hour) endHour = String(rawSettings.end_hour).trim();
        if (rawSettings.slot_interval) {
            const parsed = parseInt(String(rawSettings.slot_interval), 10);
            if (!isNaN(parsed) && parsed > 0) slotInterval = parsed;
        }
    }

    return { startHour, endHour, slotInterval };
}

/**
 * Genera el arreglo de slots en formato "HH:MM" de forma dinámica
 */
export function generateTimeSlots(
    startHour = DEFAULT_START_HOUR,
    endHour = DEFAULT_END_HOUR,
    slotInterval = DEFAULT_SLOT_INTERVAL
): string[] {
    try {
        const [sh, sm] = startHour.split(":").map(Number);
        const [eh, em] = endHour.split(":").map(Number);

        let current = (isNaN(sh) ? 8 : sh) * 60 + (isNaN(sm) ? 0 : sm);
        const end = (isNaN(eh) ? 16 : eh) * 60 + (isNaN(em) ? 0 : em);
        const step = slotInterval > 0 ? slotInterval : DEFAULT_SLOT_INTERVAL;

        const slots: string[] = [];
        while (current < end) {
            const h = Math.floor(current / 60);
            const m = current % 60;
            const slotStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
            slots.push(slotStr);
            current += step;
        }

        return slots.length > 0 ? slots : DEFAULT_FALLBACK_SLOTS;
    } catch {
        return DEFAULT_FALLBACK_SLOTS;
    }
}

/**
 * Calcula la franja horaria correspondiente para una hora dada redondeada hacia abajo
 * según el intervalo en minutos (ej. 15 min -> 08:00, 08:15, 08:30, 08:45)
 */
export function getCurrentSlot(now: Date, intervalMin = DEFAULT_SLOT_INTERVAL): string {
    const h = now.getHours();
    const m = now.getMinutes();
    const step = intervalMin > 0 ? intervalMin : 30;
    const roundedM = Math.floor(m / step) * step;
    return `${String(h).padStart(2, "0")}:${String(roundedM).padStart(2, "0")}`;
}

export interface ScheduleSelectOption {
    value: string;
    label: string;
    sublabel?: string;
    dotClass?: string;
}

/**
 * Genera las opciones para el selector de filtros de Horario / Jornada
 */
export function buildTimeFilterOptions(
    slots: string[],
    intervalMin = DEFAULT_SLOT_INTERVAL,
    startHour = DEFAULT_START_HOUR,
    endHour = DEFAULT_END_HOUR,
    morningSplitHour = "12:00"
): ScheduleSelectOption[] {
    return [
        {
            value: "all",
            label: "Todos los Horarios",
            sublabel: `Jornada completa (${startHour} - ${endHour})`,
        },
        {
            value: "morning",
            label: "Jornada Matutina",
            sublabel: `${startHour} a ${morningSplitHour} HS`,
        },
        {
            value: "afternoon",
            label: "Jornada Vespertina",
            sublabel: `${morningSplitHour} a ${endHour} HS`,
        },
        ...slots.map((slot) => ({
            value: slot,
            label: `${slot} HS`,
            sublabel: `Turno de ${intervalMin} min`,
        })),
    ];
}

/**
 * Genera las opciones de turnos para agendamiento o reagendamiento
 */
export function buildSlotOptions(
    slots: string[],
    intervalMin = DEFAULT_SLOT_INTERVAL
): ScheduleSelectOption[] {
    return slots.map((slot) => ({
        value: slot,
        label: `${slot} HS`,
        sublabel: `Turno de atención ${intervalMin} min`,
    }));
}
