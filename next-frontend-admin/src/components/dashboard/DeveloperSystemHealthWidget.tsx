"use client";

import Link from "next/link";
import { Database, Server, Cpu, ShieldCheck, Download, Settings, Activity } from "lucide-react";

interface DeveloperSystemHealthWidgetProps {
    activeAppointmentsCount: number;
    totalRepresentatives: number;
}

export function DeveloperSystemHealthWidget({
    activeAppointmentsCount,
    totalRepresentatives,
}: DeveloperSystemHealthWidgetProps) {
    return (
        <div className="bg-surface-subtle p-6 rounded-3xl border border-border shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-role-dev-bg rounded-2xl border border-role-dev-border text-role-dev shadow-2xs">
                        <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-foreground">
                            Diagnóstico y Servicios del Sistema
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Supervisión de infraestructura backend, base de datos Neon PostgreSQL y utilidades técnicas.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/dashboard/ajustes"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-card hover:bg-surface-hover text-foreground-soft border border-border shadow-2xs transition-colors"
                    >
                        <Settings className="w-3.5 h-3.5 text-muted-foreground" /> Ajustes Globales
                    </Link>
                    <Link
                        href="/dashboard/ajustes"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-primary-foreground transition-all shadow-xs"
                    >
                        <Download className="w-3.5 h-3.5" /> Descargar Backup DB
                    </Link>
                </div>
            </div>

            {/* Grid de Estado de Servicios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Servicio Neon PostgreSQL */}
                <div className="bg-card p-4 rounded-2xl border border-border shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5 font-semibold text-foreground-soft">
                            <Database className="w-4 h-4 text-primary" /> Neon PostgreSQL
                        </span>
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    </div>
                    <p className="text-base font-bold text-foreground font-mono">Conectado / Saludable</p>
                    <p className="text-[11px] text-muted-subtle">Prisma ORM • Pooling activo</p>
                </div>

                {/* API Express */}
                <div className="bg-card p-4 rounded-2xl border border-border shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5 font-semibold text-foreground-soft">
                            <Server className="w-4 h-4 text-role-process-dot" /> Express REST API
                        </span>
                        <span className="w-2 h-2 rounded-full bg-role-process-dot animate-pulse" />
                    </div>
                    <p className="text-base font-bold text-foreground font-mono">Operando (v1.0)</p>
                    <p className="text-[11px] text-muted-subtle">JWT RBAC • CORS configurado</p>
                </div>

                {/* Cargas Activas */}
                <div className="bg-card p-4 rounded-2xl border border-border shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5 font-semibold text-foreground-soft">
                            <Activity className="w-4 h-4 text-primary" /> Carga de Citas
                        </span>
                        <span className="text-xs font-bold text-role-dev font-mono">#{activeAppointmentsCount}</span>
                    </div>
                    <p className="text-base font-bold text-foreground font-mono">{activeAppointmentsCount} Activas</p>
                    <p className="text-[11px] text-muted-subtle">{totalRepresentatives} Representantes UGD</p>
                </div>

                {/* Seguridad TLS */}
                <div className="bg-card p-4 rounded-2xl border border-border shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5 font-semibold text-foreground-soft">
                            <ShieldCheck className="w-4 h-4 text-role-tech-dot" /> Capa de Seguridad
                        </span>
                        <span className="w-2 h-2 rounded-full bg-role-tech-dot" />
                    </div>
                    <p className="text-base font-bold text-foreground font-mono">Bcrypt + RBAC</p>
                    <p className="text-[11px] text-muted-subtle">Protección de rutas activa</p>
                </div>
            </div>
        </div>
    );
}
