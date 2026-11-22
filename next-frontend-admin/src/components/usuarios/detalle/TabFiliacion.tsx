"use client";

import React from "react";
import { IdCard, Copy, GraduationCap } from "lucide-react";
import { UserDetail } from "@/services/user.service";

export interface TabFiliacionProps {
    user: UserDetail;
    isDoctorando: boolean;
    formatDate: (dateString?: string | null) => string;
    copyToClipboard: (text: string, label: string) => void;
}

export function TabFiliacion({
    user,
    isDoctorando,
    formatDate,
    copyToClipboard,
}: TabFiliacionProps) {
    return (
        <div className="space-y-6">
            {/* Bloque 1: Datos de Identidad y Contacto */}
            <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border-subtle">
                    <div className="p-2 rounded-xl bg-accent text-accent-foreground border border-border-strong">
                        <IdCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-foreground">
                            Datos Demográficos y de Identidad
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Filiación personal y canales oficiales de comunicación
                        </p>
                    </div>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-xs">
                    <div>
                        <dt className="text-muted-foreground font-medium">Cédula de Identidad</dt>
                        <dd className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono font-bold text-sm text-foreground">
                                {user.cedula || user.demograficos?.cedula || "No registrada"}
                            </span>
                            {(user.cedula || user.demograficos?.cedula) && (
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(user.cedula || user.demograficos!.cedula, "Cédula")}
                                    className="text-muted-foreground hover:text-accent-foreground p-0.5 rounded cursor-pointer"
                                    title="Copiar cédula"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-muted-foreground font-medium">Nombres</dt>
                        <dd className="font-semibold text-foreground text-sm mt-0.5">
                            {user.demograficos?.nombres || user.name || "—"}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-muted-foreground font-medium">Apellidos</dt>
                        <dd className="font-semibold text-foreground text-sm mt-0.5">
                            {user.demograficos?.apellidos || "—"}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-muted-foreground font-medium">Sexo / Género</dt>
                        <dd className="font-semibold text-foreground text-sm mt-0.5">
                            {user.demograficos?.sexo === "H" ? "Hombre (H)" : user.demograficos?.sexo === "M" ? "Mujer (M)" : "No especificado"}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-muted-foreground font-medium">Fecha de Nacimiento</dt>
                        <dd className="font-semibold text-foreground text-sm mt-0.5">
                            {formatDate(user.demograficos?.fechaNacimiento)}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-muted-foreground font-medium">Teléfono de Contacto</dt>
                        <dd className="font-mono font-semibold text-foreground text-sm mt-0.5">
                            {user.demograficos?.telefono || "No registrado"}
                        </dd>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3">
                        <dt className="text-muted-foreground font-medium">Correo Institucional UCE</dt>
                        <dd className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono font-bold text-sm text-foreground">
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
                        </dd>
                    </div>
                </dl>
            </div>

            {/* Bloque 2: Filiación Académica y Archivo Físico UGD */}
            {isDoctorando && (
                <div className="space-y-4 pt-4 border-t border-border-subtle">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-border-subtle">
                        <div className="p-2 rounded-xl bg-accent text-accent-foreground border border-border-strong">
                            <GraduationCap className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-foreground">
                                Filiación Académica y Archivo Físico UGD
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Adscripción universitaria en la UCE y títulos profesionales
                            </p>
                        </div>
                    </div>

                    <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-xs">
                        <div>
                            <dt className="text-muted-foreground font-medium">Facultad de Procedencia</dt>
                            <dd className="flex items-center gap-2 mt-0.5">
                                <span className="font-semibold text-foreground text-sm">
                                    {user.academico?.facultad || "Sin facultad asignada"}
                                </span>
                                {user.academico?.facultadCodigo && (
                                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-accent text-accent-foreground border border-border-strong">
                                        {user.academico.facultadCodigo}
                                    </span>
                                )}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-muted-foreground font-medium">Carrera / Departamento</dt>
                            <dd className="font-semibold text-foreground text-sm mt-0.5">
                                {user.academico?.carrera || "Sin carrera asignada"}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-muted-foreground font-medium">Carpeta en Archivo UGD</dt>
                            <dd className="flex items-center gap-2 mt-0.5">
                                <span className="font-bold text-foreground text-sm">
                                    Carpeta: {user.academico?.carpetaFisica || "Sin Carpeta"}
                                </span>
                                {user.academico?.numeroOrden && (
                                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-surface-subtle text-foreground-soft border border-border">
                                        N° {user.academico.numeroOrden}
                                    </span>
                                )}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-muted-foreground font-medium">Título de 3er Nivel (Pregrado)</dt>
                            <dd className="font-semibold text-foreground text-sm mt-0.5">
                                {user.academico?.tituloTercerNivel || "No registrado"}
                            </dd>
                        </div>

                        <div className="sm:col-span-2">
                            <dt className="text-muted-foreground font-medium">Título de 4to Nivel (Maestría / Posgrado)</dt>
                            <dd className="font-semibold text-foreground text-sm mt-0.5">
                                {user.academico?.tituloCuartoNivel || "No registrado"}
                            </dd>
                        </div>
                    </dl>
                </div>
            )}
        </div>
    );
}
