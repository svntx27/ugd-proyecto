"use client";

import React from "react";
import {
    UserPlus,
    ArrowLeft,
    Check,
    Loader2,
    Info,
    IdCard,
    Mail,
    Phone,
    GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewDoctorandoPayload } from "@/services/user.service";

export interface DoctorandoRegisterViewProps {
    form: NewDoctorandoPayload;
    onChange: (form: NewDoctorandoPayload) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

export function DoctorandoRegisterView({
    form,
    onChange,
    onSubmit,
    onCancel,
    isSubmitting,
}: DoctorandoRegisterViewProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
            {/* Cabecera Superior del Modo Registro */}
            <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-accent border border-border-strong text-accent-foreground shrink-0">
                        <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-accent px-2 py-0.5 rounded-md">
                                Alta en Padrón Oficial UGD
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground bg-surface-subtle px-2 py-0.5 rounded-md">
                                Estudiante Doctorando
                            </span>
                        </div>
                        <h1 className="text-base sm:text-xl font-bold text-foreground truncate">
                            Registrar Nuevo Estudiante Doctorando
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Incorpora a un nuevo integrante al padrón doctoral. El estudiante creará su contraseña posteriormente en el portal de usuarios.
                        </p>
                    </div>
                </div>

                {/* Botones de Acción en Desktop */}
                <div className="hidden lg:flex items-center gap-2.5 shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="rounded-xl border-border text-xs font-semibold cursor-pointer hover:bg-surface-subtle"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        Volver al Directorio
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs px-4 py-2 cursor-pointer transition-all"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Registrando en Padrón...
                            </>
                        ) : (
                            <>
                                <Check className="w-3.5 h-3.5" /> Guardar Pre-registro
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Callout Informativo de Alto Impacto */}
            <div className="bg-card border border-border-strong rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
                <div className="p-2 rounded-xl bg-accent text-accent-foreground shrink-0 mt-0.5">
                    <Info className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-xs text-foreground-muted leading-relaxed">
                    <h4 className="font-bold text-sm text-foreground">
                        Flujo de Pre-registro y Creación Autónoma de Contraseña
                    </h4>
                    <p>
                        El estudiante quedará registrado en estado <strong>Pre-registrado</strong>. 
                        Por directriz institucional, el estudiante mantiene el <strong>control absoluto e independiente</strong> de definir su contraseña en el portal de usuarios utilizando su cédula y correo institucional. Su cuenta de acceso al sistema se activará en cuanto complete su verificación.
                    </p>
                </div>
            </div>

            {/* Formularios Categorizados */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                {/* Card 1: Datos Demográficos y de Identidad */}
                <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-border-subtle">
                        <div className="p-1.5 rounded-lg bg-surface-hover text-primary">
                            <IdCard className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-foreground">Datos Demográficos y de Identidad</h3>
                            <p className="text-[11px] text-muted-foreground">Información civil y oficial del estudiante</p>
                        </div>
                    </div>

                    {/* Cédula */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground-soft flex items-center justify-between">
                            <span>Cédula o Documento de Identidad *</span>
                            <span className="text-[10px] font-normal text-muted-foreground">Obligatorio</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Ej: 1712345678"
                            maxLength={15}
                            value={form.cedula}
                            onChange={(e) => onChange({ ...form, cedula: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder-muted-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                        />
                    </div>

                    {/* Nombres y Apellidos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground-soft">Nombres *</label>
                            <input
                                type="text"
                                required
                                placeholder="Ej: Dennis Adrian"
                                value={form.nombres}
                                onChange={(e) => onChange({ ...form, nombres: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder-muted-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground-soft">Apellidos *</label>
                            <input
                                type="text"
                                required
                                placeholder="Ej: Trujillo Vistin"
                                value={form.apellidos}
                                onChange={(e) => onChange({ ...form, apellidos: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder-muted-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                            />
                        </div>
                    </div>

                    {/* Sexo y Fecha de Nacimiento */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground-soft">Sexo / Género</label>
                            <select
                                value={form.sexo || ""}
                                onChange={(e) => onChange({ ...form, sexo: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                            >
                                <option value="">Seleccione sexo...</option>
                                <option value="H">Hombre (H)</option>
                                <option value="M">Mujer (M)</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground-soft">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                value={form.fechaNacimiento || ""}
                                onChange={(e) => onChange({ ...form, fechaNacimiento: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Card 2: Contacto Institucional */}
                <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-border-subtle">
                        <div className="p-1.5 rounded-lg bg-surface-hover text-primary">
                            <Mail className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-foreground">Contacto Institucional</h3>
                            <p className="text-[11px] text-muted-foreground">Canales de comunicación oficiales</p>
                        </div>
                    </div>

                    {/* Correo Institucional */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground-soft flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>Correo Institucional *</span>
                            </span>
                            <span className="text-[10px] font-semibold text-primary bg-accent px-1.5 py-0.5 rounded">
                                @uce.edu.ec
                            </span>
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="usuario.doctorando@uce.edu.ec"
                            value={form.correoInstitucional}
                            onChange={(e) => onChange({ ...form, correoInstitucional: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder-muted-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                        />
                    </div>

                    {/* Teléfono */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground-soft flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Teléfono de Contacto (Opcional)</span>
                        </label>
                        <input
                            type="tel"
                            placeholder="Ej: 0991234567"
                            value={form.telefono || ""}
                            onChange={(e) => onChange({ ...form, telefono: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder-muted-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                        />
                    </div>
                </div>

                {/* Card 3: Filiación Académica y Archivo UGD (Opcional) */}
                <div className="lg:col-span-2 bg-card border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-border-subtle">
                        <div className="p-1.5 rounded-lg bg-surface-hover text-primary">
                            <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-foreground">Filiación Académica y Archivo UGD (Opcional)</h3>
                            <p className="text-[11px] text-muted-foreground">Títulos universitarios previos y ubicación en archivo físico UGD</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground-soft">Título de Tercer Nivel (Pregrado)</label>
                            <input
                                type="text"
                                placeholder="Ej: Ingeniero en Sistemas de Información"
                                value={form.tituloTercerNivel || ""}
                                onChange={(e) => onChange({ ...form, tituloTercerNivel: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder-muted-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground-soft">Título de Cuarto Nivel (Maestría / Posgrado)</label>
                            <input
                                type="text"
                                placeholder="Ej: Magíster en Ciberseguridad y Redes"
                                value={form.tituloCuartoNivel || ""}
                                onChange={(e) => onChange({ ...form, tituloCuartoNivel: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder-muted-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground-soft">Carpeta Física en Archivo UGD</label>
                            <input
                                type="text"
                                placeholder="Ej: Carpeta: TEST-02"
                                value={form.carpeta || ""}
                                onChange={(e) => onChange({ ...form, carpeta: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder-muted-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground-soft">N° Orden / Nómina</label>
                            <input
                                type="number"
                                placeholder="Ej: 9002"
                                value={form.numeroOrden !== null && form.numeroOrden !== undefined ? form.numeroOrden : ""}
                                onChange={(e) => onChange({ ...form, numeroOrden: e.target.value ? Number(e.target.value) : null })}
                                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder-muted-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra Flotante de Acciones en Móviles y Tablets */}
            <div className="block lg:hidden sticky bottom-0 z-40 bg-card/95 backdrop-blur-md border-t border-border p-3 -mx-2 sm:-mx-0 shadow-lg rounded-t-2xl">
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="w-1/3 rounded-xl border-border text-xs font-semibold py-2.5 cursor-pointer"
                    >
                        Descartar
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-2/3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold py-2.5 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Registrando...
                            </>
                        ) : (
                            <>
                                <Check className="w-3.5 h-3.5" /> Guardar Pre-registro
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
}
