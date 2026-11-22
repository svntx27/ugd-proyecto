"use client";

import React from "react";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Appointment } from "@/services/appointment.service";

export interface CitaCancelModalProps {
    isOpen: boolean;
    appointment: Appointment | null;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    isSubmitting: boolean;
    getNormalizedDate: (fecha?: string) => string;
}

export function CitaCancelModal({
    isOpen,
    appointment,
    onClose,
    onConfirm,
    isSubmitting,
    getNormalizedDate,
}: CitaCancelModalProps) {
    if (!appointment) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
            <DialogContent className="sm:max-w-md bg-card border border-destructive-border rounded-3xl p-5 sm:p-7 shadow-2xl">
                <DialogHeader className="space-y-3 pb-2 border-b border-destructive-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 sm:p-3 rounded-2xl bg-destructive-bg border border-destructive-border text-destructive shadow-2xs shrink-0">
                            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg sm:text-xl font-bold text-destructive tracking-tight">
                                Cancelar Cita Presencial
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                Esta acción liberará el turno y notificará la anulación.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-3 space-y-3">
                    <div className="bg-destructive-bg border border-destructive-border rounded-2xl p-4 space-y-1">
                        <span className="text-[10px] font-bold text-destructive-hover uppercase tracking-wider block">
                            Turno a Cancelar
                        </span>
                        <p className="text-sm sm:text-base font-bold text-foreground">
                            {appointment.materia}
                        </p>
                        <p className="text-xs text-foreground-muted">
                            {appointment.usuario_nombre || appointment.user_nombre || "Estudiante"} •{" "}
                            {appointment.representative_nombre || appointment.lab_nombre}
                        </p>
                        <p className="text-xs font-mono font-semibold text-destructive-hover pt-1">
                            {appointment.fecha ? getNormalizedDate(appointment.fecha) : ""} a las{" "}
                            {appointment.hora_inicio} HS
                        </p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        ¿Estás seguro de continuar? El horario quedará liberado inmediatamente para que otro estudiante pueda solicitarlo.
                    </p>
                </div>

                <DialogFooter className="gap-2 pt-2 border-t border-destructive-border flex-col sm:flex-row">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-xl border-border hover:bg-surface-subtle text-xs font-medium w-full sm:w-auto"
                    >
                        Volver
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="bg-destructive hover:bg-destructive-hover text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs w-full sm:w-auto"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelando...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-3.5 h-3.5" /> Confirmar Cancelación
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
