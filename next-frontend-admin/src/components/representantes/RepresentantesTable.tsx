"use client";

import React from "react";
import {
    UserCheck,
    Mail,
    MapPin,
    Edit3,
    Trash2,
    Building2,
    Plus,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Representative } from "@/services/appointment.service";

export interface RepresentantesTableProps {
    loading: boolean;
    representatives: Representative[];
    filteredReps: Representative[];
    searchQuery: string;
    onClearSearch: () => void;
    onOpenCreate: () => void;
    onOpenEdit: (rep: Representative) => void;
    onDelete: (rep: Representative) => void;
    getInitials: (name: string) => string;
    defaultUbicacion: string;
}

export function RepresentantesTable({
    loading,
    representatives,
    filteredReps,
    searchQuery,
    onClearSearch,
    onOpenCreate,
    onOpenEdit,
    onDelete,
    getInitials,
    defaultUbicacion,
}: RepresentantesTableProps) {
    if (loading) {
        return (
            <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-10 sm:p-12 text-center shadow-xs">
                <div className="inline-flex items-center gap-2.5 text-primary font-medium text-xs sm:text-sm">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span>Sincronizando directorio administrativo UGD...</span>
                </div>
            </div>
        );
    }

    if (filteredReps.length === 0) {
        return (
            <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-10 sm:p-12 text-center shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-surface-hover text-muted-foreground flex items-center justify-center mx-auto">
                    <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">No se encontraron representantes</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    {searchQuery
                        ? `No hay coincidencias para "${searchQuery}".`
                        : "Aún no se han registrado representantes para la Unidad de Gestión de Doctorados."}
                </p>
                {searchQuery ? (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClearSearch}
                        className="rounded-xl mt-2 text-xs cursor-pointer"
                    >
                        Limpiar búsqueda
                    </Button>
                ) : (
                    <Button
                        onClick={onOpenCreate}
                        size="sm"
                        className="bg-primary hover:bg-primary-hover text-white rounded-xl mt-2 text-xs cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Registrar Primer Representante
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="bg-card rounded-2xl sm:rounded-3xl border border-border shadow-xs overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border bg-surface-subtle/70 text-[11px] font-bold text-foreground-muted uppercase tracking-wider">
                            <th className="py-3.5 px-6">Representante y Cuenta</th>
                            <th className="py-3.5 px-4">Cargo Institucional</th>
                            <th className="py-3.5 px-4">Sede / Ubicación</th>
                            <th className="py-3.5 px-4 text-center">Estado</th>
                            <th className="py-3.5 px-6 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle text-sm text-foreground">
                        {filteredReps.map((rep) => {
                            const isActive = rep.estado === "activo" || rep.estado === "disponible";
                            const repName = rep.nombre || rep.name || "Sin nombre";
                            const repTitle = rep.title || "Analista UGD";
                            const repLocation = rep.ubicacion || rep.location || defaultUbicacion;
                            const initials = getInitials(repName);

                            return (
                                <tr
                                    key={rep.id}
                                    className="hover:bg-background/80 transition-colors group"
                                >
                                    {/* Columna 1: Identidad y Cuenta */}
                                    <td className="py-3.5 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-surface-subtle border border-border text-primary font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs group-hover:border-primary/40 transition-colors">
                                                {initials}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                        {repName}
                                                    </span>
                                                    {rep.role && (
                                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface-subtle border border-border text-foreground-soft">
                                                            {rep.role}
                                                        </span>
                                                    )}
                                                </div>
                                                {rep.email ? (
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                        <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                                                        <span>{rep.email}</span>
                                                    </p>
                                                ) : (
                                                    <p className="text-[11px] text-muted-subtle italic mt-0.5 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-warning-dot"></span>
                                                        Sin cuenta de acceso vinculada
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Columna 2: Cargo */}
                                    <td className="py-3.5 px-4">
                                        <span className="text-xs sm:text-sm font-medium text-foreground-soft">
                                            {repTitle}
                                        </span>
                                    </td>

                                    {/* Columna 3: Ubicación */}
                                    <td className="py-3.5 px-4">
                                        <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                                            <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                            <span className="truncate max-w-[260px]" title={repLocation}>
                                                {repLocation}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Columna 4: Estado */}
                                    <td className="py-3.5 px-4 text-center">
                                        {isActive ? (
                                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                                                <span className="w-2 h-2 rounded-full bg-success-dot inline-block animate-pulse"></span>
                                                <span>Activo</span>
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive-text">
                                                <span className="w-2 h-2 rounded-full bg-destructive inline-block"></span>
                                                <span>Pausado</span>
                                            </div>
                                        )}
                                    </td>

                                    {/* Columna 5: Acciones */}
                                    <td className="py-3.5 px-6 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => onOpenEdit(rep)}
                                                title="Editar representante en pantalla completa"
                                                className="px-2.5 py-1.5 rounded-xl border border-border hover:border-border-strong bg-white hover:bg-surface-hover text-primary text-xs font-medium inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                                <span>Editar</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onDelete(rep)}
                                                title="Eliminar representante"
                                                className="px-2.5 py-1.5 rounded-xl border border-destructive-border hover:border-destructive-border bg-white hover:bg-destructive-bg text-destructive text-xs font-medium inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>Eliminar</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile & Tablet List View */}
            <div className="block lg:hidden divide-y divide-border-subtle">
                {filteredReps.map((rep) => {
                    const isActive = rep.estado === "activo" || rep.estado === "disponible";
                    const repName = rep.nombre || rep.name || "Sin nombre";
                    const repTitle = rep.title || "Analista UGD";
                    const repLocation = rep.ubicacion || rep.location || defaultUbicacion;
                    const initials = getInitials(repName);

                    return (
                        <div
                            key={rep.id}
                            className="p-4 sm:p-5 hover:bg-background/60 transition-colors space-y-3"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-accent border border-border-strong text-accent-foreground font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-2xs">
                                        {initials}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-sm sm:text-base text-foreground leading-snug truncate">
                                            {repName}
                                        </h3>
                                        <p className="text-xs text-foreground-soft font-medium mt-0.5">
                                            {repTitle} {rep.role && `• ${rep.role}`}
                                        </p>
                                        {rep.email && (
                                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                                                <Mail className="w-3 h-3 text-primary shrink-0" />
                                                <span>{rep.email}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="shrink-0 pt-0.5">
                                    {isActive ? (
                                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                                            <span className="w-2 h-2 rounded-full bg-success-dot inline-block animate-pulse"></span>
                                            <span>Activo</span>
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive-text">
                                            <span className="w-2 h-2 rounded-full bg-destructive inline-block"></span>
                                            <span>Pausado</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-border-subtle text-xs">
                                <div className="flex items-center gap-1.5 text-foreground-muted">
                                    <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    <span className="truncate" title={repLocation}>
                                        {repLocation}
                                    </span>
                                </div>

                                <div className="flex items-center justify-end gap-2 self-end sm:self-auto">
                                    <button
                                        type="button"
                                        onClick={() => onOpenEdit(rep)}
                                        className="px-3 py-1.5 rounded-xl border border-border bg-white hover:bg-surface-hover text-primary text-xs font-medium inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        <span>Editar</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(rep)}
                                        className="px-3 py-1.5 rounded-xl border border-destructive-border bg-white hover:bg-destructive-bg text-destructive text-xs font-medium inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Eliminar</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Barra inferior */}
            <div className="py-3 px-4 sm:px-6 bg-surface-subtle/50 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>
                    Mostrando <strong className="text-foreground">{filteredReps.length}</strong> de{" "}
                    <strong className="text-foreground">{representatives.length}</strong> representantes
                </span>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    <span>Unidad Centralizada UGD</span>
                </div>
            </div>
        </div>
    );
}
