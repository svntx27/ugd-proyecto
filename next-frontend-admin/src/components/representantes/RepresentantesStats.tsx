"use client";

import React from "react";
import { UserCheck, ShieldCheck, Building2 } from "lucide-react";

export interface RepresentantesStatsData {
    total: number;
    active: number;
    inactive: number;
}

export interface RepresentantesStatsProps {
    stats: RepresentantesStatsData;
    defaultUbicacion: string;
}

export function RepresentantesStats({ stats, defaultUbicacion }: RepresentantesStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 shadow-2xs">
                <div className="p-2 sm:p-2.5 rounded-xl bg-surface-subtle text-primary border border-border shrink-0">
                    <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">Total en Directorio</p>
                    <p className="text-lg sm:text-xl font-bold text-foreground">
                        {stats.total} <span className="text-xs font-normal text-muted-subtle">representantes</span>
                    </p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 shadow-2xs">
                <div className="p-2 sm:p-2.5 rounded-xl bg-success-bg text-success border border-success-border shrink-0">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">Atención Habilitada</p>
                    <p className="text-lg sm:text-xl font-bold text-foreground">
                        {stats.active} <span className="text-xs font-normal text-success">activos para citas</span>
                    </p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 shadow-2xs">
                <div className="p-2 sm:p-2.5 rounded-xl bg-surface-subtle text-foreground-soft border border-border shrink-0">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">Sede Institucional Única</p>
                    <p className="text-xs sm:text-sm font-semibold text-foreground truncate" title={defaultUbicacion}>
                        {defaultUbicacion}
                    </p>
                </div>
            </div>
        </div>
    );
}
