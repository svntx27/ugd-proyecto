"use client";

import React from "react";
import {
    FileEdit,
    IdCard,
    GraduationCap,
    Globe2,
    BookOpen,
    FileText,
    Layers,
    Award,
    ShieldCheck,
    Plus,
    Trash2,
    Save,
    X,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface UserDetailEditViewProps {
    fullName: string;
    isDoctorando: boolean;
    editForm: any;
    setEditForm: React.Dispatch<React.SetStateAction<any>>;
    saving: boolean;
    handleSaveEdit: (e?: React.FormEvent) => Promise<void>;
    cancelEditing: () => void;
    handleAddObservacion: () => void;
    handleRemoveObservacion: (index: number) => void;
    handleUpdateObservacionItem: (index: number, newText: string) => void;
    handleAddAdenda: () => void;
    handleRemoveAdenda: (index: number) => void;
    handleUpdateAdendaItem: (index: number, field: string, value: any) => void;
}

export function UserDetailEditView({
    fullName,
    isDoctorando,
    editForm,
    setEditForm,
    saving,
    handleSaveEdit,
    cancelEditing,
    handleAddObservacion,
    handleRemoveObservacion,
    handleUpdateObservacionItem,
    handleAddAdenda,
    handleRemoveAdenda,
    handleUpdateAdendaItem,
}: UserDetailEditViewProps) {
    return (
        <form onSubmit={handleSaveEdit} className="space-y-5 sm:space-y-6">
            {/* Cabecera Superior del Modo Edición */}
            <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-accent border border-border-strong text-accent-foreground shrink-0">
                        <FileEdit className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-accent px-2 py-0.5 rounded-md">
                                Modo Edición en Pantalla Completa
                            </span>
                        </div>
                        <h1 className="text-base sm:text-xl font-bold text-foreground truncate">
                            Actualizar Información: {fullName}
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Modifica de forma parcial los campos necesarios. Los campos vacíos conservarán su valor o permanecerán opcionales.
                        </p>
                    </div>
                </div>

                {/* Botones de Acción en Pantallas Grandes (Desktop / PC) */}
                <div className="hidden lg:flex items-center gap-2.5 shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={cancelEditing}
                        disabled={saving}
                        className="rounded-xl border-border text-xs font-semibold cursor-pointer"
                    >
                        <X className="w-4 h-4 mr-1.5" />
                        <span>Cancelar</span>
                    </Button>
                    <Button
                        type="submit"
                        disabled={saving}
                        className="bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Guardando...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Guardar Cambios</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Bloques de Formulario en Pantalla Completa por Categoría */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* COLUMNA IZQUIERDA (2 Columnas): Datos Personales y Académicos */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Bloque 1: Identidad y Datos Demográficos */}
                    <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-accent border border-border-strong text-accent-foreground">
                                    <IdCard className="w-4 h-4" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-foreground">
                                        1. Datos Demográficos y de Identidad
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Cédula, nombres, contacto y datos civiles.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground-soft flex items-center justify-between">
                                    <span>Cédula de Identidad</span>
                                </label>
                                <input
                                    type="text"
                                    value={editForm.cedula}
                                    onChange={(e) => setEditForm({ ...editForm, cedula: e.target.value })}
                                    placeholder="(Sin cédula registrada)"
                                    className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground-soft">Nombres *</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.nombres}
                                    onChange={(e) => setEditForm({ ...editForm, nombres: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary font-medium"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground-soft">Apellidos</label>
                                <input
                                    type="text"
                                    value={editForm.apellidos}
                                    onChange={(e) => setEditForm({ ...editForm, apellidos: e.target.value })}
                                    placeholder="(Sin registrar)"
                                    className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary font-medium"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground-soft">Sexo / Género</label>
                                <select
                                    value={editForm.sexo}
                                    onChange={(e) => setEditForm({ ...editForm, sexo: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary font-medium"
                                >
                                    <option value="">No especificado / Sin definir</option>
                                    <option value="H">Hombre (H)</option>
                                    <option value="M">Mujer (M)</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground-soft">Fecha de Nacimiento</label>
                                <input
                                    type="date"
                                    value={editForm.fechaNacimiento}
                                    onChange={(e) => setEditForm({ ...editForm, fechaNacimiento: e.target.value })}
                                    className="w-full px-3.5 py-2 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground-soft">Teléfono de Contacto</label>
                                <input
                                    type="tel"
                                    value={editForm.telefono}
                                    onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                                    placeholder="(Sin teléfono registrado)"
                                    className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                                />
                            </div>

                            <div className="space-y-1 sm:col-span-2 md:col-span-3">
                                <label className="text-xs font-semibold text-foreground-soft">Correo Institucional UCE (@uce.edu.ec)</label>
                                <input
                                    type="email"
                                    value={editForm.correoInstitucional}
                                    onChange={(e) => setEditForm({ ...editForm, correoInstitucional: e.target.value })}
                                    placeholder="usuario@uce.edu.ec"
                                    className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bloque 2: Filiación Académica y Archivo UGD (si es Doctorando) */}
                    {isDoctorando && (
                        <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-accent border border-border-strong text-accent-foreground">
                                        <GraduationCap className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-foreground">
                                            2. Filiación Académica y Archivo UGD
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Ubicación de archivo físico y títulos universitarios.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground-soft">Facultad UCE</label>
                                    <input
                                        type="text"
                                        value={editForm.facultad}
                                        onChange={(e) => setEditForm({ ...editForm, facultad: e.target.value })}
                                        placeholder="Ej: Jurisprudencia, Ciencias Políticas y Sociales"
                                        className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground-soft">Carrera / Departamento</label>
                                    <input
                                        type="text"
                                        value={editForm.carrera}
                                        onChange={(e) => setEditForm({ ...editForm, carrera: e.target.value })}
                                        placeholder="Ej: Derecho"
                                        className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground-soft">Carpeta Física en Archivo UGD</label>
                                    <input
                                        type="text"
                                        value={editForm.carpeta}
                                        onChange={(e) => setEditForm({ ...editForm, carpeta: e.target.value })}
                                        placeholder="Ej: TEST-02, 14.1, Sin Carpeta"
                                        className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground-soft">N° Ordinal en Nómina</label>
                                    <input
                                        type="number"
                                        value={editForm.numeroOrden}
                                        onChange={(e) => setEditForm({ ...editForm, numeroOrden: e.target.value })}
                                        placeholder="Ej: 9002"
                                        className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground-soft">Título de Tercer Nivel</label>
                                    <input
                                        type="text"
                                        value={editForm.tituloTercerNivel}
                                        onChange={(e) => setEditForm({ ...editForm, tituloTercerNivel: e.target.value })}
                                        placeholder="Ej: Ingeniero en Sistemas, Licenciado en..."
                                        className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground-soft">Título de Cuarto Nivel (Maestría)</label>
                                    <input
                                        type="text"
                                        value={editForm.tituloCuartoNivel}
                                        onChange={(e) => setEditForm({ ...editForm, tituloCuartoNivel: e.target.value })}
                                        placeholder="Ej: Magíster en Ciberseguridad"
                                        className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bloque 3: Programa Doctoral, Institución de Destino y Convenio */}
                    {isDoctorando && (
                        <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-accent border border-border-strong text-accent-foreground">
                                        <Globe2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-foreground">
                                            3. Programa Doctoral, Destino y Convenio
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Universidad receptora, país, titulación a obtener y base legal.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3.5">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground-soft">Programa Doctoral Oficial</label>
                                    <input
                                        type="text"
                                        value={editForm.programaDoctoral}
                                        onChange={(e) => setEditForm({ ...editForm, programaDoctoral: e.target.value })}
                                        placeholder="Ej: Doctorado en Informática y Ciencias de la Computación"
                                        className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground-soft">Título Académico a Obtener</label>
                                    <input
                                        type="text"
                                        value={editForm.tituloAObtener}
                                        onChange={(e) => setEditForm({ ...editForm, tituloAObtener: e.target.value })}
                                        placeholder="Ej: Doctor en Informática"
                                        className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-foreground-soft">Institución de Destino (Universidad)</label>
                                        <input
                                            type="text"
                                            value={editForm.institucionDestino}
                                            onChange={(e) => setEditForm({ ...editForm, institucionDestino: e.target.value })}
                                            placeholder="Ej: Universidad de Salamanca"
                                            className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-foreground-soft">País de Destino</label>
                                        <input
                                            type="text"
                                            value={editForm.paisDestino}
                                            onChange={(e) => setEditForm({ ...editForm, paisDestino: e.target.value })}
                                            placeholder="Ej: España"
                                            className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground-soft">Convenio Marco / Interinstitucional</label>
                                    <input
                                        type="text"
                                        value={editForm.convenio}
                                        onChange={(e) => setEditForm({ ...editForm, convenio: e.target.value })}
                                        placeholder="Ej: Convenio Específico de Colaboración Académica..."
                                        className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bloque 4: Expediente Doctoral, Contrato y Financiamiento */}
                    {isDoctorando && (
                        <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-accent border border-border-strong text-accent-foreground">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-foreground">
                                            4. Expediente Doctoral y Financiamiento
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Tema de tesis, estado oficial, periodo de contrato y resoluciones.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground-soft">Tema de Tesis / Proyecto de Investigación</label>
                                    <textarea
                                        rows={3}
                                        value={editForm.tituloInvestigacion}
                                        onChange={(e) => setEditForm({ ...editForm, tituloInvestigacion: e.target.value })}
                                        placeholder="Ingrese o actualice el tema oficial de investigación doctoral..."
                                        className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary leading-relaxed"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-foreground-soft">Estado Académico del Expediente</label>
                                        <select
                                            value={editForm.estadoExpediente}
                                            onChange={(e) => setEditForm({ ...editForm, estadoExpediente: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary font-medium"
                                        >
                                            <option value="EN_ESTUDIOS">En Estudios (EN_ESTUDIOS)</option>
                                            <option value="GRADUADO">Graduado (GRADUADO)</option>
                                            <option value="EN_DEVENGAMIENTO">En Devengamiento (EN_DEVENGAMIENTO)</option>
                                            <option value="DEVENGADO">Devengado (DEVENGADO)</option>
                                            <option value="EN_COBRO">En Cobro (EN_COBRO)</option>
                                            <option value="DESTITUIDO">Destituido (DESTITUIDO)</option>
                                            <option value="RENUNCIA">Renuncia (RENUNCIA)</option>
                                            <option value="SUSPENDIDO">Suspendido (SUSPENDIDO)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-foreground-soft">Tipo de Financiamiento</label>
                                        <select
                                            value={editForm.tipoFinanciamiento}
                                            onChange={(e) => setEditForm({ ...editForm, tipoFinanciamiento: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary font-medium"
                                        >
                                            <option value="Beca">Beca UCE / Institucional</option>
                                            <option value="Recursos Propios">Recursos Propios</option>
                                            <option value="Crédito Educativo">Crédito Educativo</option>
                                            <option value="Convenio Bilateral">Convenio Bilateral</option>
                                            <option value="Mixto">Financiamiento Mixto</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-foreground-soft">Inicio de Contrato</label>
                                        <input
                                            type="date"
                                            value={editForm.contratoInicio}
                                            onChange={(e) => setEditForm({ ...editForm, contratoInicio: e.target.value })}
                                            className="w-full px-3.5 py-2 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-foreground-soft">Fin de Contrato</label>
                                        <input
                                            type="date"
                                            value={editForm.contratoFin}
                                            onChange={(e) => setEditForm({ ...editForm, contratoFin: e.target.value })}
                                            className="w-full px-3.5 py-2 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-foreground-soft">Duración (Meses)</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={editForm.contratoMeses}
                                            onChange={(e) => setEditForm({ ...editForm, contratoMeses: e.target.value })}
                                            placeholder="Ej: 36.5, 48"
                                            className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-foreground-soft">Oficio de Registro del Proyecto</label>
                                        <input
                                            type="text"
                                            value={editForm.oficioRegistroProyecto}
                                            onChange={(e) => setEditForm({ ...editForm, oficioRegistroProyecto: e.target.value })}
                                            placeholder="Ej: UCE-UGD-2024-0341-O"
                                            className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-foreground-soft">Fecha del Oficio de Registro</label>
                                        <input
                                            type="date"
                                            value={editForm.fechaOficioRegistro}
                                            onChange={(e) => setEditForm({ ...editForm, fechaOficioRegistro: e.target.value })}
                                            className="w-full px-3.5 py-2 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                                    <div className="flex items-center gap-3 p-3 bg-surface-subtle border border-border rounded-xl">
                                        <input
                                            type="checkbox"
                                            id="tieneApoyoProyecto"
                                            checked={editForm.tieneApoyoProyecto}
                                            onChange={(e) => setEditForm({ ...editForm, tieneApoyoProyecto: e.target.checked })}
                                            className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                                        />
                                        <label htmlFor="tieneApoyoProyecto" className="text-xs font-semibold text-foreground cursor-pointer select-none">
                                            ¿Tiene Apoyo Económico Adicional al Proyecto?
                                        </label>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-destructive-bg/30 border border-destructive-border/50 rounded-xl">
                                        <input
                                            type="checkbox"
                                            id="tieneAlertaLegal"
                                            checked={editForm.tieneAlertaLegal}
                                            onChange={(e) => setEditForm({ ...editForm, tieneAlertaLegal: e.target.checked })}
                                            className="w-4 h-4 rounded text-destructive focus:ring-destructive cursor-pointer"
                                        />
                                        <label htmlFor="tieneAlertaLegal" className="text-xs font-semibold text-destructive cursor-pointer select-none">
                                            ¿Tiene Alerta Legal / Proceso Sancionatorio?
                                        </label>
                                    </div>
                                </div>

                                {/* Gestor Interactivo de Múltiples Observaciones Oficiales */}
                                <div className="space-y-3 pt-2 border-t border-border-subtle">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <label className="text-xs font-semibold text-foreground-soft flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5 text-primary" />
                                            <span>Observaciones Oficiales del Expediente</span>
                                        </label>
                                        <span className="text-[11px] font-semibold text-foreground-muted bg-surface-subtle px-2 py-0.5 rounded-md border border-border">
                                            {editForm.observacionesList.length} registradas
                                        </span>
                                    </div>

                                    {/* Lista de Observaciones Existentes */}
                                    {editForm.observacionesList.length > 0 && (
                                        <div className="space-y-2">
                                            {editForm.observacionesList.map((obsText: string, idx: number) => (
                                                <div key={idx} className="flex items-start gap-2 bg-surface-subtle border border-border rounded-xl p-2.5">
                                                    <span className="text-[10px] font-bold text-foreground-muted bg-card px-1.5 py-0.5 rounded border border-border shrink-0 mt-0.5">
                                                        #{idx + 1}
                                                    </span>
                                                    <textarea
                                                        rows={2}
                                                        value={obsText}
                                                        onChange={(e) => handleUpdateObservacionItem(idx, e.target.value)}
                                                        className="flex-1 bg-card border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary leading-relaxed"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveObservacion(idx)}
                                                        title="Eliminar observación"
                                                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive-bg transition-colors shrink-0 cursor-pointer mt-0.5"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Entrada para Añadir Nueva Observación */}
                                    <div className="bg-surface-subtle border border-dashed border-border-strong rounded-2xl p-3.5 space-y-2.5">
                                        <label className="text-[11px] font-bold text-foreground-muted uppercase tracking-wider block">
                                            + Añadir Nueva Observación Oficial
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={editForm.nuevaObservacion}
                                            onChange={(e) => setEditForm({ ...editForm, nuevaObservacion: e.target.value })}
                                            placeholder="Escriba aquí la nueva observación, resolución o nota oficial..."
                                            className="w-full px-3 py-2 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary leading-relaxed"
                                        />
                                        <div className="flex justify-end">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleAddObservacion}
                                                disabled={!editForm.nuevaObservacion.trim()}
                                                className="rounded-xl border-border bg-card hover:bg-accent text-xs font-semibold gap-1.5 cursor-pointer py-1.5 h-auto"
                                            >
                                                <Plus className="w-3.5 h-3.5 text-primary" />
                                                <span>Incorporar al Expediente</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bloque 5: Adendas y Modificaciones Contractuales */}
                    {isDoctorando && (
                        <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-accent border border-border-strong text-accent-foreground">
                                        <Layers className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-foreground">
                                            5. Adendas y Prórrogas de Contrato
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Modificaciones de plazo, suspensiones y ampliaciones oficiales.
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-subtle text-foreground-muted border border-border">
                                    {editForm.adendas.length} adenda(s)
                                </span>
                            </div>

                            {/* Lista de Adendas Existentes */}
                            <div className="space-y-3">
                                {editForm.adendas.length > 0 ? (
                                    editForm.adendas.map((ad: any, idx: number) => (
                                        <div
                                            key={ad.id || idx}
                                            className="bg-surface-subtle border border-border rounded-2xl p-4 space-y-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold bg-primary text-white px-2.5 py-0.5 rounded-md">
                                                        Adenda N° {ad.numeroAdenda}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground font-medium">
                                                        Modificación Contractual #{idx + 1}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAdenda(idx)}
                                                    title="Eliminar esta adenda"
                                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive-bg transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                                <div className="space-y-1 sm:col-span-1">
                                                    <label className="text-[11px] font-semibold text-foreground-soft">Tipo</label>
                                                    <select
                                                        value={ad.tipoModificacion}
                                                        onChange={(e) => handleUpdateAdendaItem(idx, "tipoModificacion", e.target.value)}
                                                        className="w-full px-3 py-2 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary font-medium"
                                                    >
                                                        <option value="Ampliación">Ampliación</option>
                                                        <option value="Suspensión">Suspensión</option>
                                                        <option value="Culminación">Culminación</option>
                                                        <option value="Modificación">Modificación</option>
                                                    </select>
                                                </div>

                                                <div className="space-y-1 sm:col-span-1">
                                                    <label className="text-[11px] font-semibold text-foreground-soft">Duración (Meses)</label>
                                                    <input
                                                        type="number"
                                                        step="0.5"
                                                        value={ad.meses}
                                                        onChange={(e) => handleUpdateAdendaItem(idx, "meses", e.target.value)}
                                                        placeholder="Ej: 12"
                                                        className="w-full px-3 py-2 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary font-mono"
                                                    />
                                                </div>

                                                <div className="space-y-1 sm:col-span-1">
                                                    <label className="text-[11px] font-semibold text-foreground-soft">Fecha Inicio</label>
                                                    <input
                                                        type="date"
                                                        value={ad.fechaInicio}
                                                        onChange={(e) => handleUpdateAdendaItem(idx, "fechaInicio", e.target.value)}
                                                        className="w-full px-3 py-1.5 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
                                                    />
                                                </div>

                                                <div className="space-y-1 sm:col-span-1">
                                                    <label className="text-[11px] font-semibold text-foreground-soft">Fecha Fin</label>
                                                    <input
                                                        type="date"
                                                        value={ad.fechaFin}
                                                        onChange={(e) => handleUpdateAdendaItem(idx, "fechaFin", e.target.value)}
                                                        className="w-full px-3 py-1.5 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-muted-subtle italic p-3 bg-surface-subtle rounded-xl border border-border text-center">
                                        Sin adendas previas registradas en este expediente.
                                    </p>
                                )}
                            </div>

                            {/* Formulario para Registrar Nueva Adenda */}
                            <div className="bg-surface-subtle border border-dashed border-border-strong rounded-2xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Plus className="w-3.5 h-3.5 text-primary" />
                                        Registrar Nueva Adenda (Adenda N° {editForm.adendas.length + 1})
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-foreground-soft">Tipo de Modificación</label>
                                        <select
                                            value={editForm.nuevaAdenda.tipoModificacion}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    nuevaAdenda: { ...editForm.nuevaAdenda, tipoModificacion: e.target.value },
                                                })
                                            }
                                            className="w-full px-3 py-2 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary font-medium"
                                        >
                                            <option value="Ampliación">Ampliación</option>
                                            <option value="Suspensión">Suspensión</option>
                                            <option value="Culminación">Culminación</option>
                                            <option value="Modificación">Modificación</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-foreground-soft">Duración (Meses)</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={editForm.nuevaAdenda.meses}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    nuevaAdenda: { ...editForm.nuevaAdenda, meses: e.target.value },
                                                })
                                            }
                                            placeholder="Ej: 12"
                                            className="w-full px-3 py-2 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary font-mono"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-foreground-soft">Fecha Inicio</label>
                                        <input
                                            type="date"
                                            value={editForm.nuevaAdenda.fechaInicio}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    nuevaAdenda: { ...editForm.nuevaAdenda, fechaInicio: e.target.value },
                                                })
                                            }
                                            className="w-full px-3 py-1.5 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-foreground-soft">Fecha Fin</label>
                                        <input
                                            type="date"
                                            value={editForm.nuevaAdenda.fechaFin}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    nuevaAdenda: { ...editForm.nuevaAdenda, fechaFin: e.target.value },
                                                })
                                            }
                                            className="w-full px-3 py-1.5 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleAddAdenda}
                                        className="rounded-xl border-border bg-card hover:bg-accent text-xs font-semibold gap-1.5 cursor-pointer py-1.5 h-auto"
                                    >
                                        <Plus className="w-3.5 h-3.5 text-primary" />
                                        <span>Registrar Adenda en Lista</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bloque 6: Compromiso de Devengamiento Institucional */}
                    {isDoctorando && (
                        <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-accent border border-border-strong text-accent-foreground">
                                        <Award className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-foreground">
                                            6. Compromiso de Devengamiento Institucional
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Registro oficial SENESCYT, plazos obligatorios y oficios de término.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-foreground-soft">Número de Registro SENESCYT</label>
                                        <input
                                            type="text"
                                            value={editForm.registroSenescyt}
                                            onChange={(e) => setEditForm({ ...editForm, registroSenescyt: e.target.value })}
                                            placeholder="Ej: 7241180985"
                                            className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-foreground-soft">Estado del Devengamiento</label>
                                        <select
                                            value={editForm.devengamientoEstado}
                                            onChange={(e) => setEditForm({ ...editForm, devengamientoEstado: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary font-medium"
                                        >
                                            <option value="PENDIENTE">Pendiente (PENDIENTE)</option>
                                            <option value="EN_CURSO">En Curso (EN_CURSO)</option>
                                            <option value="FINALIZADO">Finalizado / Devengado (FINALIZADO)</option>
                                            <option value="INCUMPLIDO">Incumplido (INCUMPLIDO)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-foreground-soft">Tiempo a Devengar</label>
                                        <input
                                            type="text"
                                            value={editForm.tiempoTexto}
                                            onChange={(e) => setEditForm({ ...editForm, tiempoTexto: e.target.value })}
                                            placeholder="Ej: 8 años y 10 meses"
                                            className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary font-medium"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-foreground-soft">Inicio de Devengamiento</label>
                                        <input
                                            type="date"
                                            value={editForm.devengamientoFechaInicio}
                                            onChange={(e) => setEditForm({ ...editForm, devengamientoFechaInicio: e.target.value })}
                                            className="w-full px-3.5 py-2 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-foreground-soft">Fin Estimado</label>
                                        <input
                                            type="date"
                                            value={editForm.devengamientoFechaFinEstimada}
                                            onChange={(e) => setEditForm({ ...editForm, devengamientoFechaFinEstimada: e.target.value })}
                                            className="w-full px-3.5 py-2 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-foreground-soft">Oficio de Notificación</label>
                                        <input
                                            type="text"
                                            value={editForm.oficioNotificacion}
                                            onChange={(e) => setEditForm({ ...editForm, oficioNotificacion: e.target.value })}
                                            placeholder="Ej: UCE-UGD-2026-0394-O"
                                            className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary font-mono text-[11px]"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-foreground-soft">Oficio Acta de Terminación</label>
                                        <input
                                            type="text"
                                            value={editForm.oficioActaTerminacion}
                                            onChange={(e) => setEditForm({ ...editForm, oficioActaTerminacion: e.target.value })}
                                            placeholder="Ej: ACTA-TERM-2026-01"
                                            className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary font-mono text-[11px]"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-foreground-soft">Oficio Cierre Proyecto</label>
                                        <input
                                            type="text"
                                            value={editForm.oficioCierreProyecto}
                                            onChange={(e) => setEditForm({ ...editForm, oficioCierreProyecto: e.target.value })}
                                            placeholder="Ej: CIERRE-PROY-009"
                                            className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary font-mono text-[11px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* COLUMNA DERECHA: Instrucciones y Resumen de Auditoría */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-border-subtle">
                            <div className="p-2 rounded-xl bg-accent border border-border-strong text-accent-foreground">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-foreground">
                                    Reglas de Actualización
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Criterios de auditoría UGD.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 text-xs text-foreground-muted leading-relaxed">
                            <div className="p-3 bg-surface-subtle rounded-2xl border border-border space-y-1">
                                <p className="font-semibold text-foreground">
                                    Actualización Parcial Autorizada:
                                </p>
                                <p>
                                    No es obligatorio llenar todos los campos. Solo se modificarán los valores que edites en este formulario.
                                </p>
                            </div>

                            <div className="p-3 bg-surface-subtle rounded-2xl border border-border space-y-1">
                                <p className="font-semibold text-foreground">
                                    Sincronización Automática:
                                </p>
                                <p>
                                    Si el doctorando cuenta con credenciales creadas, su nombre y correo de inicio de sesión se sincronizarán inmediatamente.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra Inferior Flotante Sticky Exclusiva para Móviles y Tabletas */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border p-3 sm:p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center gap-3 block lg:hidden">
                <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEditing}
                    disabled={saving}
                    className="flex-1 rounded-xl border-border-strong text-xs font-semibold py-2.5 cursor-pointer"
                >
                    Descartar
                </Button>
                <Button
                    type="submit"
                    disabled={saving}
                    className="flex-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold py-2.5 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Guardando...</span>
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            <span>Guardar Cambios</span>
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
