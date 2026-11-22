"use client";

import React from "react";
import {
    Plus,
    Clock,
    CalendarDays,
    RotateCw,
    Filter,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";

export interface RepFilterOption {
    value: string;
    label: string;
    sublabel?: string;
    dotClass?: string;
}

export interface CalendarHeaderToolbarProps {
    onNewAppointment: () => void;
    viewMode: "day" | "week";
    onViewModeChange: (mode: "day" | "week") => void;
    onToday: () => void;
    isToday: boolean;
    onRefresh: () => void;
    isRefreshing: boolean;
    selectedRepId: string;
    onRepChange: (id: string) => void;
    repFilterOptions: RepFilterOption[];
    onPrev: () => void;
    onNext: () => void;
    displayDateLabel: string;
}

export function CalendarHeaderToolbar({
    onNewAppointment,
    viewMode,
    onViewModeChange,
    onToday,
    isToday,
    onRefresh,
    isRefreshing,
    selectedRepId,
    onRepChange,
    repFilterOptions,
    onPrev,
    onNext,
    displayDateLabel,
}: CalendarHeaderToolbarProps) {
    return (
        <div className="flex flex-col gap-3.5 mb-4 sm:mb-6 pb-4 sm:pb-5 border-b border-border-subtle">
            {/* Fila 1: Botón Nueva Cita y Controles Rápidos */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full">
                <button
                    onClick={onNewAppointment}
                    className="w-full sm:w-auto bg-primary-deep hover:bg-primary-deep-hover text-card font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xs hover:shadow transition-all cursor-pointer active:scale-[0.98] shrink-0"
                >
                    <Plus className="w-4 h-4 text-accent-hover" />
                    <span>Nueva Cita UGD</span>
                </button>

                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                    {/* Switch Vista: Día vs Semana */}
                    <div className="inline-flex items-center bg-surface-hover p-0.5 sm:p-1 rounded-xl border border-border">
                        <button
                            onClick={() => onViewModeChange("day")}
                            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                viewMode === "day"
                                    ? "bg-card text-foreground shadow-2xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span className="hidden xs:inline">Agenda</span>
                            <span>Día</span>
                        </button>
                        <button
                            onClick={() => onViewModeChange("week")}
                            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                viewMode === "week"
                                    ? "bg-card text-foreground shadow-2xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <CalendarDays className="w-3.5 h-3.5 text-primary" />
                            <span>Semana</span>
                        </button>
                    </div>

                    {/* Botón Hoy */}
                    <button
                        onClick={onToday}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border border-border transition-colors cursor-pointer shadow-2xs active:scale-[0.98] ${
                            isToday
                                ? "bg-primary text-white border-primary"
                                : "bg-card hover:bg-surface-hover text-foreground-soft"
                        }`}
                    >
                        Hoy
                    </button>

                    {/* Botón Sincronizar en Vivo */}
                    <button
                        onClick={onRefresh}
                        className="p-2 bg-card hover:bg-surface-hover text-foreground-muted hover:text-foreground border border-border rounded-xl transition-colors cursor-pointer shadow-2xs shrink-0"
                        title="Actualizar citas en vivo"
                        aria-label="Actualizar citas"
                    >
                        <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Fila 2: Filtro por Representante y Navegación de Fecha */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full">
                {/* Filtro por Representante */}
                <div className="flex-1 min-w-[200px]">
                    <CustomSelect
                        value={selectedRepId}
                        onChange={onRepChange}
                        options={repFilterOptions}
                        icon={<Filter className="w-3.5 h-3.5 text-primary" />}
                        placeholder="Todos los Representantes"
                        size="sm"
                    />
                </div>

                {/* Navegador Anterior / Siguiente */}
                <div className="flex items-center justify-between sm:justify-end gap-1.5 bg-card px-2 py-1 rounded-2xl border border-border shadow-2xs shrink-0">
                    <button
                        onClick={onPrev}
                        className="p-1.5 hover:bg-surface-hover rounded-xl text-foreground-muted hover:text-foreground transition-colors cursor-pointer shrink-0"
                        title={viewMode === "week" ? "Semana anterior" : "Día anterior"}
                        aria-label={viewMode === "week" ? "Semana anterior" : "Día anterior"}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-semibold text-foreground px-2 capitalize text-center truncate max-w-[190px] sm:max-w-none">
                        {displayDateLabel}
                    </span>
                    <button
                        onClick={onNext}
                        className="p-1.5 hover:bg-surface-hover rounded-xl text-foreground-muted hover:text-foreground transition-colors cursor-pointer shrink-0"
                        title={viewMode === "week" ? "Semana siguiente" : "Día siguiente"}
                        aria-label={viewMode === "week" ? "Semana siguiente" : "Día siguiente"}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
