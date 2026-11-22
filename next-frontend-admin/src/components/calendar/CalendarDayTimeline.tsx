"use client";

import React from "react";
import { History, CheckCircle2, Clock, User, Plus } from "lucide-react";
import { Appointment } from "@/services/appointment.service";
import { getAppointmentStatusMeta } from "@/lib/appointment-status.helper";
import { getCurrentSlot } from "@/lib/schedule.helper";

export interface CalendarDayTimelineProps {
    isToday: boolean;
    pastSlotsCount: number;
    showPastTodaySlots: boolean;
    onToggleShowPastSlots: () => void;
    baseTimeSlots: string[];
    filteredTimeSlots: string[];
    slotAppointmentsMap: Record<string, Appointment[]>;
    dayAppointmentsCount: number;
    liveNow: Date;
    onOpenModal: (date?: Date, slot?: string) => void;
    onOpenViewModal: (app: Appointment) => void;
    onNextDay: () => void;
    onResetShiftFilter: () => void;
    currentViewDate: Date;
    slotInterval?: number;
    endHour?: string;
}

export function CalendarDayTimeline({
    isToday,
    pastSlotsCount,
    showPastTodaySlots,
    onToggleShowPastSlots,
    baseTimeSlots,
    filteredTimeSlots,
    slotAppointmentsMap,
    dayAppointmentsCount,
    liveNow,
    onOpenModal,
    onOpenViewModal,
    onNextDay,
    onResetShiftFilter,
    currentViewDate,
    slotInterval = 30,
    endHour = "16:00",
}: CalendarDayTimelineProps) {
    return (
        <div className="flex-1 border border-border rounded-xl sm:rounded-2xl overflow-hidden bg-card flex flex-col shadow-2xs relative">
            <div className="overflow-y-auto flex-1 p-2 sm:p-4 divide-y divide-border-subtle space-y-1 relative no-scrollbar">
                {/* Aviso de Franjas Transcurridas en Hoy */}
                {isToday && pastSlotsCount > 0 && (
                    <div className="mb-2.5 px-3 py-1.5 bg-surface-subtle border border-border rounded-xl flex items-center justify-between text-xs text-foreground-muted shadow-2xs">
                        <div className="flex items-center gap-2">
                            <History className="w-3.5 h-3.5 text-primary" />
                            <span>
                                {showPastTodaySlots
                                    ? "Mostrando todas las franjas de hoy (incluyendo turnos transcurridos)"
                                    : `${pastSlotsCount} ${
                                          pastSlotsCount === 1
                                              ? "franja anterior oculta"
                                              : "franjas anteriores ocultas"
                                      } por haber transcurrido`}
                            </span>
                        </div>
                        <button
                            onClick={onToggleShowPastSlots}
                            className="font-semibold text-xs text-primary hover:text-primary-deep-hover hover:underline cursor-pointer shrink-0 transition-colors"
                        >
                            {showPastTodaySlots ? "Ocultar transcurridas" : "Ver transcurridas"}
                        </button>
                    </div>
                )}

                {isToday && baseTimeSlots.length === 0 ? (
                    <div className="py-12 px-4 text-center flex flex-col items-center justify-center space-y-3 my-auto">
                        <div className="w-12 h-12 rounded-2xl bg-accent border border-border-strong flex items-center justify-center text-primary-deep">
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-bold text-foreground text-sm sm:text-base">
                                Jornada de atención de hoy finalizada
                            </h4>
                            <p className="text-xs text-muted-foreground max-w-md mt-1">
                                La jornada presencial de hoy concluyó a las {endHour} HS. Todos los turnos han transcurrido.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                            <button
                                onClick={onToggleShowPastSlots}
                                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-card hover:bg-surface-hover text-accent-foreground border border-border shadow-2xs transition-colors cursor-pointer"
                            >
                                Ver citas de hoy ({dayAppointmentsCount})
                            </button>
                            <button
                                onClick={onNextDay}
                                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary-deep hover:bg-primary-deep-hover text-white shadow-2xs transition-colors cursor-pointer"
                            >
                                Ver agenda de mañana →
                            </button>
                        </div>
                    </div>
                ) : filteredTimeSlots.length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground">
                        <Clock className="w-8 h-8 text-muted-subtle mx-auto mb-2 opacity-50" />
                        <p className="text-xs sm:text-sm font-medium">
                            No hay citas agendadas con el filtro seleccionado
                        </p>
                        <button
                            onClick={onResetShiftFilter}
                            className="mt-2.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                        >
                            Ver todos los horarios disponibles
                        </button>
                    </div>
                ) : (
                    filteredTimeSlots.map((slot) => {
                        const appointmentsInSlot = slotAppointmentsMap[slot] || [];
                        const hasAppointments = appointmentsInSlot.length > 0;

                        const isCurrentHourSlot =
                            isToday &&
                            slot === getCurrentSlot(liveNow, slotInterval);

                        return (
                            <div
                                key={slot}
                                className={`py-2 sm:py-2.5 flex items-start gap-2.5 sm:gap-4 transition-colors group rounded-xl px-1.5 sm:px-2 ${
                                    isCurrentHourSlot ? "bg-accent/25" : "hover:bg-surface-subtle"
                                }`}
                            >
                                {/* Columna de Hora Fija */}
                                <div className="w-14 sm:w-20 shrink-0 flex flex-col items-start pt-1">
                                    <div className="flex items-center gap-1">
                                        <span className="font-mono font-bold text-xs sm:text-sm text-foreground">
                                            {slot}
                                        </span>
                                        {isCurrentHourSlot && (
                                            <span
                                                className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
                                                title="Franja horaria actual"
                                            />
                                        )}
                                    </div>
                                    {isCurrentHourSlot ? (
                                        <span className="text-[9px] font-bold text-primary-deep bg-accent px-1 py-0.2 rounded-md font-mono mt-0.5">
                                            En curso
                                        </span>
                                    ) : (
                                        <span className="text-[9px] sm:text-[10px] text-muted-subtle font-mono hidden xs:inline">
                                            {slotInterval} min
                                        </span>
                                    )}
                                </div>

                                {/* Columna de Contenido */}
                                <div className="flex-1 min-w-0">
                                    {hasAppointments ? (
                                        <div className="space-y-1.5">
                                            {appointmentsInSlot.map((app) => {
                                                const statusMeta = getAppointmentStatusMeta(app.estado);
                                                return (
                                                    <div
                                                        key={app.id}
                                                        onClick={() => onOpenViewModal(app)}
                                                        className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-card hover:bg-accent/60 border-l-4 ${statusMeta.borderClass} border border-border hover:border-border-strong transition-all cursor-pointer shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 group/card`}
                                                    >
                                                        <div className="space-y-1 min-w-0 flex-1">
                                                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                                                <h4 className="font-bold text-foreground text-xs sm:text-sm truncate">
                                                                    {app.materia}
                                                                </h4>
                                                                <span
                                                                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold border shrink-0 ${statusMeta.badgeClass}`}
                                                                >
                                                                    <span
                                                                        className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`}
                                                                    />
                                                                    {statusMeta.label}
                                                                </span>
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-xs text-muted-foreground">
                                                                <span className="flex items-center gap-1 text-foreground-soft font-medium">
                                                                    <User className="w-3 h-3 text-primary" />
                                                                    <span className="truncate max-w-[130px] sm:max-w-none">
                                                                        {app.usuario_nombre || "Doctorando"}
                                                                    </span>
                                                                </span>
                                                                <span className="text-border-strong">•</span>
                                                                <span className="truncate max-w-[140px] sm:max-w-none">
                                                                    {app.representative_nombre ||
                                                                        `Rep: ${app.representative_id || app.lab_id}`}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-end sm:justify-start shrink-0">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onOpenViewModal(app);
                                                                }}
                                                                className="w-full sm:w-auto px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold bg-card hover:bg-surface-hover text-accent-foreground border border-border shadow-2xs transition-colors cursor-pointer text-center"
                                                            >
                                                                Ver Detalles
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        /* Slot Disponible */
                                        <div
                                            onClick={() => onOpenModal(currentViewDate, slot)}
                                            className="border border-dashed border-border hover:border-border-strong hover:bg-accent/40 rounded-xl p-2 sm:p-2.5 flex items-center justify-between gap-2 text-xs transition-all cursor-pointer group/slot text-muted-subtle hover:text-primary-deep"
                                        >
                                            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                                <span className="w-1.5 h-1.5 rounded-full bg-border-strong group-hover/slot:bg-primary transition-colors shrink-0" />
                                                <span className="font-medium text-[11px] sm:text-xs truncate">
                                                    Disponible
                                                </span>
                                            </div>

                                            <span className="opacity-100 sm:opacity-0 sm:group-hover/slot:opacity-100 transition-opacity font-semibold text-primary flex items-center gap-1 text-[11px] sm:text-xs shrink-0">
                                                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                <span>Agendar</span>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
