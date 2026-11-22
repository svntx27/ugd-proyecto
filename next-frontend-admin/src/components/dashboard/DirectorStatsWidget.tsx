"use client";

import Link from "next/link";
import { TrendingUp, Users, Calendar, ShieldCheck, ArrowRight, Award } from "lucide-react";
import { Appointment } from "@/services/appointment.service";

interface DirectorStatsWidgetProps {
    appointments: Appointment[];
    representativesCount: number;
}

export function DirectorStatsWidget({
    appointments,
    representativesCount,
}: DirectorStatsWidgetProps) {
    const activeAppointments = appointments.filter((a) => a.estado === "active" || (a as any).status === "activa").length;
    const totalAppointments = appointments.length;

    return (
        <div className="bg-surface-subtle p-6 rounded-3xl border border-border shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-role-director-bg rounded-2xl border border-role-director-border text-role-director shadow-2xs">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-foreground">
                            Balance Ejecutivo de Gestión UGD
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Supervisión de demanda académica, cobertura de personal y capacidad instalada de atención.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/dashboard/calendario"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-card hover:bg-role-director-bg text-role-director border border-role-director-border shadow-2xs transition-colors"
                    >
                        Supervisar Agenda <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* Tarjetas de Métricas de Dirección */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded-2xl border border-border shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">Citas Presenciales Activas</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{activeAppointments}</p>
                        <p className="text-[11px] text-accent-foreground font-medium flex items-center gap-1 mt-0.5">
                            <TrendingUp className="w-3 h-3" /> En curso institucional
                        </p>
                    </div>
                    <div className="p-3 bg-role-dev-bg border border-role-dev-border rounded-xl text-role-dev">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-card p-4 rounded-2xl border border-border shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">Personal de Atención Asignado</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{representativesCount}</p>
                        <p className="text-[11px] text-muted-subtle mt-0.5">Representantes en servicio</p>
                    </div>
                    <div className="p-3 bg-role-process-bg border border-role-process-border rounded-xl text-role-process">
                        <Users className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-card p-4 rounded-2xl border border-border shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">Historial Global de Turnos</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{totalAppointments}</p>
                        <p className="text-[11px] text-role-director font-medium mt-0.5">Registros consolidados</p>
                    </div>
                    <div className="p-3 bg-role-director-bg border border-role-director-border rounded-xl text-role-director">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                </div>
            </div>
        </div>
    );
}
