"use client";

import React from "react";

export interface CitasSummaryData {
    total: number;
    active: number;
    expired: number;
    cancelled: number;
}

export interface CitasStatsSummaryProps {
    stats: CitasSummaryData;
    selectedStatus: string;
    onSelectStatus: (status: string) => void;
}

export function CitasStatsSummary({
    stats,
    selectedStatus,
    onSelectStatus,
}: CitasStatsSummaryProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <button
                type="button"
                onClick={() => onSelectStatus("all")}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedStatus === "all"
                        ? "bg-card border-primary ring-1 ring-primary/25 shadow-xs"
                        : "bg-card border-border hover:border-border-strong"
                }`}
            >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                    Total Registradas
                </span>
                <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl font-bold text-foreground">{stats.total}</span>
                    <span className="text-[11px] font-medium text-foreground-muted">Histórico</span>
                </div>
            </button>

            <button
                type="button"
                onClick={() => onSelectStatus("ACTIVE")}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedStatus === "ACTIVE"
                        ? "bg-accent/40 border-primary ring-1 ring-primary/25 shadow-xs"
                        : "bg-card border-border hover:border-border-strong"
                }`}
            >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Confirmadas
                </span>
                <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl font-bold text-foreground">{stats.active}</span>
                    <span className="text-[11px] font-medium text-primary">Activas</span>
                </div>
            </button>

            <button
                type="button"
                onClick={() => onSelectStatus("EXPIRED")}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedStatus === "EXPIRED"
                        ? "bg-warning-bg/60 border-warning-dot ring-1 ring-warning-dot/30 shadow-xs"
                        : "bg-card border-border hover:border-border-strong"
                }`}
            >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-warning flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning-dot" />
                    Expiradas
                </span>
                <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl font-bold text-foreground">{stats.expired}</span>
                    <span className="text-[11px] font-medium text-warning">Concluidas</span>
                </div>
            </button>

            <button
                type="button"
                onClick={() => onSelectStatus("CANCELLED")}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedStatus === "CANCELLED"
                        ? "bg-destructive-bg/50 border-destructive ring-1 ring-destructive/25 shadow-xs"
                        : "bg-card border-border hover:border-border-strong"
                }`}
            >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-destructive flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                    Canceladas
                </span>
                <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl font-bold text-foreground">{stats.cancelled}</span>
                    <span className="text-[11px] font-medium text-destructive">Anuladas</span>
                </div>
            </button>
        </div>
    );
}
