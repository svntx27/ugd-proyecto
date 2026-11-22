export interface AppointmentStatusMeta {
    code: string;
    label: string;
    badgeClass: string;
    borderClass: string;
    dotClass: string;
    timeBoxClass: string;
    timeTextClass: string;
}

export function getAppointmentStatusMeta(estado?: string): AppointmentStatusMeta {
    const raw = (estado || '').toLowerCase().trim();

    if (raw === 'expired' || raw === 'expirada') {
        return {
            code: 'EXPIRED',
            label: 'Expirada',
            badgeClass: 'bg-warning-bg text-warning border-warning-border',
            borderClass: 'border-l-warning-dot',
            dotClass: 'bg-warning-dot',
            timeBoxClass: 'bg-warning-bg border-warning-border',
            timeTextClass: 'text-warning'
        };
    }

    if (raw === 'cancelled' || raw === 'cancelada') {
        return {
            code: 'CANCELLED',
            label: 'Cancelada',
            badgeClass: 'bg-destructive-bg text-destructive border-destructive-border',
            borderClass: 'border-l-destructive',
            dotClass: 'bg-destructive',
            timeBoxClass: 'bg-destructive-bg border-destructive-border',
            timeTextClass: 'text-destructive'
        };
    }

    if (raw === 'completed' || raw === 'completada' || raw === 'finalizada') {
        return {
            code: 'COMPLETED',
            label: 'Finalizada',
            badgeClass: 'bg-info-bg text-info border-info-border',
            borderClass: 'border-l-info-dot',
            dotClass: 'bg-info-dot',
            timeBoxClass: 'bg-info-bg border-info-border',
            timeTextClass: 'text-info'
        };
    }

    // Default: Activa / Confirmada
    return {
        code: 'ACTIVE',
        label: 'Confirmada',
        badgeClass: 'bg-success-bg text-success border-success-border',
        borderClass: 'border-l-primary',
        dotClass: 'bg-primary',
        timeBoxClass: 'bg-accent border-border-strong',
        timeTextClass: 'text-primary'
    };
}
