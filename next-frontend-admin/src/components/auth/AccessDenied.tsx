"use client";

import Link from "next/link";
import { ArrowLeft, Home, Lock, ShieldAlert } from "lucide-react";
import { AuthService } from "@/services/auth.service";
import { getRoleMeta } from "@/lib/role-badge.helper";

interface AccessDeniedProps {
    requiredRoles?: string[];
    requiredPermission?: string;
    moduleName?: string;
}

export function AccessDenied({
    requiredRoles = [],
    requiredPermission,
    moduleName = "este módulo",
}: AccessDeniedProps) {
    const user = AuthService.getCurrentUser();
    const currentRoleMeta = getRoleMeta(user?.role_code);

    return (
        <div className="relative w-full min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center text-center px-4 py-12 select-none">
            {/* Watermark 403 de fondo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-0">
                <span className="text-[14rem] sm:text-[22rem] font-black text-border/40 tracking-tighter leading-none select-none">
                    403
                </span>
            </div>

            {/* Contenido */}
            <div className="relative z-10 max-w-xl w-full flex flex-col items-center space-y-6 bg-card/95 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-border shadow-sm">
                <div className="relative">
                    <div className="w-20 h-20 rounded-3xl border border-warning-border bg-warning-bg flex items-center justify-center shadow-xs">
                        <Lock className="w-9 h-9 text-warning stroke-[2]" />
                    </div>
                </div>

                {/* Encabezado */}
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-warning bg-warning-bg border border-warning-border">
                        Área Institucional Protegida
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                        Acceso Restringido
                    </h1>
                    <p className="text-foreground-muted text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                        No dispones de los privilegios institucionales suficientes para gestionar{" "}
                        <span className="text-foreground font-semibold underline decoration-warning/40 underline-offset-4">
                            {moduleName}
                        </span>.
                    </p>
                </div>

                {/* Indicador de sesión */}
                <div className="w-full flex flex-wrap items-center justify-center gap-2.5 text-xs py-1">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-background border border-border">
                        <span className="text-foreground-muted font-medium">Sesión activa:</span>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold border ${currentRoleMeta.bgClass} ${currentRoleMeta.borderClass} ${currentRoleMeta.textClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${currentRoleMeta.dotClass}`} />
                            {currentRoleMeta.label}
                        </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background border border-border text-foreground-muted font-mono">
                        Código: SEC-403
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-xs"
                    >
                        <Home className="w-4 h-4" /> Volver al Inicio
                    </Link>
                    <Link
                        href="/dashboard/calendario"
                        className="inline-flex items-center justify-center gap-2 text-foreground-soft hover:text-foreground px-5 py-2.5 rounded-xl text-sm transition-colors border border-border bg-card hover:bg-surface-hover shadow-xs"
                    >
                        <ArrowLeft className="w-4 h-4" /> Ir a Calendario
                    </Link>
                </div>
            </div>
        </div>
    );
}
