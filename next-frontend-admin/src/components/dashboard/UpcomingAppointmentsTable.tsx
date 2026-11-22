"use client";

import React from "react";
import { Clock, Calendar, Eye, Edit, Trash2 } from "lucide-react";
import { Appointment } from "@/services/appointment.service";
import { getAppointmentStatusMeta } from "@/lib/appointment-status.helper";

export interface UpcomingAppointmentsTableProps {
    appointments: Appointment[];
    onView: (app: Appointment) => void;
    onReschedule: (app: Appointment) => void;
    onDelete: (app: Appointment) => void;
    slotInterval?: number | string;
    startHour?: string;
    endHour?: string;
}

export function UpcomingAppointmentsTable({
    appointments,
    onView,
    onReschedule,
    onDelete,
    slotInterval = 30,
    startHour = "08:00",
    endHour = "16:00",
}: UpcomingAppointmentsTableProps) {
    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
            <div className="px-6 py-4 border-b border-border-subtle flex flex-wrap justify-between items-center gap-3 bg-surface-subtle/80">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-accent text-accent-foreground">
                        <Clock className="w-4 h-4" />
                    </div>
                    Citas Presenciales Recientes
                </h3>
                <span className="text-xs font-medium bg-card text-foreground-muted px-3 py-1 rounded-full border border-border shadow-2xs">
                    Turnos de {slotInterval} min ({startHour} - {endHour})
                </span>
            </div>

            {appointments.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-surface-hover flex items-center justify-center text-muted-subtle mb-3">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <p className="text-foreground-soft font-medium text-sm">
                        No hay citas presenciales registradas recientemente
                    </p>
                    <p className="text-xs text-muted-subtle mt-1">
                        El sistema está listo para agendar consultas con la UGD.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border-subtle bg-surface-subtle text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                <th className="px-6 py-3.5">Representante UGD</th>
                                <th className="px-6 py-3.5">Motivo / Trámite</th>
                                <th className="px-6 py-3.5">Fecha</th>
                                <th className="px-6 py-3.5">Horario</th>
                                <th className="px-6 py-3.5">Estado</th>
                                <th className="px-6 py-3.5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle text-sm">
                            {appointments.map((res, i) => {
                                const statusMeta = getAppointmentStatusMeta(res.estado);
                                const isActive = statusMeta.code === "ACTIVE";

                                return (
                                    <tr
                                        key={`${res.id}-${i}`}
                                        className="hover:bg-surface-hover/60 transition-colors group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${statusMeta.dotClass}`}></div>
                                                <span className="text-foreground font-semibold">
                                                    {res.representative_nombre || res.lab_nombre || `UGD #${res.representative_id || res.lab_id}`}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-foreground-muted">
                                            {res.materia}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                                            <span className="bg-surface-hover text-foreground-soft px-2.5 py-1 rounded-lg border border-border font-medium">
                                                {(() => {
                                                    try {
                                                        const dateStr = String(res.fecha).split("T")[0];
                                                        const [year, month, day] = dateStr.split("-");
                                                        return `${day}/${month}/${year}`;
                                                    } catch {
                                                        return String(res.fecha);
                                                    }
                                                })()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-role-dev font-mono font-bold">
                                            {res.hora_inicio}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusMeta.badgeClass}`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                                                {statusMeta.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => onView(res)}
                                                    className="p-1.5 bg-card hover:bg-accent text-muted-foreground hover:text-accent-foreground rounded-lg transition-colors border border-border hover:border-border-strong cursor-pointer shadow-2xs"
                                                    title="Ver detalles"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {isActive && (
                                                    <>
                                                        <button
                                                            onClick={() => onReschedule(res)}
                                                            className="p-1.5 bg-card hover:bg-role-director-bg text-muted-foreground hover:text-role-director rounded-lg transition-colors border border-border hover:border-role-director-border cursor-pointer shadow-2xs"
                                                            title="Reagendar cita"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => onDelete(res)}
                                                            className="p-1.5 bg-card hover:bg-destructive-bg text-muted-foreground hover:text-destructive-text rounded-lg transition-colors border border-border hover:border-destructive-border cursor-pointer shadow-2xs"
                                                            title="Cancelar cita"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
