"use client";

import React from "react";
import { ChevronRight, Plus } from "lucide-react";
import { Appointment } from "@/services/appointment.service";
import { getAppointmentStatusMeta } from "@/lib/appointment-status.helper";

export interface CalendarWeekGridViewProps {
    weekDays: Date[];
    liveNow: Date;
    currentViewDate: Date;
    timeSlots: string[];
    selectedRepId: string;
    getAppointmentsForDay: (dayDate: Date) => Appointment[];
    onSelectDayDate: (dayDate: Date) => void;
    onSwitchToDayView: (dayDate: Date) => void;
    onOpenModal: (date: Date, slot?: string) => void;
    onOpenViewModal: (app: Appointment) => void;
}

export function CalendarWeekGridView({
    weekDays,
    liveNow,
    currentViewDate,
    timeSlots,
    selectedRepId,
    getAppointmentsForDay,
    onSelectDayDate,
    onSwitchToDayView,
    onOpenModal,
    onOpenViewModal,
}: CalendarWeekGridViewProps) {
    return (
        <div className="flex-1 flex flex-col border border-border rounded-xl sm:rounded-2xl overflow-hidden bg-card shadow-2xs min-h-[500px]">
            <div className="flex-1 min-h-0 overflow-auto no-scrollbar">
                <div className="min-w-[700px] w-full flex flex-col">
                    {/* Cabecera Fija de los Días de la Semana */}
                    <div className="sticky top-0 z-30 grid grid-cols-[64px_repeat(5,1fr)] bg-card border-b border-border shadow-2xs">
                        {/* Celda de esquina superior izquierda */}
                        <div className="sticky left-0 z-40 bg-surface-subtle border-r border-border flex items-center justify-center py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none">
                            Hora
                        </div>

                        {/* Cabeceras de los 5 días laborales */}
                        {weekDays.map((dayDate) => {
                            const dayNumber = dayDate.getDate();
                            const isDayToday = dayDate.toDateString() === liveNow.toDateString();
                            const isDaySelected = dayDate.toDateString() === currentViewDate.toDateString();
                            const dayApps = getAppointmentsForDay(dayDate);
                            const dayName = dayDate.toLocaleDateString("es-ES", { weekday: "short" });

                            return (
                                <div
                                    key={dayDate.toISOString()}
                                    className={`p-2 sm:p-2.5 border-r border-border-subtle last:border-r-0 flex items-center justify-between transition-colors ${
                                        isDaySelected ? "bg-accent/40" : isDayToday ? "bg-surface-subtle" : "bg-card"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span
                                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                                isDayToday
                                                    ? "bg-primary text-white shadow-2xs ring-2 ring-primary/20"
                                                    : isDaySelected
                                                    ? "bg-foreground text-white"
                                                    : "text-foreground"
                                            }`}
                                        >
                                            {dayNumber}
                                        </span>
                                        <div className="min-w-0">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                                                {dayName}
                                            </span>
                                            {isDayToday && (
                                                <span className="text-[9px] font-bold text-primary leading-none block">
                                                    Hoy
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        {dayApps.length > 0 && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-accent text-accent-foreground border border-border-strong">
                                                {dayApps.length}
                                            </span>
                                        )}
                                        <button
                                            onClick={() => onSwitchToDayView(dayDate)}
                                            className="p-1 hover:bg-surface-hover rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                            title="Ver agenda diaria detallada"
                                        >
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Filas de la Agenda (Una fila por cada franja horaria) */}
                    <div className="flex flex-col divide-y divide-border-subtle">
                        {timeSlots.map((slot) => {
                            return (
                                <div key={slot} className="grid grid-cols-[64px_repeat(5,1fr)] min-h-[58px] group/row">
                                    {/* Columna izquierda con la Hora */}
                                    <div className="sticky left-0 z-20 bg-surface-subtle group-hover/row:bg-surface-hover border-r border-border flex items-center justify-center font-mono text-xs font-bold text-foreground-muted px-1 select-none transition-colors">
                                        {slot}
                                    </div>

                                    {/* Las 5 celdas correspondientes a este horario */}
                                    {weekDays.map((dayDate) => {
                                        const dateKey = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, "0")}-${String(dayDate.getDate()).padStart(2, "0")}`;
                                        const dayApps = getAppointmentsForDay(dayDate);
                                        const slotApps = dayApps.filter((app) => {
                                            const h = String(app.hora_inicio || "").substring(0, 5);
                                            return h === slot;
                                        });

                                        const hasApps = slotApps.length > 0;

                                        return (
                                            <div
                                                key={`${dateKey}-${slot}`}
                                                className={`border-r border-border-subtle last:border-r-0 p-1 transition-colors relative flex flex-col justify-center ${
                                                    hasApps
                                                        ? "bg-card"
                                                        : "hover:bg-accent/40 cursor-pointer group/cell"
                                                }`}
                                                onClick={() => {
                                                    if (!hasApps) {
                                                        onOpenModal(dayDate, slot);
                                                    }
                                                }}
                                            >
                                                {hasApps ? (
                                                    <div className="flex flex-col gap-1 w-full h-full justify-center">
                                                        {slotApps.map((app) => {
                                                            const statusMeta = getAppointmentStatusMeta(app.estado);
                                                            return (
                                                                <div
                                                                    key={app.id}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onOpenViewModal(app);
                                                                    }}
                                                                    title={`${app.materia} - ${app.usuario_nombre || app.user_nombre || "Doctorando"} (${app.hora_inicio})`}
                                                                    className={`w-full p-1.5 sm:p-2 rounded-xl border border-border-strong border-l-4 ${statusMeta.borderClass} bg-surface-hover hover:bg-accent-hover transition-all cursor-pointer shadow-2xs hover:shadow-xs flex flex-col justify-between overflow-hidden group/item`}
                                                                >
                                                                    <div className="flex items-center justify-between gap-1">
                                                                        <span className="font-bold text-[11px] text-foreground truncate group-hover/item:text-primary-deep">
                                                                            {app.materia}
                                                                        </span>
                                                                        <span className={`w-2 h-2 rounded-full shrink-0 ${statusMeta.dotClass}`} title={statusMeta.label} />
                                                                    </div>
                                                                    <div className="flex items-center justify-between gap-1 text-[10px] text-foreground-muted mt-0.5">
                                                                        <span className="truncate">
                                                                            {app.usuario_nombre || app.user_nombre || "Doctorando"}
                                                                        </span>
                                                                        {selectedRepId === "all" && (app.representative_nombre || app.lab_nombre) && (
                                                                            <span className="text-[9px] font-semibold text-primary shrink-0 truncate max-w-[85px]">
                                                                                {app.representative_nombre || app.lab_nombre}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    /* Celda vacía interactiva para agendar */
                                                    <div className="w-full h-full min-h-[46px] flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity">
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-white/90 px-2 py-0.5 rounded-md border border-border-strong shadow-2xs">
                                                            <Plus className="w-3 h-3" />
                                                            <span>{slot}</span>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
