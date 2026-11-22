"use client";

import React from "react";
import {
    Users,
    Mail,
    Shield,
    UserCheck,
    UserX,
    Lock,
    Send,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";
import { User } from "@/services/user.service";
import { getRoleMeta } from "@/lib/role-badge.helper";
import { TableEmptyState } from "@/components/common/TableEmptyState";

export interface UsuariosTableProps {
    loading: boolean;
    filteredUsers: User[];
    paginatedUsers: User[];
    currentPage: number;
    pageSize: number;
    totalPages: number;
    canEditUsers: boolean;
    togglingId: string | number | null;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    onUserDetail: (user: User) => void;
    onToggleUserStatus: (user: User) => void;
    onResetFilters: () => void;
    hasActiveFilters: boolean;
    getUserRoleCode: (user: User) => string;
    getInitials: (name?: string) => string;
}

export function UsuariosTable({
    loading,
    filteredUsers,
    paginatedUsers,
    currentPage,
    pageSize,
    totalPages,
    canEditUsers,
    togglingId,
    onPageChange,
    onPageSizeChange,
    onUserDetail,
    onToggleUserStatus,
    onResetFilters,
    hasActiveFilters,
    getUserRoleCode,
    getInitials,
}: UsuariosTableProps) {
    if (loading) {
        return (
            <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-12 text-center shadow-xs">
                <div className="inline-flex items-center gap-2.5 text-primary font-medium text-xs sm:text-sm">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span>Cargando directorio de usuarios UGD...</span>
                </div>
            </div>
        );
    }

    if (filteredUsers.length === 0) {
        return (
            <TableEmptyState
                icon={Users}
                title="No se encontraron usuarios coincidentes"
                description={
                    hasActiveFilters
                        ? "Intenta modificar los filtros de búsqueda o seleccionar otra categoría."
                        : "Aún no hay usuarios registrados en el sistema."
                }
                actionText={hasActiveFilters ? "Restablecer filtros" : undefined}
                onAction={hasActiveFilters ? onResetFilters : undefined}
            />
        );
    }

    return (
        <div className="bg-card rounded-2xl sm:rounded-3xl border border-border shadow-xs overflow-hidden">
            {/* 1. Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border bg-surface-subtle/70 text-[11px] font-bold text-foreground-muted uppercase tracking-wider">
                            <th className="py-3.5 px-6">Usuario</th>
                            <th className="py-3.5 px-4">Correo Institucional</th>
                            <th className="py-3.5 px-4">Categoría / Rol</th>
                            <th className="py-3.5 px-4 text-center">Estado</th>
                            <th className="py-3.5 px-6 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle text-sm text-foreground">
                        {paginatedUsers.map((u) => {
                            const isPre = u.isPreRegistered || u.estado === "preregistrado";
                            const isActive = (u.estado === "activo" || u.isActive === true) && !isPre;
                            const isToggling = togglingId === u.id;
                            const userRoleCode = getUserRoleCode(u);
                            const userRoleMeta = getRoleMeta(userRoleCode);
                            const userName = u.full_name || u.name || "Usuario";
                            const initials = getInitials(userName);

                            return (
                                <tr key={u.id} className="hover:bg-background/80 transition-colors group">
                                    {/* Identity & Avatar */}
                                    <td className="py-3.5 px-6">
                                        <div
                                            onClick={() => onUserDetail(u)}
                                            className="flex items-center gap-3 cursor-pointer group/user select-none"
                                            title="Haga clic para consultar la ficha completa del estudiante"
                                        >
                                            <div
                                                className={`w-9 h-9 rounded-xl border font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs transition-colors ${
                                                    isPre
                                                        ? "bg-warning-bg border-warning-border text-warning group-hover/user:border-warning/60"
                                                        : "bg-surface-subtle border-border text-primary group-hover/user:border-primary"
                                                }`}
                                            >
                                                {initials}
                                            </div>
                                            <div>
                                                <span className="font-semibold text-foreground group-hover/user:text-primary group-hover/user:underline transition-colors block">
                                                    {userName}
                                                </span>
                                                {u.cedula && (
                                                    <span className="text-[11px] text-muted-foreground font-mono">
                                                        CI: {u.cedula}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Email */}
                                    <td className="py-3.5 px-4">
                                        <div className="flex items-center gap-1.5 text-xs text-foreground-muted font-mono">
                                            <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                            <span className="truncate max-w-[280px]" title={u.email}>
                                                {u.email}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Role Category Badge */}
                                    <td className="py-3.5 px-4">
                                        <span
                                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${userRoleMeta.bgClass} ${userRoleMeta.borderClass} ${userRoleMeta.textClass}`}
                                        >
                                            <Shield className="w-3 h-3" />
                                            {userRoleMeta.shortLabel}
                                        </span>
                                    </td>

                                    {/* Status Indicator */}
                                    <td className="py-3.5 px-4 text-center">
                                        {isPre ? (
                                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-warning bg-warning-bg px-2.5 py-0.5 rounded-full border border-warning-border">
                                                <span className="w-1.5 h-1.5 rounded-full bg-warning-dot"></span>
                                                <span>Pre-registrado</span>
                                            </div>
                                        ) : isActive ? (
                                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                                                <span className="w-2 h-2 rounded-full bg-success-dot inline-block animate-pulse"></span>
                                                <span>Activo</span>
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive">
                                                <span className="w-2 h-2 rounded-full bg-destructive inline-block"></span>
                                                <span>Inhabilitado</span>
                                            </div>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="py-3.5 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {isPre ? (
                                                <div className="relative group/inv inline-block">
                                                    <button
                                                        type="button"
                                                        disabled
                                                        aria-disabled="true"
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border border-border bg-surface-subtle text-muted-subtle opacity-70 cursor-not-allowed select-none shadow-none"
                                                    >
                                                        <Send className="w-3.5 h-3.5 text-muted-subtle" />
                                                        <span>Enviar Invitación</span>
                                                    </button>
                                                    <span className="absolute right-0 -top-7 hidden group-hover/inv:flex items-center bg-foreground text-white text-[10px] font-medium px-2 py-0.5 rounded-md shadow-md whitespace-nowrap z-20 pointer-events-none">
                                                        Próximamente (El estudiante autogestiona su clave)
                                                    </span>
                                                </div>
                                            ) : userRoleCode === "DESARROLLADOR" || u.email === "dev@dev.ugd.local" ? (
                                                <button
                                                    type="button"
                                                    disabled
                                                    title="Cuenta de Desarrollador protegida contra inhabilitación"
                                                    aria-disabled="true"
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border border-border bg-surface-subtle text-muted-subtle opacity-50 cursor-not-allowed select-none shadow-none"
                                                >
                                                    <Lock className="w-3.5 h-3.5 text-muted-subtle" />
                                                    <span>Inhabilitar</span>
                                                </button>
                                            ) : canEditUsers ? (
                                                <button
                                                    type="button"
                                                    onClick={() => onToggleUserStatus(u)}
                                                    disabled={isToggling}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all shadow-2xs cursor-pointer ${
                                                        isActive
                                                            ? "border-destructive-border bg-white hover:bg-destructive-bg text-destructive"
                                                            : "border-success-border bg-white hover:bg-success-bg text-success"
                                                    }`}
                                                >
                                                    {isActive ? (
                                                        <UserX className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <UserCheck className="w-3.5 h-3.5" />
                                                    )}
                                                    <span>{isActive ? "Inhabilitar" : "Activar"}</span>
                                                </button>
                                            ) : (
                                                <span className="text-xs text-muted-subtle italic bg-surface-hover px-2.5 py-1 rounded-md border border-border">
                                                    Solo lectura
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* 2. Mobile & Tablet List View */}
            <div className="block lg:hidden divide-y divide-border-subtle">
                {paginatedUsers.map((u) => {
                    const isPre = u.isPreRegistered || u.estado === "preregistrado";
                    const isActive = (u.estado === "activo" || u.isActive === true) && !isPre;
                    const userRoleCode = getUserRoleCode(u);
                    const userRoleMeta = getRoleMeta(userRoleCode);
                    const userName = u.full_name || u.name || "Usuario";
                    const initials = getInitials(userName);

                    return (
                        <div key={u.id} className="p-4 sm:p-5 hover:bg-background/60 transition-colors space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div
                                    onClick={() => onUserDetail(u)}
                                    className="flex items-center gap-3 min-w-0 cursor-pointer"
                                >
                                    <div
                                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-2xs ${
                                            isPre
                                                ? "bg-warning-bg border-warning-border text-warning"
                                                : "bg-accent border-border-strong text-accent-foreground"
                                        }`}
                                    >
                                        {initials}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-sm sm:text-base text-foreground leading-snug truncate hover:underline">
                                            {userName}
                                        </h3>
                                        <p className="text-xs text-foreground-muted font-mono truncate mt-0.5">
                                            {u.email}
                                        </p>
                                        {u.cedula && (
                                            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                                                CI: {u.cedula}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="shrink-0 flex items-center gap-1.5">
                                    <span
                                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${userRoleMeta.bgClass} ${userRoleMeta.borderClass} ${userRoleMeta.textClass}`}
                                    >
                                        {userRoleMeta.shortLabel}
                                    </span>
                                </div>
                            </div>

                            {/* Mobile Footer Status and Actions */}
                            <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs">
                                <div>
                                    {isPre ? (
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning bg-warning-bg px-2 py-0.5 rounded-full border border-warning-border">
                                            <span className="w-1.5 h-1.5 rounded-full bg-warning-dot"></span>
                                            Pre-registrado
                                        </span>
                                    ) : isActive ? (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                                            <span className="w-2 h-2 rounded-full bg-success-dot animate-pulse"></span>
                                            Activo
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive">
                                            <span className="w-2 h-2 rounded-full bg-destructive"></span>
                                            Inhabilitado
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {isPre ? (
                                        <button
                                            type="button"
                                            disabled
                                            aria-disabled="true"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-border bg-surface-subtle text-muted-subtle opacity-70 cursor-not-allowed select-none shadow-none"
                                        >
                                            <Send className="w-3.5 h-3.5 text-muted-subtle" />
                                            <span>Invitar</span>
                                        </button>
                                    ) : userRoleCode === "DESARROLLADOR" || u.email === "dev@dev.ugd.local" ? (
                                        <button
                                            type="button"
                                            disabled
                                            title="Cuenta de Desarrollador protegida contra inhabilitación"
                                            aria-disabled="true"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-border bg-surface-subtle text-muted-subtle opacity-50 cursor-not-allowed select-none shadow-none"
                                        >
                                            <Lock className="w-3.5 h-3.5 text-muted-subtle" />
                                            <span>Inhabilitar</span>
                                        </button>
                                    ) : canEditUsers ? (
                                        <button
                                            type="button"
                                            onClick={() => onToggleUserStatus(u)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all shadow-2xs ${
                                                isActive
                                                    ? "border-destructive-border bg-white hover:bg-destructive-bg text-destructive"
                                                    : "border-success-border bg-white hover:bg-success-bg text-success"
                                            }`}
                                        >
                                            {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                            <span>{isActive ? "Inhabilitar" : "Activar"}</span>
                                        </button>
                                    ) : (
                                        <span className="text-[11px] text-muted-subtle italic">Solo lectura</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination Bar */}
            <div className="py-3 px-3.5 sm:px-6 bg-surface-subtle/70 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-foreground-muted">
                {/* Counter */}
                <div className="text-center md:text-left text-xs text-foreground-muted font-medium w-full md:w-auto">
                    <span>
                        Mostrando{" "}
                        <strong>{filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> a{" "}
                        <strong>{Math.min(currentPage * pageSize, filteredUsers.length)}</strong> de{" "}
                        <strong>{filteredUsers.length}</strong> integrantes
                    </span>
                </div>

                {/* Page Controls and PageSize */}
                <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 sm:gap-4 w-full md:w-auto">
                    {/* Page size selector pills */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] text-muted-foreground font-medium">Filas:</span>
                        <div className="flex items-center gap-0.5 bg-surface-hover p-0.5 rounded-lg border border-border">
                            {[5, 8, 10, 20].map((size) => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => onPageSizeChange(size)}
                                    className={`px-2 py-0.5 text-[11px] rounded-md transition-all font-semibold cursor-pointer ${
                                        pageSize === size
                                            ? "bg-white text-accent-foreground shadow-2xs"
                                            : "text-foreground-muted hover:text-accent-foreground"
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Previous & Next Buttons */}
                    <div className="flex items-center gap-1 shrink-0 overflow-x-auto max-w-full py-0.5">
                        <button
                            type="button"
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage <= 1}
                            className="p-1.5 rounded-lg border border-border bg-white hover:bg-surface-hover text-foreground-soft disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer"
                            title="Página anterior"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {/* Page Number Chips */}
                        <div className="flex items-center gap-1 px-0.5">
                            {Array.from({ length: totalPages }).map((_, idx) => {
                                const pageNum = idx + 1;
                                if (
                                    totalPages > 5 &&
                                    pageNum !== 1 &&
                                    pageNum !== totalPages &&
                                    Math.abs(pageNum - currentPage) > 1
                                ) {
                                    if (pageNum === 2 || pageNum === totalPages - 1) {
                                        return (
                                            <span key={pageNum} className="text-muted-subtle px-1 text-[11px]">
                                                ...
                                            </span>
                                        );
                                    }
                                    return null;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        type="button"
                                        onClick={() => onPageChange(pageNum)}
                                        className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                            currentPage === pageNum
                                                ? "bg-primary text-white shadow-2xs"
                                                : "bg-white border border-border text-foreground-soft hover:bg-surface-hover"
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage >= totalPages}
                            className="p-1.5 rounded-lg border border-border bg-white hover:bg-surface-hover text-foreground-soft disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer"
                            title="Página siguiente"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
