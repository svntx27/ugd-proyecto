"use client";

import { Shield, Terminal, ClipboardList, Wrench } from "lucide-react";
import { AdminUser } from "@/services/auth.service";
import { getRoleMeta } from "@/lib/role-badge.helper";

interface RoleDashboardHeaderProps {
    user: AdminUser | null;
    isSystemOnline?: boolean;
    startHour?: string;
    endHour?: string;
}

export function RoleDashboardHeader({
    user,
    isSystemOnline = true,
    startHour = "08:00",
    endHour = "16:00",
}: RoleDashboardHeaderProps) {
    const roleCode = user?.role_code || "";
    const roleMeta = getRoleMeta(roleCode);

    const currentDate = new Intl.DateTimeFormat("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(new Date());

    const getContextData = () => {
        switch (roleCode) {
            case "DIRECTOR":
                return {
                    title: "Centro de Supervisión y Gestión Estratégica",
                    subtitle: "Control general de las operaciones de la Unidad de Gestión de Doctorados (UGD).",
                    badge: "Dirección Ejecutiva",
                    icon: Shield,
                };
            case "DESARROLLADOR":
                return {
                    title: "Consola de Infraestructura y Desarrollo",
                    subtitle: "Diagnóstico de servicios, base de datos Neon PostgreSQL y configuración del sistema.",
                    badge: "Super Admin Técnico",
                    icon: Terminal,
                };
            case "ANALISTA_PROCESOS":
                return {
                    title: "Mesa Operativa de Atención Doctoral",
                    subtitle: "Seguimiento y gestión en tiempo real de citas y trámites para doctorandos UCE.",
                    badge: "Operación de Procesos",
                    icon: ClipboardList,
                };
            case "ANALISTA_TECNICO":
                return {
                    title: "Soporte Técnico de Estaciones UGD",
                    subtitle: "Supervisión de disponibilidad física, representantes y capacidad de atención.",
                    badge: "Soporte Técnico",
                    icon: Wrench,
                };
            default:
                return {
                    title: "Panel General de Administración",
                    subtitle: "Gestión de citas y representantes de la Unidad de Gestión de Doctorados.",
                    badge: "Administración UGD",
                    icon: Shield,
                };
        }
    };

    const context = getContextData();
    const ContextIcon = context.icon;

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border">
            <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 text-xs text-foreground-muted flex-wrap">
                    <span className="capitalize font-medium text-foreground-soft">{currentDate}</span>
                    <span className="text-border-strong">•</span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${roleMeta.bgClass} ${roleMeta.borderClass} ${roleMeta.textClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${roleMeta.dotClass}`} />
                        {roleMeta.label}
                    </span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                    {context.title}
                </h1>
                <p className="text-xs sm:text-sm text-foreground-muted max-w-2xl leading-relaxed">
                    {context.subtitle}
                </p>
            </div>

            {/* Badge de Estado del Sistema */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-card border border-border rounded-xl shrink-0 self-start sm:self-center shadow-2xs">
                <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSystemOnline ? 'bg-success' : 'bg-warning'}`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isSystemOnline ? 'bg-success-dot' : 'bg-warning-dot'}`} />
                </span>
                <div className="text-xs">
                    <span className="font-semibold text-foreground">
                        {isSystemOnline ? "Sistema UGD en Línea" : "En Mantenimiento"}
                    </span>
                    <span className="text-muted-foreground text-[11px] ml-1.5 hidden md:inline font-mono">
                        ({startHour} - {endHour})
                    </span>
                </div>
            </div>
        </div>
    );
}
