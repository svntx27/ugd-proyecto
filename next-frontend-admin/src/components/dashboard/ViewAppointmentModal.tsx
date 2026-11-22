"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Appointment } from "@/services/appointment.service";
import { Eye, Trash2, Mail, Building2, Calendar, Clock, User, AlertTriangle, Loader2 } from "lucide-react";
import { getAppointmentStatusMeta } from "@/lib/appointment-status.helper";

interface ViewAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment | null;
    onDelete: (id: number) => void;
    isDeleting?: boolean;
}

const getInitials = (name?: string | null) => {
    if (!name) return "UG";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

export function ViewAppointmentModal({
    isOpen,
    onClose,
    appointment,
    onDelete,
    isDeleting = false
}: ViewAppointmentModalProps) {
    if (!appointment) return null;

    const statusMeta = getAppointmentStatusMeta(appointment.estado);

    // Solo se permite cancelar si la cita está activa/confirmada (no expirada ni cancelada)
    const canCancel = statusMeta.code === 'ACTIVE';

    // Descripción contextual
    let descriptionText = "Registro oficial de atención presencial en la UGD.";
    if (canCancel) {
        descriptionText = "Revisa la información de la cita presencial o cancélala si es necesario.";
    } else if (statusMeta.code === 'EXPIRED') {
        descriptionText = "Registro histórico de cita presencial concluida / expirada.";
    } else if (statusMeta.code === 'CANCELLED') {
        descriptionText = "Esta cita presencial fue cancelada previamente.";
    }

    // Formateo de fecha sin desfase de zona horaria
    const formattedDate = (() => {
        if (!appointment.fecha) return "No especificada";
        const cleanDate = String(appointment.fecha).split('T')[0];
        const parts = cleanDate.split('-');
        if (parts.length === 3) {
            const [y, m, d] = parts;
            return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        return cleanDate;
    })();

    const solicitanteNombre = appointment.usuario_nombre || appointment.user_nombre || null;
    const solicitanteEmail = appointment.usuario_email || appointment.user_email || null;
    const repNombre = appointment.representative_nombre || appointment.lab_nombre || `ID: ${appointment.representative_id || appointment.lab_id}`;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg bg-card border border-border rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden">
                <DialogHeader className="pb-3 border-b border-border-subtle">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 sm:p-3 rounded-2xl bg-gold-light border border-gold-border text-gold shadow-2xs shrink-0">
                                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                                    Ficha de Cita Presencial
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                    {descriptionText}
                                </DialogDescription>
                            </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusMeta.badgeClass} shrink-0`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                            {statusMeta.label}
                        </span>
                    </div>
                </DialogHeader>

                <div className="space-y-4 my-2 text-sm">
                    {/* Ficha del Solicitante (Doctorando) */}
                    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-border shadow-2xs space-y-2.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                            Información del Solicitante
                        </span>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent border border-border-strong text-accent-foreground font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                {getInitials(solicitanteNombre)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="font-bold text-sm sm:text-base text-foreground truncate">
                                        {solicitanteNombre || "Estudiante UCE"}
                                    </p>
                                    <span className="text-[10px] font-mono font-medium text-foreground-muted bg-surface-hover px-1.5 py-0.5 rounded border border-border shrink-0">
                                        ID #{appointment.id}
                                    </span>
                                </div>
                                <p className="text-xs text-foreground-muted flex items-center gap-1.5 mt-0.5 truncate">
                                    <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    <span className="truncate">{solicitanteEmail || "Correo no registrado"}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Detalles de la Atención y Agenda */}
                    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-border shadow-2xs space-y-3">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                            Detalles del Turno
                        </span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle space-y-1">
                                <span className="text-[10px] text-muted-foreground font-medium block">Representante Asignado</span>
                                <p className="font-semibold text-foreground flex items-center gap-1.5 truncate">
                                    <User className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span className="truncate">{repNombre}</span>
                                </p>
                            </div>

                            <div className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle space-y-1">
                                <span className="text-[10px] text-muted-foreground font-medium block">Sede Institucional</span>
                                <p className="font-semibold text-foreground flex items-center gap-1.5 truncate">
                                    <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span>Unidad de Gestión de Doctorados</span>
                                </p>
                            </div>

                            <div className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle space-y-1">
                                <span className="text-[10px] text-muted-foreground font-medium block">Fecha del Turno</span>
                                <p className="font-semibold text-foreground flex items-center gap-1.5 capitalize truncate">
                                    <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span>{formattedDate}</span>
                                </p>
                            </div>

                            <div className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle space-y-1">
                                <span className="text-[10px] text-muted-foreground font-medium block">Horario Asignado</span>
                                <p className="font-mono font-bold text-role-dev flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span>{appointment.hora_inicio} (30 min)</span>
                                </p>
                            </div>
                        </div>

                        {/* Motivo / Trámite */}
                        {appointment.materia && (
                            <div className="space-y-1 pt-1">
                                <span className="text-[10px] text-muted-foreground font-medium block">Motivo o Trámite Registrado</span>
                                <div className="p-3 rounded-xl bg-card border border-border text-xs sm:text-sm text-foreground leading-relaxed">
                                    {appointment.materia}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2 pt-3 border-t border-border-subtle flex-col sm:flex-row justify-between items-center">
                    <div className="w-full sm:w-auto">
                        {canCancel && (
                            <Button
                                onClick={() => onDelete(appointment.id)}
                                disabled={isDeleting}
                                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-destructive hover:bg-destructive-hover text-white text-xs font-medium inline-flex items-center justify-center gap-2 transition-all shadow-xs"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelando...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-3.5 h-3.5" /> Cancelar Cita
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    <Button
                        onClick={onClose}
                        disabled={isDeleting}
                        variant="outline"
                        className="rounded-xl border-border hover:bg-surface-hover text-xs font-medium w-full sm:w-auto"
                    >
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export const ViewReservationModal = ViewAppointmentModal;
