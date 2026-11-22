"use client";

import React from "react";
import {
    ArrowLeft,
    Pencil,
    Printer,
    Send,
    UserCheck,
    UserX,
    Shield,
    IdCard,
    Copy,
    Mail,
    Building2,
    FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserDetail } from "@/services/user.service";
import { getRoleMeta } from "@/lib/role-badge.helper";

export interface UserDetailHeaderProps {
    user: UserDetail;
    canEditUsers: boolean;
    isPre: boolean;
    isActive: boolean;
    roleCode: string;
    fullName: string;
    initials: string;
    formatDate: (dateString?: string | null) => string;
    copyToClipboard: (text: string, label: string) => void;
    onBack: () => void;
    onStartEditing: () => void;
    onPrint: () => void;
    onOpenToggleModal: () => void;
}

export function UserDetailHeader({
    user,
    canEditUsers,
    isPre,
    isActive,
    roleCode,
    fullName,
    initials,
    formatDate,
    copyToClipboard,
    onBack,
    onStartEditing,
    onPrint,
    onOpenToggleModal,
}: UserDetailHeaderProps) {
    const roleMeta = getRoleMeta(roleCode);

    return (
        <div className="space-y-4">
            {/* 1. Barra de Navegación y Acciones Rápidas */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:text-primary-deep transition-colors group cursor-pointer w-fit"
                >
                    <div className="p-1.5 rounded-lg bg-accent border border-border-strong group-hover:bg-accent-hover transition-colors">
                        <ArrowLeft className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <span>Volver al Directorio de Usuarios</span>
                </button>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Botón Actualizar Datos (Abre pantalla completa) */}
                    {canEditUsers && (
                        <Button
                            type="button"
                            onClick={onStartEditing}
                            className="bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-medium gap-1.5 shadow-2xs cursor-pointer"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Actualizar Datos</span>
                        </Button>
                    )}

                    {/* Imprimir / Descargar Ficha Oficial en PDF A4 */}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onPrint}
                        title="Descargar o imprimir ficha técnica oficial en formato PDF (A4)"
                        className="rounded-xl border-border bg-card hover:bg-surface-subtle text-xs font-medium text-foreground-soft shadow-2xs gap-1.5 cursor-pointer transition-all"
                    >
                        <Printer className="w-3.5 h-3.5 text-primary" />
                        <span>Imprimir Ficha (PDF)</span>
                    </Button>

                    {/* Botón de Invitación para Pre-registrados */}
                    {isPre ? (
                        <div className="relative group/inv">
                            <Button
                                type="button"
                                disabled
                                className="rounded-xl border border-border bg-surface-subtle text-muted-subtle opacity-75 cursor-not-allowed text-xs font-medium gap-1.5 shadow-none"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>Enviar Invitación</span>
                            </Button>
                            <span className="absolute right-0 -top-8 hidden group-hover/inv:flex items-center bg-foreground text-white text-[10px] font-medium px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap z-30 pointer-events-none">
                                Próximamente: El estudiante autogestiona su clave
                            </span>
                        </div>
                    ) : canEditUsers && roleCode !== "DESARROLLADOR" ? (
                        <Button
                            type="button"
                            onClick={onOpenToggleModal}
                            className={`rounded-xl text-xs font-medium gap-1.5 shadow-2xs cursor-pointer ${
                                isActive
                                    ? "bg-card border border-destructive-border hover:bg-destructive-bg text-destructive"
                                    : "bg-card border border-success-border hover:bg-success-bg text-success"
                            }`}
                        >
                            {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            <span>{isActive ? "Inhabilitar Cuenta" : "Activar Cuenta"}</span>
                        </Button>
                    ) : null}
                </div>
            </div>

            {/* 2. Hero Card Ejecutivo - Simplificado, No Redundante y 100% Responsive */}
            <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Avatar, Nombre y Rol */}
                    <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                        <div
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border font-bold text-base sm:text-lg flex items-center justify-center shrink-0 shadow-2xs ${
                                isPre
                                    ? "bg-warning-bg border-warning-border text-warning"
                                    : "bg-accent border-border-strong text-accent-foreground"
                            }`}
                        >
                            {initials}
                        </div>

                        <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-base sm:text-xl lg:text-2xl font-extrabold text-foreground tracking-tight truncate max-w-full">
                                    {fullName}
                                </h1>
                                <span
                                    className={`inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full border shrink-0 ${roleMeta.bgClass} ${roleMeta.borderClass} ${roleMeta.textClass}`}
                                >
                                    <Shield className="w-3 h-3" />
                                    {roleMeta.label}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Registrado en padrón el: {formatDate(user.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* Estado de Acceso */}
                    <div className="flex items-center self-start sm:self-center shrink-0">
                        {isPre ? (
                            <div className="inline-flex items-center gap-2 text-xs font-semibold text-warning bg-warning-bg px-3 py-1.5 rounded-full border border-warning-border">
                                <span className="w-2 h-2 rounded-full bg-warning-dot"></span>
                                <span>Pre-registrado (Sin credenciales)</span>
                            </div>
                        ) : isActive ? (
                            <div className="inline-flex items-center gap-2 text-xs font-semibold text-success bg-success-bg px-3 py-1.5 rounded-full border border-success-border">
                                <span className="w-2 h-2 rounded-full bg-success-dot inline-block animate-pulse"></span>
                                <span>Cuenta Habilitada / Activa</span>
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-2 text-xs font-semibold text-destructive bg-destructive-bg px-3 py-1.5 rounded-full border border-destructive-border">
                                <span className="w-2 h-2 rounded-full bg-destructive inline-block"></span>
                                <span>Cuenta Inhabilitada</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tira de Metadatos Rápidos Unificada */}
                <div className="pt-3 border-t border-border-subtle flex items-center gap-4 sm:gap-6 flex-wrap text-xs text-muted-foreground">
                    {(user.cedula || user.demograficos?.cedula) && (
                        <div className="flex items-center gap-1.5">
                            <IdCard className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="font-mono font-semibold text-foreground">
                                {user.cedula || user.demograficos?.cedula}
                            </span>
                            <button
                                type="button"
                                onClick={() => copyToClipboard(user.cedula || user.demograficos!.cedula, "Cédula")}
                                className="text-muted-foreground hover:text-accent-foreground p-0.5 rounded cursor-pointer"
                                title="Copiar cédula"
                            >
                                <Copy className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-mono text-foreground">
                            {user.demograficos?.correoInstitucional || user.email}
                        </span>
                        <button
                            type="button"
                            onClick={() => copyToClipboard(user.demograficos?.correoInstitucional || user.email, "Correo")}
                            className="text-muted-foreground hover:text-accent-foreground p-0.5 rounded cursor-pointer"
                            title="Copiar correo"
                        >
                            <Copy className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {user.academico?.facultad && (
                        <div className="flex items-center gap-1.5 truncate max-w-xs" title={user.academico.facultad}>
                            <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="truncate">{user.academico.facultad}</span>
                        </div>
                    )}

                    {user.academico?.carpetaFisica && (
                        <div className="flex items-center gap-1.5">
                            <FolderOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>
                                Carpeta: <strong className="text-foreground">{user.academico.carpetaFisica}</strong>
                            </span>
                        </div>
                    )}

                    <div className="ml-auto text-[11px] text-muted-subtle">
                        ID: <span className="font-mono text-foreground-soft">{String(user.id)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
