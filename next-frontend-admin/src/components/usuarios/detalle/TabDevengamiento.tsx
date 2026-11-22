"use client";

import React from "react";
import { Award, Copy, Layers } from "lucide-react";
import { UserDetail } from "@/services/user.service";

export interface TabDevengamientoProps {
    user: UserDetail;
    formatDate: (dateString?: string | null) => string;
    copyToClipboard: (text: string, label: string) => void;
}

export function TabDevengamiento({
    user,
    formatDate,
    copyToClipboard,
}: TabDevengamientoProps) {
    const dev = user.expedientes?.[0]?.devengamiento;
    const adendas = user.expedientes?.[0]?.adendas || [];

    return (
        <div className="space-y-6">
            {/* Subsección 1: Devengamiento Institucional */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-accent text-accent-foreground border border-border-strong">
                            <Award className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-foreground">
                                Compromiso de Devengamiento Institucional
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Retribución laboral obligatoria en la UCE por beca doctoral otorgada
                            </p>
                        </div>
                    </div>

                    {dev && (
                        <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${
                                dev.estado === "EN_CURSO"
                                    ? "bg-success-bg text-success border-success-border"
                                    : dev.estado === "FINALIZADO"
                                    ? "bg-info-bg text-info border-info-border"
                                    : "bg-warning-bg text-warning border-warning-border"
                            }`}
                        >
                            {dev.estado === "EN_CURSO" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-success-dot animate-pulse"></span>
                            )}
                            {dev.estado.replace(/_/g, " ")}
                        </span>
                    )}
                </div>

                {dev ? (
                    <div className="space-y-5">
                        {/* Resumen Destacado Senescyt y Duración */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-surface-subtle rounded-2xl border border-border">
                            <div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                                    Registro Senescyt
                                </span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="font-mono font-bold text-base text-foreground">
                                        {dev.registroSenescyt || "En trámite"}
                                    </span>
                                    {dev.registroSenescyt && (
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(dev.registroSenescyt!, "Código Senescyt")}
                                            className="text-muted-foreground hover:text-accent-foreground p-1 rounded-md hover:bg-card transition-colors cursor-pointer"
                                            title="Copiar código Senescyt"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                                    Tiempo a Devengar
                                </span>
                                <p className="font-semibold text-foreground text-sm mt-0.5">
                                    {dev.tiempoTexto || "No calculado"}
                                </p>
                            </div>

                            <div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                                    Fecha de Inicio
                                </span>
                                <p className="font-semibold text-foreground text-sm mt-0.5">
                                    {formatDate(dev.fechaInicio)}
                                </p>
                            </div>

                            <div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                                    Fecha Fin Estimada
                                </span>
                                <p className="font-semibold text-foreground text-sm mt-0.5">
                                    {formatDate(dev.fechaFinEstimada)}
                                </p>
                            </div>
                        </div>

                        {/* Respaldo Documental de Oficios */}
                        <div>
                            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2.5">
                                Respaldo Documental y Oficios UGD
                            </h3>
                            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                <div className="p-3 bg-surface-subtle/70 border border-border rounded-xl">
                                    <dt className="text-muted-foreground font-medium">Oficio de Notificación:</dt>
                                    <dd className="font-mono font-bold text-foreground mt-1 truncate" title={dev.oficioNotificacion || "—"}>
                                        {dev.oficioNotificacion || "—"}
                                    </dd>
                                </div>
                                <div className="p-3 bg-surface-subtle/70 border border-border rounded-xl">
                                    <dt className="text-muted-foreground font-medium">Oficio Acta de Terminación:</dt>
                                    <dd className="font-mono font-bold text-foreground mt-1 truncate" title={dev.oficioActaTerminacion || "—"}>
                                        {dev.oficioActaTerminacion || "—"}
                                    </dd>
                                </div>
                                <div className="p-3 bg-surface-subtle/70 border border-border rounded-xl">
                                    <dt className="text-muted-foreground font-medium">Oficio Cierre de Proyecto:</dt>
                                    <dd className="font-mono font-bold text-foreground mt-1 truncate" title={dev.oficioCierreProyecto || "—"}>
                                        {dev.oficioCierreProyecto || "—"}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 text-center rounded-2xl border border-dashed border-border bg-surface-subtle/50 text-xs text-muted-foreground">
                        No se registra compromiso de devengamiento activo para este estudiante (en período formativo o sin beca de retribución).
                    </div>
                )}
            </div>

            {/* Subsección 2: Adendas Contractuales en Tabla Limpia */}
            <div className="space-y-4 pt-4 border-t border-border-subtle">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-accent text-accent-foreground border border-border-strong">
                            <Layers className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-foreground">
                                Historial de Adendas y Modificaciones
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Prórrogas y cambios formalizados al contrato de beca original
                            </p>
                        </div>
                    </div>

                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface-subtle text-foreground-soft border border-border">
                        {adendas.length} registrada(s)
                    </span>
                </div>

                {adendas.length > 0 ? (
                    <div className="overflow-x-auto rounded-2xl border border-border">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead className="bg-surface-subtle text-muted-foreground font-bold uppercase text-[10px] tracking-wider border-b border-border">
                                <tr>
                                    <th className="p-3 text-center w-24">Adenda</th>
                                    <th className="p-3">Tipo de Modificación</th>
                                    <th className="p-3 text-center w-28">Plazo Agregado</th>
                                    <th className="p-3">Período de Vigencia Aprobado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {adendas.map((adenda) => (
                                    <tr key={adenda.id || adenda.numeroAdenda} className="hover:bg-surface-subtle/50 transition-colors">
                                        <td className="p-3 text-center">
                                            <span className="font-bold text-primary bg-accent px-2 py-0.5 rounded-md border border-border-strong text-[11px]">
                                                N° {adenda.numeroAdenda}
                                            </span>
                                        </td>
                                        <td className="p-3 font-semibold text-foreground">
                                            {adenda.tipoModificacion || "Ampliación de Plazo"}
                                        </td>
                                        <td className="p-3 text-center font-mono font-semibold text-foreground">
                                            {adenda.meses ? `+${adenda.meses} meses` : "—"}
                                        </td>
                                        <td className="p-3 text-foreground-muted">
                                            {formatDate(adenda.fechaInicio)} al {formatDate(adenda.fechaFin)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-6 text-center rounded-2xl border border-dashed border-border bg-surface-subtle/50 text-xs text-muted-foreground">
                        El contrato original no registra adendas ni prórrogas formalizadas en el archivo de la UGD.
                    </div>
                )}
            </div>
        </div>
    );
}
