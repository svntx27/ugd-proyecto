"use client";

import React from "react";
import { Power, Clock, CalendarDays } from "lucide-react";
import { CustomSelect, CustomSelectOption } from "@/components/ui/custom-select";

export interface HorariosConfigSectionProps {
    settings: Record<string, string>;
    onSettingsChange: (newSettings: Record<string, string>) => void;
    isDeveloper: boolean;
    startHourOptions: CustomSelectOption[];
    endHourOptions: CustomSelectOption[];
    slotIntervalOptions: CustomSelectOption[];
    maxAdvanceDaysOptions: CustomSelectOption[];
    maxTurnsPerDayOptions: CustomSelectOption[];
}

export function HorariosConfigSection({
    settings,
    onSettingsChange,
    isDeveloper,
    startHourOptions,
    endHourOptions,
    slotIntervalOptions,
    maxAdvanceDaysOptions,
    maxTurnsPerDayOptions,
}: HorariosConfigSectionProps) {
    const isSystemOnline = settings.system_status === "online";
    const isSystemOffline = settings.system_status === "offline";
    const isSystemLockdown = settings.system_status === "lockdown";

    return (
        <div className="space-y-5 sm:space-y-6">
            {/* Bloque 1: Estado Operativo de la Plataforma */}
            <div className="bg-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-border shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                    <div className="flex items-center gap-3">
                        <div
                            className={`p-2 sm:p-2.5 rounded-xl shrink-0 border ${
                                isSystemLockdown
                                    ? "bg-rose-50 text-rose-600 border-rose-200"
                                    : isSystemOffline
                                    ? "bg-warning-bg text-warning border-warning"
                                    : "bg-surface-subtle text-success border-success-border"
                            }`}
                        >
                            <Power className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-foreground">
                                Estado de la Plataforma UGD
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Controla el acceso al agendamiento de turnos y disponibilidad del sistema.
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    className={`grid grid-cols-1 ${
                        isDeveloper ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"
                    } gap-3 pt-1`}
                >
                    {/* Opción En Línea */}
                    <button
                        type="button"
                        onClick={() => onSettingsChange({ ...settings, system_status: "online" })}
                        className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                            isSystemOnline
                                ? "bg-success-bg border-primary ring-2 ring-primary/20"
                                : "bg-white border-border hover:border-border-strong"
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <div
                                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    isSystemOnline ? "border-primary bg-primary" : "border-muted-subtle"
                                }`}
                            >
                                {isSystemOnline && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-foreground">Servicio Activo</span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-foreground-muted leading-relaxed">
                            Plataforma 100% operativa. Los estudiantes pueden agendar turnos presenciales con normalidad.
                        </p>
                    </button>

                    {/* Opción Mantenimiento */}
                    <button
                        type="button"
                        onClick={() => onSettingsChange({ ...settings, system_status: "offline" })}
                        className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                            isSystemOffline
                                ? "bg-warning-bg border-warning ring-2 ring-warning/20"
                                : "bg-white border-border hover:border-border-strong"
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <div
                                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    isSystemOffline ? "border-warning bg-warning" : "border-muted-subtle"
                                }`}
                            >
                                {isSystemOffline && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-foreground">Modo Mantenimiento</span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-foreground-muted leading-relaxed">
                            Pausa el agendamiento estudiantil. El acceso a los paneles administrativos sigue activo para el equipo.
                        </p>
                    </button>

                    {/* Opción 3: Exclusiva para Desarrollador */}
                    {isDeveloper && (
                        <button
                            type="button"
                            onClick={() => onSettingsChange({ ...settings, system_status: "lockdown" })}
                            className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                                isSystemLockdown
                                    ? "bg-rose-50/60 border-rose-400 ring-2 ring-rose-400/20"
                                    : "bg-white border-border hover:border-border-strong"
                            }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <div
                                    className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                        isSystemLockdown ? "border-rose-600 bg-rose-600" : "border-muted-subtle"
                                    }`}
                                >
                                    {isSystemLockdown && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                </div>
                                <span className="text-xs sm:text-sm font-bold text-foreground">Mantenimiento Total</span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-foreground-muted leading-relaxed">
                                Pausa todo acceso al sistema y expulsa sesiones activas. Permite realizar actualizaciones estructurales o pruebas de seguridad.
                            </p>
                        </button>
                    )}
                </div>
            </div>

            {/* Bloque 2: Horarios de Atención e Intervalos */}
            <div className="bg-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-border shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                    <div className="flex items-center gap-3">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-surface-subtle text-primary border border-border shrink-0">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-foreground">
                                Jornada de Atención e Intervalos
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Define el rango horario y la duración estándar de cada turno presencial.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                    {/* Hora de Apertura */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground-soft uppercase tracking-wider block">
                            Hora Apertura
                        </label>
                        <CustomSelect
                            value={settings.start_hour || "08:00"}
                            onChange={(val) => onSettingsChange({ ...settings, start_hour: val })}
                            options={startHourOptions}
                            placeholder="Hora de apertura..."
                        />
                    </div>

                    {/* Hora de Cierre */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground-soft uppercase tracking-wider block">
                            Hora Cierre
                        </label>
                        <CustomSelect
                            value={settings.end_hour || "16:00"}
                            onChange={(val) => onSettingsChange({ ...settings, end_hour: val })}
                            options={endHourOptions}
                            placeholder="Hora de cierre..."
                        />
                    </div>

                    {/* Intervalo por Cita */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground-soft uppercase tracking-wider block">
                            Duración de Turno
                        </label>
                        <CustomSelect
                            value={settings.slot_interval || "30"}
                            onChange={(val) => onSettingsChange({ ...settings, slot_interval: val })}
                            options={slotIntervalOptions}
                            placeholder="Intervalo de cita..."
                        />
                    </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-subtle border border-border flex items-center gap-2.5 text-xs text-foreground-muted">
                    <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>
                        Jornada activa: <strong>{settings.start_hour || "08:00"}</strong> a{" "}
                        <strong>{settings.end_hour || "16:00"}</strong> con intervalos de{" "}
                        <strong>{settings.slot_interval || "30"} minutos</strong>.
                    </span>
                </div>
            </div>

            {/* Bloque 3: Rango de Agendamiento y Límites de Turno */}
            <div className="bg-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-border shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                    <div className="flex items-center gap-3">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-surface-subtle text-primary border border-border shrink-0">
                            <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-foreground">
                                Reglas de Reserva y Anticipación
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Límites de días futuros y cantidad de citas permitidas por estudiante.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    {/* Ventana de Desbloqueo */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground-soft uppercase tracking-wider block">
                            Ventana Máxima de Anticipación
                        </label>
                        <CustomSelect
                            value={settings.max_advance_days || "4"}
                            onChange={(val) => onSettingsChange({ ...settings, max_advance_days: val })}
                            options={maxAdvanceDaysOptions}
                            placeholder="Anticipación de reserva..."
                        />
                        <p className="text-[11px] text-muted-foreground">
                            Días hábiles abiertos en el calendario para reservar.
                        </p>
                    </div>

                    {/* Límite Diario */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground-soft uppercase tracking-wider block">
                            Límite Diario por Estudiante
                        </label>
                        <CustomSelect
                            value={settings.max_turns_per_day || "4"}
                            onChange={(val) => onSettingsChange({ ...settings, max_turns_per_day: val })}
                            options={maxTurnsPerDayOptions}
                            placeholder="Límite de turnos..."
                        />
                        <p className="text-[11px] text-muted-foreground">
                            Citas máximas que un mismo estudiante puede tener por fecha.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
