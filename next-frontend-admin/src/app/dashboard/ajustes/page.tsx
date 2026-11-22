"use client";

import { useEffect, useState, useMemo } from "react";
import { SettingsService } from "@/services/settings.service";
import { AuthService, AdminUser } from "@/services/auth.service";
import { RoleGuard } from "@/components/auth/RoleGuard";
import {
    Settings as SettingsIcon,
    Save,
    RotateCcw,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CustomSelectOption } from "@/components/ui/custom-select";

import { HorariosConfigSection } from "@/components/ajustes/HorariosConfigSection";
import { SystemBannerSection } from "@/components/ajustes/SystemBannerSection";
import { DatabaseBackupSection } from "@/components/ajustes/DatabaseBackupSection";

const INITIAL_SETTINGS: Record<string, string> = {
    system_status: "online",
    start_hour: "08:00",
    end_hour: "16:00",
    slot_interval: "30",
    max_advance_days: "4",
    banner_active: "false",
    global_message: "",
    max_turns_per_day: "4",
};

const START_HOUR_OPTIONS: CustomSelectOption[] = [
    { value: "07:00", label: "07:00 AM", sublabel: "Apertura anticipada" },
    { value: "07:30", label: "07:30 AM" },
    { value: "08:00", label: "08:00 AM", sublabel: "Horario estándar UGD", dotClass: "bg-primary" },
    { value: "08:30", label: "08:30 AM" },
    { value: "09:00", label: "09:00 AM" },
];

const END_HOUR_OPTIONS: CustomSelectOption[] = [
    { value: "14:00", label: "14:00 PM (2:00 PM)" },
    { value: "15:00", label: "15:00 PM (3:00 PM)" },
    { value: "16:00", label: "16:00 PM (4:00 PM)", sublabel: "Cierre habitual UGD", dotClass: "bg-primary" },
    { value: "17:00", label: "17:00 PM (5:00 PM)" },
    { value: "18:00", label: "18:00 PM (6:00 PM)" },
];

const SLOT_INTERVAL_OPTIONS: CustomSelectOption[] = [
    { value: "15", label: "15 Minutos", sublabel: "Atención rápida" },
    { value: "30", label: "30 Minutos", sublabel: "Estándar recomendado UGD", dotClass: "bg-primary" },
    { value: "45", label: "45 Minutos" },
    { value: "60", label: "60 Minutos (1 Hora)", sublabel: "Revisión doctoral extensa" },
];

const MAX_ADVANCE_DAYS_OPTIONS: CustomSelectOption[] = [
    { value: "4", label: "Desbloqueo a 4 Días", sublabel: "Recomendado UGD", dotClass: "bg-primary" },
    { value: "7", label: "Desbloqueo Semanal (7 Días)", sublabel: "Ventana de 1 semana" },
    { value: "14", label: "Desbloqueo Quincenal (14 Días)" },
    { value: "30", label: "Desbloqueo Mensual (30 Días)", sublabel: "Mes completo" },
];

const MAX_TURNS_PER_DAY_OPTIONS: CustomSelectOption[] = [
    { value: "1", label: "1 Turno por Día", sublabel: "Máxima restricción" },
    { value: "2", label: "2 Turnos por Día" },
    { value: "3", label: "3 Turnos por Día" },
    { value: "4", label: "4 Turnos por Día", sublabel: "Default UGD", dotClass: "bg-primary" },
    { value: "5", label: "5 Turnos por Día" },
    { value: "6", label: "6 Turnos por Día" },
];

export default function AjustesPage() {
    const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
    const [settings, setSettings] = useState<Record<string, string>>(INITIAL_SETTINGS);
    const [initialLoadedSettings, setInitialLoadedSettings] = useState<Record<string, string>>(INITIAL_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal de Backup DB
    const [backupModalOpen, setBackupModalOpen] = useState(false);
    const [adminPassword, setAdminPassword] = useState("");
    const [downloadingBackup, setDownloadingBackup] = useState(false);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await SettingsService.getSettings();
            const map: Record<string, string> = { ...INITIAL_SETTINGS };
            (data || []).forEach((s) => {
                map[s.key] = s.value;
            });
            setSettings(map);
            setInitialLoadedSettings(map);
        } catch (error) {
            console.error("Error al cargar configuraciones", error);
            toast.error("Error al obtener configuraciones del sistema");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!AuthService.isAuthenticated()) {
            AuthService.logout();
            return;
        }
        setCurrentUser(AuthService.getCurrentUser());
        fetchSettings();
    }, []);

    // Check if dirty (changes pending)
    const isDirty = useMemo(() => {
        return Object.keys(settings).some(
            (key) => settings[key] !== initialLoadedSettings[key]
        );
    }, [settings, initialLoadedSettings]);

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            await SettingsService.bulkUpdateSettings(settings);
            setInitialLoadedSettings({ ...settings });
            toast.success("Ajustes del sistema guardados exitosamente");
        } catch (error: any) {
            toast.error(error.message || "Error al guardar configuraciones");
        } finally {
            setSaving(false);
        }
    };

    const handleDiscardChanges = () => {
        setSettings({ ...initialLoadedSettings });
        toast.info("Cambios descartados");
    };

    const handleDownloadBackupSubmit = async () => {
        if (!adminPassword) {
            toast.error("Debes ingresar tu contraseña");
            return;
        }

        setDownloadingBackup(true);
        try {
            await SettingsService.downloadDatabaseBackup(adminPassword);
            toast.success("Respaldo de base de datos generado y descargado correctamente");
            setBackupModalOpen(false);
            setAdminPassword("");
        } catch (error: any) {
            toast.error(error.message || "Contraseña incorrecta o error al generar respaldo");
        } finally {
            setDownloadingBackup(false);
        }
    };

    const isDeveloper = currentUser?.role_code === "DESARROLLADOR";
    const isSystemOnline = settings.system_status === "online";
    const isSystemOffline = settings.system_status === "offline";
    const isSystemLockdown = settings.system_status === "lockdown";

    return (
        <RoleGuard
            allowedRoles={["DESARROLLADOR", "DIRECTOR"]}
            moduleName="Ajustes del Sistema"
        >
            <div className="space-y-5 sm:space-y-6 pb-20 max-w-7xl mx-auto w-full px-2 sm:px-0">
                {/* Header Global */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-border shadow-xs">
                    <div className="flex items-center gap-3.5">
                        <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gold-light border border-gold-border text-gold shadow-2xs shrink-0">
                            <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
                                    Ajustes del Sistema
                                </h1>
                                {isSystemOnline ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Servicio Activo
                                    </span>
                                ) : isSystemOffline ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                        Mantenimiento
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                        Mantenimiento Total
                                    </span>
                                )}
                            </div>
                            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
                                Parámetros de operación, jornada presencial, límites de turno y avisos de la UGD.
                            </p>
                        </div>
                    </div>

                    {/* Global Actions */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {isDirty && (
                            <Button
                                variant="outline"
                                onClick={handleDiscardChanges}
                                disabled={saving}
                                className="border-border hover:bg-surface-subtle text-xs font-medium rounded-xl flex items-center gap-1.5 text-foreground-muted cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> Descartar
                            </Button>
                        )}
                        <Button
                            onClick={handleSaveAll}
                            disabled={saving || loading}
                            className={`font-semibold rounded-xl flex items-center gap-2 shadow-xs px-4 py-2 text-xs sm:text-sm transition-all w-full sm:w-auto justify-center cursor-pointer ${
                                isDirty
                                    ? "bg-primary hover:bg-primary-hover text-white ring-2 ring-primary/20"
                                    : "bg-primary hover:bg-primary-hover text-white"
                            }`}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" /> Guardar Ajustes
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-card border border-border rounded-3xl p-16 text-center shadow-xs">
                        <div className="inline-flex items-center gap-2.5 text-primary font-medium text-sm">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Cargando configuraciones operativas de la plataforma...</span>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                        {/* LEFT COLUMN: Operación, Horarios y Capacidad */}
                        <div className="lg:col-span-7">
                            <HorariosConfigSection
                                settings={settings}
                                onSettingsChange={setSettings}
                                isDeveloper={isDeveloper}
                                startHourOptions={START_HOUR_OPTIONS}
                                endHourOptions={END_HOUR_OPTIONS}
                                slotIntervalOptions={SLOT_INTERVAL_OPTIONS}
                                maxAdvanceDaysOptions={MAX_ADVANCE_DAYS_OPTIONS}
                                maxTurnsPerDayOptions={MAX_TURNS_PER_DAY_OPTIONS}
                            />
                        </div>

                        {/* RIGHT COLUMN: Comunicación y Base de Datos */}
                        <div className="lg:col-span-5 space-y-5 sm:space-y-6">
                            <SystemBannerSection
                                settings={settings}
                                onSettingsChange={setSettings}
                            />

                            <DatabaseBackupSection
                                isDeveloper={isDeveloper}
                                onOpenBackupModal={() => setBackupModalOpen(true)}
                                isOpen={backupModalOpen}
                                onClose={() => {
                                    setBackupModalOpen(false);
                                    setAdminPassword("");
                                }}
                                adminPassword={adminPassword}
                                onPasswordChange={setAdminPassword}
                                onSubmit={handleDownloadBackupSubmit}
                                downloadingBackup={downloadingBackup}
                            />
                        </div>
                    </div>
                )}
            </div>
        </RoleGuard>
    );
}
