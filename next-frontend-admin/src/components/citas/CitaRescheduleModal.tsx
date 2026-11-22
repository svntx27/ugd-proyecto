"use client";

import React, { useState, useEffect } from "react";
import {
    CalendarClock,
    Clock,
    Calendar,
    Building2,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { Appointment } from "@/services/appointment.service";

export interface SlotOption {
    value: string;
    label: string;
    sublabel?: string;
}

export interface CitaRescheduleModalProps {
    isOpen: boolean;
    appointment: Appointment | null;
    onClose: () => void;
    onConfirm: (date: string, slot: string) => Promise<void> | void;
    isSubmitting: boolean;
    slotOptions: SlotOption[];
    getNormalizedDate: (fecha?: string) => string;
    getNormalizedTime: (hora?: string | number) => string;
}

export function CitaRescheduleModal({
    isOpen,
    appointment,
    onClose,
    onConfirm,
    isSubmitting,
    slotOptions,
    getNormalizedDate,
    getNormalizedTime,
}: CitaRescheduleModalProps) {
    const defaultSlot = slotOptions[0]?.value || "08:00";
    const [newDate, setNewDate] = useState("");
    const [newSlot, setNewSlot] = useState(defaultSlot);

    useEffect(() => {
        if (appointment) {
            setNewDate(getNormalizedDate(appointment.fecha));
            setNewSlot(getNormalizedTime(appointment.hora_inicio) || slotOptions[0]?.value || "08:00");
        }
    }, [appointment, getNormalizedDate, getNormalizedTime, slotOptions]);

    if (!appointment) return null;

    const handleSubmit = () => {
        if (!newDate || !newSlot) return;
        onConfirm(newDate, newSlot);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
            <DialogContent className="sm:max-w-lg bg-card border border-border rounded-3xl p-5 sm:p-7 shadow-2xl overflow-visible">
                <DialogHeader className="pb-3 border-b border-border-subtle">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 sm:p-3 rounded-2xl bg-role-director-bg border border-role-director-border text-role-director shadow-2xs shrink-0">
                            <CalendarClock className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                                Reagendar Cita Presencial
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                Asigna una nueva fecha y horario para el turno del estudiante.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 my-2">
                    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-border shadow-2xs space-y-2">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                            Turno Programado Actual
                        </span>
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                                    {appointment.materia}
                                </p>
                                <p className="text-xs text-foreground-muted truncate mt-0.5">
                                    {appointment.usuario_nombre || appointment.user_nombre || "Estudiante"} •{" "}
                                    {appointment.representative_nombre || appointment.lab_nombre}
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-foreground-muted bg-surface-subtle px-2.5 py-1 rounded-lg border border-border shrink-0">
                                <Clock className="w-3.5 h-3.5 text-primary" />
                                {getNormalizedDate(appointment.fecha)} • {getNormalizedTime(appointment.hora_inicio)}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground-soft uppercase tracking-wider flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                <span>Nueva Fecha</span>
                            </label>
                            <input
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className="w-full bg-white border border-border focus:border-primary focus:ring-2 focus:ring-accent p-2.5 rounded-xl text-foreground text-xs sm:text-sm font-medium outline-none transition-all shadow-2xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground-soft uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-primary" />
                                <span>Nuevo Horario (30 min)</span>
                            </label>
                            <CustomSelect
                                value={newSlot}
                                onChange={setNewSlot}
                                options={slotOptions}
                                placeholder="Seleccione turno..."
                            />
                        </div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-subtle border border-border text-[11px] text-foreground-muted flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>La cita mantendrá la sede en la Unidad de Gestión de Doctorados.</span>
                    </div>
                </div>

                <DialogFooter className="gap-2 pt-3 border-t border-border-subtle flex-col sm:flex-row">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-xl border-border hover:bg-surface-subtle text-xs font-medium w-full sm:w-auto"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-primary hover:bg-primary-hover text-white font-medium rounded-xl text-xs sm:text-sm px-5 py-2.5 flex items-center justify-center gap-2 shadow-xs w-full sm:w-auto"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" /> Guardar Cambios
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
