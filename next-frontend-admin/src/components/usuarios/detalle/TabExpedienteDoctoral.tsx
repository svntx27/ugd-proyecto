"use client";

import React from "react";
import { CheckCircle, AlertTriangle, FileText } from "lucide-react";
import { UserDetail } from "@/services/user.service";

export interface TabExpedienteDoctoralProps {
    user: UserDetail;
    formatDate: (dateString?: string | null) => string;
    parseObservacionesList: (text?: string | null) => string[];
}

export function TabExpedienteDoctoral({
    user,
    formatDate,
    parseObservacionesList,
}: TabExpedienteDoctoralProps) {
    return (
        <div className="space-y-6">
            {user.expedientes && user.expedientes.length > 0 ? (
                user.expedientes.map((exp, idx) => (
                    <div key={exp.id || idx} className="space-y-6">
                        {/* Cabecera del Programa */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
                            <div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                                    Programa Doctoral
                                </span>
                                <h2 className="text-base sm:text-lg font-bold text-foreground">
                                    {exp.programaDoctoral || "Programa no especificado"}
                                </h2>
                                {exp.tituloAObtener && (
                                    <p className="text-xs text-foreground-muted mt-0.5">
                                        Título a obtener: <span className="font-semibold text-foreground">{exp.tituloAObtener}</span>
                                    </p>
                                )}
                            </div>

                            <span
                                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border self-start sm:self-auto ${
                                    exp.estado === "GRADUADO"
                                        ? "bg-success-bg text-success border-success-border"
                                        : exp.estado === "EN_ESTUDIOS"
                                        ? "bg-info-bg text-info border-info-border"
                                        : exp.estado === "EN_DEVENGAMIENTO"
                                        ? "bg-warning-bg text-warning border-warning-border"
                                        : "bg-surface-subtle text-foreground-soft border-border"
                                }`}
                            >
                                {exp.estado.replace(/_/g, " ")}
                            </span>
                        </div>

                        {/* Tema de Tesis / Proyecto de Investigación */}
                        {exp.tituloInvestigacion && (
                            <div className="bg-surface-subtle border-l-4 border-primary rounded-r-2xl p-4 space-y-1">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                                    Tema de Tesis / Proyecto de Investigación
                                </span>
                                <p className="text-sm font-medium text-foreground italic leading-relaxed">
                                    "{exp.tituloInvestigacion}"
                                </p>
                            </div>
                        )}

                        {/* Lista Semántica de Metadatos Contractuales e Institucionales */}
                        <div>
                            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
                                Información Institucional y Financiamiento
                            </h3>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-xs">
                                <div>
                                    <dt className="text-muted-foreground font-medium">Institución de Destino</dt>
                                    <dd className="font-semibold text-foreground text-sm mt-0.5">{exp.institucionDestino || "—"}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground font-medium">País de Destino</dt>
                                    <dd className="font-semibold text-foreground text-sm mt-0.5">{exp.paisDestino || "—"}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground font-medium">Convenio</dt>
                                    <dd className="font-semibold text-foreground text-sm mt-0.5">{exp.convenio || "Directo Institucional"}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground font-medium">Tipo de Financiamiento</dt>
                                    <dd className="font-semibold text-foreground text-sm mt-0.5">{exp.tipoFinanciamiento || "Beca"}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground font-medium">Período de Contrato</dt>
                                    <dd className="font-semibold text-foreground text-sm mt-0.5">
                                        {formatDate(exp.contratoInicio)} al {formatDate(exp.contratoFin)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground font-medium">Duración Computada</dt>
                                    <dd className="font-mono font-semibold text-foreground text-sm mt-0.5">
                                        {exp.contratoMeses !== null && exp.contratoMeses !== undefined ? `${exp.contratoMeses} meses` : "—"}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground font-medium">Apoyo a Proyecto</dt>
                                    <dd className="font-semibold text-foreground text-sm mt-0.5">
                                        {exp.tieneApoyoProyecto ? (
                                            <span className="inline-flex items-center gap-1 text-success">
                                                <CheckCircle className="w-3.5 h-3.5" /> Con apoyo de proyecto
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground font-normal">Sin apoyo adicional</span>
                                        )}
                                    </dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="text-muted-foreground font-medium">Oficio de Registro de Proyecto</dt>
                                    <dd className="font-mono font-semibold text-foreground text-sm mt-0.5">
                                        {exp.oficioRegistroProyecto || "—"}{" "}
                                        {exp.fechaOficioRegistro ? `(Aprobado: ${formatDate(exp.fechaOficioRegistro)})` : ""}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Observaciones Oficiales UGD */}
                        {exp.observaciones && parseObservacionesList(exp.observaciones).length > 0 && (
                            <div className="bg-surface-subtle border border-border-strong rounded-2xl p-4 sm:p-5 space-y-3">
                                <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-border">
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-primary" />
                                        Observaciones Oficiales de la UGD
                                    </span>
                                    <span className="text-[11px] font-semibold text-foreground-muted bg-card px-2.5 py-0.5 rounded-full border border-border">
                                        {parseObservacionesList(exp.observaciones).length === 1
                                            ? "1 observación registrada"
                                            : `${parseObservacionesList(exp.observaciones).length} observaciones registradas`}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    {parseObservacionesList(exp.observaciones).map((obsItem, obsIdx) => (
                                        <div
                                            key={obsIdx}
                                            className="bg-card border border-border rounded-xl p-3.5 space-y-1 shadow-2xs"
                                        >
                                            <div className="flex items-center justify-between text-[11px] font-bold text-foreground-muted">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                    Nota #{obsIdx + 1}
                                                </span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-foreground leading-relaxed font-normal">
                                                {obsItem}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Alerta Legal si existe */}
                        {exp.tieneAlertaLegal && (
                            <div className="bg-destructive-bg border border-destructive-border rounded-2xl p-4 flex items-center gap-3 text-xs text-destructive">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span className="font-semibold">
                                    Este expediente tiene registrada una alerta o proceso administrativo legal pendiente.
                                </span>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <div className="p-8 text-center text-xs text-muted-foreground">
                    No se registran expedientes doctorales asociados a este perfil.
                </div>
            )}
        </div>
    );
}
