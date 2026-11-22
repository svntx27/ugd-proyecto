"use client";

import React from "react";
import { Users, CheckCircle, Clock, XCircle, GraduationCap } from "lucide-react";
import { StatMetricCard } from "@/components/common/StatMetricCard";

export interface UsuariosStatsData {
    total: number;
    active: number;
    inactive: number;
    preRegistered: number;
    students: number;
    staff: number;
}

interface UsuariosStatsGridProps {
    stats: UsuariosStatsData;
}

export function UsuariosStatsGrid({ stats }: UsuariosStatsGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <StatMetricCard
                icon={Users}
                label="Total Nómina"
                value={stats.total}
                sublabel="integrantes"
                iconContainerClassName="p-2 sm:p-2.5 rounded-xl bg-surface-subtle text-primary border border-border shrink-0"
            />

            <StatMetricCard
                icon={CheckCircle}
                label="Cuentas Activas"
                value={stats.active}
                sublabel="habilitadas"
                sublabelClassName="text-[11px] font-normal text-success"
                iconContainerClassName="p-2 sm:p-2.5 rounded-xl bg-success-bg text-success border border-success-border shrink-0"
            />

            <StatMetricCard
                icon={Clock}
                label="Pre-registrados"
                value={stats.preRegistered}
                sublabel="por activar"
                sublabelClassName="text-[11px] font-normal text-warning"
                iconContainerClassName="p-2 sm:p-2.5 rounded-xl bg-warning-bg text-warning border border-warning-border shrink-0"
            />

            <StatMetricCard
                icon={XCircle}
                label="Inhabilitadas"
                value={stats.inactive}
                sublabel="bloqueadas"
                sublabelClassName="text-[11px] font-normal text-destructive"
                iconContainerClassName="p-2 sm:p-2.5 rounded-xl bg-destructive-bg text-destructive border border-destructive-border shrink-0"
            />

            <StatMetricCard
                icon={GraduationCap}
                label="Estudiantes"
                value={stats.students}
                sublabel="doctorandos"
                className="col-span-2 sm:col-span-1"
                iconContainerClassName="p-2 sm:p-2.5 rounded-xl bg-surface-subtle text-role-process border border-border shrink-0"
            />
        </div>
    );
}
