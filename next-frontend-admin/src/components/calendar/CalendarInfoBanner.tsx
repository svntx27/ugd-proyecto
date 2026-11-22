"use client";

import React from "react";
import { Search, X, Sun, Sunset, CheckCircle2 } from "lucide-react";

export interface CalendarInfoBannerProps {
    viewMode: "day" | "week";
    currentViewDate: Date;
    isToday: boolean;
    weekNumber: number;
    formattedWeekTitle: string;
    formattedDayTitle: string;
    totalWeekAppointments: number;
    dayAppointmentsCount: number;
    showPastTodaySlots: boolean;
    baseTimeSlotsCount: number;
    searchQuery: string;
    onSearchQueryChange: (val: string) => void;
    shiftFilter: "all" | "morning" | "afternoon" | "booked";
    onShiftFilterChange: (val: "all" | "morning" | "afternoon" | "booked") => void;
    morningCount: number;
    afternoonCount: number;
    startHour?: string;
    endHour?: string;
}

export function CalendarInfoBanner({
    viewMode,
    currentViewDate,
    isToday,
    weekNumber,
    formattedWeekTitle,
    formattedDayTitle,
    totalWeekAppointments,
    dayAppointmentsCount,
    showPastTodaySlots,
    baseTimeSlotsCount,
    searchQuery,
    onSearchQueryChange,
    shiftFilter,
    onShiftFilterChange,
    morningCount,
    afternoonCount,
    startHour = "08:00",
    endHour = "16:00",
}: CalendarInfoBannerProps) {
    return (
        <div className="flex flex-col gap-3 bg-background p-3 sm:p-4 rounded-2xl border border-border mb-4 sm:mb-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 w-full sm:w-auto">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-accent border border-border-strong flex flex-col items-center justify-center text-accent-foreground shrink-0 shadow-2xs">
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase leading-none">
                            {viewMode === "week"
                                ? "SEM"
                                : currentViewDate.toLocaleDateString("es-ES", { weekday: "short" })}
                        </span>
                        <span className="text-sm sm:text-base font-bold leading-tight font-mono">
                            {viewMode === "week" ? weekNumber : currentViewDate.getDate()}
                        </span>
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
                            <h2 className="font-serif font-bold text-sm sm:text-base lg:text-lg text-foreground capitalize truncate tracking-tight">
                                {viewMode === "week" ? `Semana: ${formattedWeekTitle}` : formattedDayTitle}
                            </h2>
                            {isToday && viewMode === "day" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-primary text-white shadow-2xs shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    Hoy
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] sm:text-xs text-foreground-muted truncate mt-0.5">
                            {viewMode === "week"
                                ? `${totalWeekAppointments} ${
                                      totalWeekAppointments === 1 ? "cita esta semana" : "citas esta semana"
                                  } • Resumen laboral L-V (${startHour} - ${endHour})`
                                : isToday && !showPastTodaySlots
                                ? `${dayAppointmentsCount} ${
                                      dayAppointmentsCount === 1 ? "cita hoy" : "citas hoy"
                                  } • Turnos a partir de la hora actual (${baseTimeSlotsCount} franjas)`
                                : `${dayAppointmentsCount} ${
                                      dayAppointmentsCount === 1 ? "cita programada" : "citas programadas"
                                  } • Jornada completa`}
                        </p>
                    </div>
                </div>

                {/* Buscador Rápido */}
                <div className="relative w-full sm:w-60 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-subtle" />
                    <input
                        type="text"
                        placeholder="Buscar estudiante o trámite..."
                        value={searchQuery}
                        onChange={(e) => onSearchQueryChange(e.target.value)}
                        className="w-full pl-8 pr-7 py-1.5 text-xs bg-card border border-border rounded-xl text-foreground placeholder:text-muted-subtle focus:outline-none focus:border-primary-focus focus:ring-2 focus:ring-primary/10 transition-all shadow-2xs font-medium"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchQueryChange("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-subtle hover:text-foreground cursor-pointer"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Filtro de Turnos */}
            {viewMode === "day" && (
                <div className="flex items-center gap-1.5 pt-2 border-t border-border overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 mr-1 hidden xs:inline">
                        Turno:
                    </span>
                    <button
                        onClick={() => onShiftFilterChange("all")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 ${
                            shiftFilter === "all"
                                ? "bg-primary text-white shadow-2xs font-semibold"
                                : "bg-card text-foreground-muted hover:bg-surface-hover border border-border"
                        }`}
                    >
                        {isToday && !showPastTodaySlots
                            ? `Resto del día (${baseTimeSlotsCount})`
                            : `Todo el día (${baseTimeSlotsCount})`}
                    </button>
                    <button
                        onClick={() => onShiftFilterChange("morning")}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 ${
                            shiftFilter === "morning"
                                ? "bg-primary text-white shadow-2xs font-semibold"
                                : "bg-card text-foreground-muted hover:bg-surface-hover border border-border"
                        }`}
                    >
                        <Sun className="w-3 h-3" />
                        <span>Mañana</span>
                        {morningCount > 0 && (
                            <span
                                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                    shiftFilter === "morning"
                                        ? "bg-white/25 text-white"
                                        : "bg-accent text-accent-foreground"
                                }`}
                            >
                                {morningCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => onShiftFilterChange("afternoon")}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 ${
                            shiftFilter === "afternoon"
                                ? "bg-primary text-white shadow-2xs font-semibold"
                                : "bg-card text-foreground-muted hover:bg-surface-hover border border-border"
                        }`}
                    >
                        <Sunset className="w-3 h-3" />
                        <span>Tarde</span>
                        {afternoonCount > 0 && (
                            <span
                                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                    shiftFilter === "afternoon"
                                        ? "bg-white/25 text-white"
                                        : "bg-accent text-accent-foreground"
                                }`}
                            >
                                {afternoonCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => onShiftFilterChange("booked")}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 ${
                            shiftFilter === "booked"
                                ? "bg-primary-deep text-white shadow-2xs font-semibold"
                                : "bg-card text-foreground-muted hover:bg-surface-hover border border-border"
                        }`}
                    >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Con Citas ({dayAppointmentsCount})</span>
                    </button>
                </div>
            )}
        </div>
    );
}
