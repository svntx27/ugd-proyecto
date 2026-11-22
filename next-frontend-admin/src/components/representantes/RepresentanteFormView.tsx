"use client";

import React from "react";
import {
    UserCheck,
    Briefcase,
    KeyRound,
    Mail,
    Shield,
    Lock,
    Eye,
    EyeOff,
    AlertTriangle,
    Building2,
    MapPin,
    ArrowLeft,
    Check,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Representative } from "@/services/appointment.service";

export interface AdminRoleOption {
    code: string;
    label: string;
    description: string;
    badgeClass: string;
}

export interface RepresentanteFormViewProps {
    isEdit: boolean;
    selectedRep: Representative | null;
    nombre: string;
    onNombreChange: (val: string) => void;
    email: string;
    onEmailChange: (val: string) => void;
    password: string;
    onPasswordChange: (val: string) => void;
    confirmPassword: string;
    onConfirmPasswordChange: (val: string) => void;
    showPassword: boolean;
    onToggleShowPassword: () => void;
    roleCode: string;
    onRoleCodeChange: (val: string) => void;
    title: string;
    onTitleChange: (val: string) => void;
    ubicacion: string;
    onUbicacionChange: (val: string) => void;
    estado: "activo" | "inactivo";
    onEstadoChange: (val: "activo" | "inactivo") => void;
    submitting: boolean;
    onBack: () => void;
    onSubmit: () => Promise<void> | void;
    suggestedRoles: string[];
    adminRoles: AdminRoleOption[];
}

export function RepresentanteFormView({
    isEdit,
    selectedRep,
    nombre,
    onNombreChange,
    email,
    onEmailChange,
    password,
    onPasswordChange,
    confirmPassword,
    onConfirmPasswordChange,
    showPassword,
    onToggleShowPassword,
    roleCode,
    onRoleCodeChange,
    title,
    onTitleChange,
    ubicacion,
    onUbicacionChange,
    estado,
    onEstadoChange,
    submitting,
    onBack,
    onSubmit,
    suggestedRoles,
    adminRoles,
}: RepresentanteFormViewProps) {
    return (
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pb-20 space-y-6 animate-in fade-in duration-200">
            {/* Cabecera Principal de Navegación y Título */}
            <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onBack}
                        disabled={submitting}
                        className="rounded-xl border-border hover:bg-surface-hover text-foreground-muted hover:text-foreground text-xs shrink-0 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver
                    </Button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                    isEdit
                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                        : "bg-primary/10 text-primary border-primary/20"
                                }`}
                            >
                                {isEdit ? "Modificación de Datos" : "Nuevo Registro"}
                            </span>
                            {isEdit && selectedRep && (
                                <span className="text-[10px] font-medium text-muted-foreground bg-surface-subtle px-2 py-0.5 rounded-md">
                                    ID #{selectedRep.id}
                                </span>
                            )}
                        </div>
                        <h1 className="text-base sm:text-xl font-bold text-foreground truncate">
                            {isEdit
                                ? `Editar Representante: ${selectedRep?.nombre || selectedRep?.name}`
                                : "Registrar Nuevo Representante UGD"}
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            {isEdit
                                ? "Actualiza los datos institucionales, sede de atención y credenciales de acceso."
                                : "Configura el perfil de atención presencial y asigna credenciales manuales para el login."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Formulario Secuencial (Cards Claras) */}
            <div className="space-y-6">
                {/* BLOQUE 1: Información Personal y Cargo Oficial */}
                <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xs space-y-5">
                    <div className="flex items-center gap-3 pb-3 border-b border-border-subtle">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-accent text-accent-foreground border border-border-strong shrink-0 shadow-2xs">
                            <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-foreground">
                                1. Datos del Funcionario y Cargo
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Información de identidad y título visible para los doctorandos.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {/* Nombre Completo */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-foreground-soft uppercase tracking-wider flex items-center justify-between">
                                <span>
                                    Nombres y Apellidos Completos <span className="text-destructive">*</span>
                                </span>
                                <span className="text-[10px] font-normal text-muted-foreground lowercase">
                                    (como aparecerá en citas)
                                </span>
                            </label>
                            <Input
                                placeholder="Ej: Dr. Galo Javier González Hernández"
                                value={nombre}
                                onChange={(e) => onNombreChange(e.target.value)}
                                className="w-full bg-white border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-xs sm:text-sm"
                            />
                        </div>

                        {/* Cargo Institucional */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-foreground-soft uppercase tracking-wider flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5 text-primary" />
                                Cargo Institucional
                            </label>
                            <Input
                                placeholder="Ej: Director UGD / Analista de Procesos de Doctorado"
                                value={title}
                                onChange={(e) => onTitleChange(e.target.value)}
                                className="w-full bg-white border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-xs sm:text-sm"
                            />
                            {/* Sugerencias rápidas de cargo */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[11px] text-muted-foreground mr-1">Sugerencias:</span>
                                {suggestedRoles.map((role) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => onTitleChange(role)}
                                        className="text-[11px] px-2.5 py-1 rounded-lg border border-border bg-surface-subtle hover:bg-surface-hover hover:border-border-strong text-foreground-soft hover:text-foreground font-medium transition-colors cursor-pointer"
                                    >
                                        + {role}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* BLOQUE 2: Cuenta de Acceso al Panel Administrativo */}
                <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xs space-y-5">
                    <div className="flex items-center gap-3 pb-3 border-b border-border-subtle">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-accent text-accent-foreground border border-border-strong shrink-0 shadow-2xs">
                            <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-foreground">
                                2. Credenciales y Acceso al Panel
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Cuenta institucional asignada para iniciar sesión en la plataforma.
                            </p>
                        </div>
                    </div>

                    {/* Correo Electrónico Institucional */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground-soft uppercase tracking-wider flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-primary" />
                            Correo Institucional {!isEdit && <span className="text-destructive">*</span>}
                        </label>
                        <Input
                            type="email"
                            placeholder="ejemplo.funcionario@uce.edu.ec"
                            value={email}
                            onChange={(e) => onEmailChange(e.target.value)}
                            className="w-full bg-white border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-xs sm:text-sm"
                        />
                        <p className="text-[11px] text-muted-foreground">
                            Usuario para acceder al portal administrativo.
                        </p>
                    </div>

                    {/* Selección de Rol del Sistema */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground-soft uppercase tracking-wider flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-primary" />
                            Nivel de Acceso y Rol
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {adminRoles.map((role) => {
                                const isSelected = roleCode === role.code;
                                return (
                                    <div
                                        key={role.code}
                                        onClick={() => {
                                            onRoleCodeChange(role.code);
                                            if (!title) onTitleChange(role.label);
                                        }}
                                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                                            isSelected
                                                ? "bg-accent/40 border-primary ring-2 ring-primary/20 shadow-2xs"
                                                : "bg-surface-subtle/50 border-border hover:border-border-strong hover:bg-white"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                                        isSelected ? "border-primary bg-primary" : "border-muted-subtle bg-white"
                                                    }`}
                                                >
                                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                                </div>
                                                <p className="text-xs sm:text-sm font-bold text-foreground">
                                                    {role.label}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            {role.description}
                                        </p>
                                        <div className="pt-1 border-t border-border/50">
                                            <span
                                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border inline-block ${role.badgeClass}`}
                                            >
                                                {role.code}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contraseña Manual */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border-subtle">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground-soft uppercase tracking-wider flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5 text-primary" />
                                    {isEdit ? "Cambiar Contraseña" : "Contraseña Inicial"}{" "}
                                    {!isEdit && <span className="text-destructive">*</span>}
                                </span>
                                {isEdit && <span className="text-[10px] text-muted-foreground lowercase">(opcional)</span>}
                            </label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder={isEdit ? "Dejar en blanco para mantener actual" : "Mínimo 6 caracteres"}
                                    value={password}
                                    onChange={(e) => onPasswordChange(e.target.value)}
                                    className="w-full bg-white border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-xs sm:text-sm pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={onToggleShowPassword}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground-soft uppercase tracking-wider">
                                Confirmar Contraseña {(!isEdit || password) && <span className="text-destructive">*</span>}
                            </label>
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Repite la contraseña asignada"
                                value={confirmPassword}
                                onChange={(e) => onConfirmPasswordChange(e.target.value)}
                                disabled={isEdit && !password}
                                className={`w-full bg-white border-border rounded-xl text-xs sm:text-sm ${
                                    confirmPassword && password !== confirmPassword
                                        ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                                        : "focus:border-primary focus:ring-1 focus:ring-primary"
                                }`}
                            />
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-[11px] text-destructive flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Las contraseñas no coinciden.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* BLOQUE 3: Ubicación Presencial y Estado de Disponibilidad */}
                <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xs space-y-5">
                    <div className="flex items-center gap-3 pb-3 border-b border-border-subtle">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-accent text-accent-foreground border border-border-strong shrink-0 shadow-2xs">
                            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-foreground">
                                3. Sede de Atención y Estado de Turnos
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Lugar físico donde se recibirán los doctorandos y disponibilidad del calendario.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {/* Sede / Ventanilla de Atención */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-foreground-soft uppercase tracking-wider flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-primary" />
                                Ventanilla / Sede de Atención Presencial
                            </label>
                            <Input
                                value={ubicacion}
                                onChange={(e) => onUbicacionChange(e.target.value)}
                                placeholder="Unidad de Gestión de Doctorados - Módulo 1"
                                className="w-full bg-white border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-xs sm:text-sm text-foreground"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Dirección física especificada en el comprobante que se envía al alumno al agendar.
                            </p>
                        </div>

                        {/* Estado de Disponibilidad */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-foreground-soft uppercase tracking-wider">
                                Disponibilidad para Citas Presenciales
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div
                                    onClick={() => onEstadoChange("activo")}
                                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                                        estado === "activo"
                                            ? "bg-success-bg border-primary ring-2 ring-primary/20 shadow-2xs"
                                            : "bg-surface-subtle/50 border-border hover:border-border-strong hover:bg-white"
                                    }`}
                                >
                                    <div
                                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                            estado === "activo" ? "border-primary bg-primary" : "border-muted-subtle bg-white"
                                        }`}
                                    >
                                        {estado === "activo" && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-success-dot inline-block animate-pulse"></span>
                                            Atención Habilitada (Activo)
                                        </p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            Aparecerá disponible en el calendario de turnos presenciales.
                                        </p>
                                    </div>
                                </div>

                                <div
                                    onClick={() => onEstadoChange("inactivo")}
                                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                                        estado === "inactivo"
                                            ? "bg-destructive-bg border-destructive ring-2 ring-destructive/20 shadow-2xs"
                                            : "bg-surface-subtle/50 border-border hover:border-border-strong hover:bg-white"
                                    }`}
                                >
                                    <div
                                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                            estado === "inactivo" ? "border-destructive bg-destructive" : "border-muted-subtle bg-white"
                                        }`}
                                    >
                                        {estado === "inactivo" && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-destructive inline-block"></span>
                                            Atención Pausada (Inactivo)
                                        </p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            No recibirá nuevas reservas en su franja horaria.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra Inferior de Acciones */}
            <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <p className="text-xs text-muted-foreground text-center sm:text-left">
                    {isEdit
                        ? "Los cambios en credenciales o ubicación se aplicarán de inmediato."
                        : "Al guardar, se creará el usuario con acceso al panel y su perfil de atención presencial."}
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        disabled={submitting}
                        className="rounded-xl border-border hover:bg-surface-hover text-xs font-medium w-full sm:w-auto cursor-pointer"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={onSubmit}
                        disabled={submitting}
                        className="bg-primary hover:bg-primary-hover text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs w-full sm:w-auto px-6 py-2.5 cursor-pointer"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />{" "}
                                {isEdit ? "Guardando Cambios..." : "Registrando y Asignando Credenciales..."}
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />{" "}
                                {isEdit ? "Actualizar Representante" : "Registrar y Asignar Credenciales"}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
