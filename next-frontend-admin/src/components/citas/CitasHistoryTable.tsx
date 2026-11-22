"use client";

import React from "react";
import {
    Loader2,
    Eye,
    Edit,
    Trash2,
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
} from "lucide-react";
import { Appointment } from "@/services/appointment.service";
import { CustomSelect } from "@/components/ui/custom-select";
import { getAppointmentStatusMeta } from "@/lib/appointment-status.helper";

export interface PageSizeOption {
    value: string;
    label: string;
}

export interface CitasHistoryTableProps {
    loading: boolean;
    appointments: Appointment[];
    totalItems: number;
    activeFiltersCount: number;
    paginatedAppointments: Appointment[];
    visibleRangeStart: number;
    visibleRangeEnd: number;
    pageSize: number;
    pageSizeOptions: PageSizeOption[];
    onPageSizeChange: (size: number) => void;
    safeCurrentPage: number;
    totalPages: number;
    paginationNumbers: (number | "ellipsis")[];
    onPageChange: (page: number) => void;
    onViewAppointment: (app: Appointment) => void;
    onRescheduleAppointment: (app: Appointment) => void;
    onCancelAppointment: (app: Appointment) => void;
    getNormalizedDate: (fecha?: string) => string;
    getNormalizedTime: (hora?: string | number) => string;
}

export function CitasHistoryTable({
    loading,
    appointments,
    totalItems,
    activeFiltersCount,
    paginatedAppointments,
    visibleRangeStart,
    visibleRangeEnd,
    pageSize,
    pageSizeOptions,
    onPageSizeChange,
    safeCurrentPage,
    totalPages,
    paginationNumbers,
    onPageChange,
    onViewAppointment,
    onRescheduleAppointment,
    onCancelAppointment,
    getNormalizedDate,
    getNormalizedTime,
}: CitasHistoryTableProps) {
    if (loading) {
        return (
            <div className="bg-card border border-border rounded-2xl p-20 flex flex-col items-center justify-center gap-3 text-muted-subtle">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
                <span className="text-sm font-medium">Cargando historial de citas UGD...</span>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-2xl shadow-2xs flex flex-col">
            {/* Barra Superior de Resultados y Tamaño de Página */}
            <div className="px-5 py-3.5 border-b border-border-subtle bg-surface-subtle/60 rounded-t-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-foreground-muted">
                    Mostrando <span className="font-bold text-foreground">{visibleRangeStart}</span> -{" "}
                    <span className="font-bold text-foreground">{visibleRangeEnd}</span> de{" "}
                    <span className="font-bold text-foreground">{totalItems}</span>{" "}
                    {totalItems === 1 ? "cita" : "citas"}
                    {activeFiltersCount > 0 && appointments.length !== totalItems && (
                        <span className="text-muted-foreground ml-1">
                            (filtradas de {appointments.length} totales)
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Mostrar:</span>
                    <div className="w-36">
                        <CustomSelect
                            value={String(pageSize)}
                            onChange={(val) => onPageSizeChange(Number(val))}
                            options={pageSizeOptions}
                            size="sm"
                            align="right"
                        />
                    </div>
                </div>
            </div>

            {/* Contenedor de Tabla con Control Vertical (Scroll Interno + Cabecera Fija) */}
            <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 shadow-2xs">
                        <tr className="border-b border-border-subtle bg-surface-subtle text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                            <th className="px-5 py-3.5">ID</th>
                            <th className="px-5 py-3.5">Representante UGD</th>
                            <th className="px-5 py-3.5">Motivo / Consulta</th>
                            <th className="px-5 py-3.5">Solicitante</th>
                            <th className="px-5 py-3.5">Fecha</th>
                            <th className="px-5 py-3.5">Horario (30 min)</th>
                            <th className="px-5 py-3.5">Estado</th>
                            <th className="px-5 py-3.5 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle text-sm">
                        {paginatedAppointments.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-16 text-muted-subtle text-sm">
                                    No se encontraron citas presenciales con los criterios seleccionados.
                                </td>
                            </tr>
                        ) : (
                            paginatedAppointments.map((app) => {
                                const statusMeta = getAppointmentStatusMeta(app.estado);
                                const isActive = statusMeta.code === "ACTIVE";

                                return (
                                    <tr key={app.id} className="hover:bg-surface-hover/60 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <span className="font-mono text-xs font-semibold text-primary bg-surface-subtle border border-border px-2 py-0.5 rounded-md inline-block">
                                                #{app.id}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 font-semibold text-foreground">
                                            {app.representative_nombre || app.lab_nombre || `UGD #${app.representative_id || app.lab_id}`}
                                        </td>
                                        <td className="px-5 py-3.5 text-foreground-soft max-w-xs truncate" title={app.materia}>
                                            {app.materia}
                                        </td>
                                        <td className="px-5 py-3.5 text-xs">
                                            <div className="font-semibold text-foreground">
                                                {app.usuario_nombre || app.user_nombre || "Estudiante"}
                                            </div>
                                            <div className="text-muted-subtle">
                                                {app.usuario_email || app.user_email || ""}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground whitespace-nowrap">
                                            {getNormalizedDate(app.fecha)}
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-xs font-bold text-foreground whitespace-nowrap">
                                            {getNormalizedTime(app.hora_inicio)}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusMeta.badgeClass}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                                                {statusMeta.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => onViewAppointment(app)}
                                                    className="p-1.5 bg-card hover:bg-accent text-muted-foreground hover:text-accent-foreground rounded-lg transition-colors border border-border hover:border-border-strong cursor-pointer shadow-2xs"
                                                    title="Ver ficha completa"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {isActive && (
                                                    <>
                                                        <button
                                                            onClick={() => onRescheduleAppointment(app)}
                                                            className="p-1.5 bg-card hover:bg-role-director-bg text-muted-foreground hover:text-role-director rounded-lg transition-colors border border-border hover:border-role-director-border cursor-pointer shadow-2xs"
                                                            title="Reagendar"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => onCancelAppointment(app)}
                                                            className="p-1.5 bg-card hover:bg-destructive-bg text-muted-foreground hover:text-destructive-text rounded-lg transition-colors border border-border hover:border-destructive-border cursor-pointer shadow-2xs"
                                                            title="Cancelar"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Barra Inferior de Paginación */}
            {totalItems > 0 && (
                <div className="px-5 py-3.5 border-t border-border-subtle bg-surface-subtle/60 rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                        Página <span className="font-semibold text-foreground">{safeCurrentPage}</span> de{" "}
                        <span className="font-semibold text-foreground">{totalPages}</span>
                    </span>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => onPageChange(1)}
                            disabled={safeCurrentPage <= 1}
                            className="p-1.5 rounded-lg border border-border bg-white text-foreground-muted hover:bg-surface-hover disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors"
                            title="Primera página"
                        >
                            <ChevronsLeft className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
                            disabled={safeCurrentPage <= 1}
                            className="p-1.5 rounded-lg border border-border bg-white text-foreground-muted hover:bg-surface-hover disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors"
                            title="Página anterior"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {paginationNumbers.map((item, idx) =>
                            item === "ellipsis" ? (
                                <span key={`ellipsis-${idx}`} className="px-2 text-xs text-muted-subtle">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => onPageChange(item)}
                                    className={`min-w-8 h-8 px-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                                        safeCurrentPage === item
                                            ? "bg-primary text-white border-primary shadow-2xs"
                                            : "bg-white text-foreground-muted border-border hover:bg-surface-hover hover:text-foreground"
                                    }`}
                                >
                                    {item}
                                </button>
                            )
                        )}

                        <button
                            type="button"
                            onClick={() => onPageChange(Math.min(totalPages, safeCurrentPage + 1))}
                            disabled={safeCurrentPage >= totalPages}
                            className="p-1.5 rounded-lg border border-border bg-white text-foreground-muted hover:bg-surface-hover disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors"
                            title="Página siguiente"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onPageChange(totalPages)}
                            disabled={safeCurrentPage >= totalPages}
                            className="p-1.5 rounded-lg border border-border bg-white text-foreground-muted hover:bg-surface-hover disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors"
                            title="Última página"
                        >
                            <ChevronsRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
