"use client";

import React from "react";
import { Calendar, CalendarCheck, Shield, ShieldCheck, Sparkles } from "lucide-react";
import { UserDetail } from "@/services/user.service";
import { getRoleMeta } from "@/lib/role-badge.helper";
import { CompactPagination } from "@/components/ui/compact-pagination";

export interface TabUserAppointmentsProps {
    user: UserDetail;
    userId: string;
    roleCode: string;
    totalUserAppointments: number;
    paginatedUserAppointments: any[];
    safeAppointmentsPage: number;
    pageSize: number;
    onPageChange: (nextPage: number) => void;
    formatDate: (dateString?: string | null) => string;
}

export function TabUserAppointments({
    user,
    userId,
    roleCode,
    totalUserAppointments,
    paginatedUserAppointments,
    safeAppointmentsPage,
    pageSize,
    onPageChange,
    formatDate,
}: TabUserAppointmentsProps) {
    const roleMeta = getRoleMeta(roleCode);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna Izquierda: Citas Presenciales */}
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-accent text-accent-foreground border border-border-strong">
                            <CalendarCheck className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-foreground">Citas Presenciales</h2>
                            <p className="text-xs text-muted-foreground">Historial de turnos presenciales agendados</p>
                        </div>
                    </div>

                    {totalUserAppointments > 0 && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent text-accent-foreground border border-border-strong">
                            {totalUserAppointments} {totalUserAppointments === 1 ? "cita" : "citas"}
                        </span>
                    )}
                </div>

                {totalUserAppointments > 0 ? (
                    <div className="space-y-3">
                        <div className="space-y-2">
                            {paginatedUserAppointments.map((a) => (
                                <div key={a.id} className="p-3 bg-surface-subtle rounded-xl border border-border text-xs space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-foreground flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-primary" />
                                            {a.date} ({a.startTime})
                                        </span>
                                        <span
                                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                                a.status === "activa"
                                                    ? "bg-success-bg text-success border-success-border"
                                                    : "bg-destructive-bg text-destructive border-destructive-border"
                                            }`}
                                        >
                                            {a.status}
                                        </span>
                                    </div>
                                    <p className="text-foreground-muted truncate">Motivo: {a.subject}</p>
                                    <p className="text-[11px] text-muted-foreground">Asesor: {a.representative}</p>
                                </div>
                            ))}
                        </div>

                        <CompactPagination
                            currentPage={safeAppointmentsPage}
                            totalItems={totalUserAppointments}
                            pageSize={pageSize}
                            onPageChange={onPageChange}
                            itemLabel="citas"
                        />
                    </div>
                ) : (
                    <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-surface-subtle/50 text-xs text-muted-foreground">
                        Este usuario no registra citas ni turnos presenciales agendados.
                    </div>
                )}
            </div>

            {/* Columna Derecha: Seguridad y Privilegios RBAC */}
            <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border-subtle">
                    <div className="p-2 rounded-xl bg-accent text-accent-foreground border border-border-strong">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-foreground">Seguridad y Privilegios</h2>
                        <p className="text-xs text-muted-foreground">Modelo RBAC y auditoría de cuenta</p>
                    </div>
                </div>

                <div className="space-y-4 text-xs">
                    <div className="p-4 bg-surface-subtle rounded-xl border border-border space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                            Rol del Sistema
                        </span>
                        <div className="flex items-center gap-2 pt-0.5">
                            <span
                                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${roleMeta.bgClass} ${roleMeta.borderClass} ${roleMeta.textClass}`}
                            >
                                <Shield className="w-3 h-3" />
                                {roleMeta.label}
                            </span>
                        </div>
                        {user.role_description && (
                            <p className="text-xs text-muted-foreground pt-1">{user.role_description}</p>
                        )}
                    </div>

                    <div className="p-4 bg-surface-subtle rounded-xl border border-border space-y-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                            Permisos Activos ({user.permissionsDetailed?.length || (user.permissions?.length ?? 0)})
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                            {roleCode === "DESARROLLADOR" ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success bg-success-bg px-2 py-0.5 rounded-md border border-success-border">
                                    <Sparkles className="w-3 h-3 text-success-dot" />
                                    Acceso Total Superadministrador
                                </span>
                            ) : user.permissionsDetailed && user.permissionsDetailed.length > 0 ? (
                                user.permissionsDetailed.map((p) => (
                                    <span
                                        key={p.code}
                                        title={p.description || p.name}
                                        className="inline-flex items-center text-[10px] font-mono text-foreground-soft bg-card px-2 py-0.5 rounded border border-border"
                                    >
                                        {p.code}
                                    </span>
                                ))
                            ) : user.permissions && user.permissions.length > 0 ? (
                                user.permissions.map((code: string) => (
                                    <span
                                        key={code}
                                        className="inline-flex items-center text-[10px] font-mono text-foreground-soft bg-card px-2 py-0.5 rounded border border-border"
                                    >
                                        {code}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-muted-subtle italic">Sin permisos especiales configurados</span>
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-surface-subtle rounded-xl border border-border space-y-1.5 text-xs text-foreground-muted">
                        <div className="flex justify-between">
                            <span>ID Interno:</span>
                            <span className="font-mono text-foreground">{String(user.id)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Fecha Creación:</span>
                            <span className="text-foreground">{formatDate(user.created_at)}</span>
                        </div>
                        {user.updated_at && (
                            <div className="flex justify-between">
                                <span>Última Actualización:</span>
                                <span className="text-foreground">{formatDate(user.updated_at)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
