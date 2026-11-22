"use client";

import { useEffect, useState, useMemo } from "react";
import { RoleDashboardHeader } from "@/components/dashboard/RoleDashboardHeader";
import { DeveloperSystemHealthWidget } from "@/components/dashboard/DeveloperSystemHealthWidget";
import { DirectorStatsWidget } from "@/components/dashboard/DirectorStatsWidget";
import { AuthService, AdminUser } from "@/services/auth.service";
import { AppointmentService, Representative, Appointment } from "@/services/appointment.service";
import { SettingsService } from "@/services/settings.service";
import {
    Calendar,
    UserCheck,
    Activity,
    Users,
    CheckCircle,
    Settings,
    ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { getAppointmentStatusMeta } from "@/lib/appointment-status.helper";
import {
    parseScheduleConfig,
    generateTimeSlots,
    buildSlotOptions,
    SystemScheduleConfig,
    DEFAULT_START_HOUR,
    DEFAULT_END_HOUR,
    DEFAULT_SLOT_INTERVAL,
} from "@/lib/schedule.helper";
import { ViewAppointmentModal } from "@/components/dashboard/ViewAppointmentModal";
import { CitaRescheduleModal } from "@/components/citas/CitaRescheduleModal";
import { CitaCancelModal } from "@/components/citas/CitaCancelModal";
import { QuickAccessCardsGrid } from "@/components/dashboard/QuickAccessCardsGrid";
import { UpcomingAppointmentsTable } from "@/components/dashboard/UpcomingAppointmentsTable";

function getNormalizedDate(fecha?: string): string {
    if (!fecha) return "";
    return String(fecha).split("T")[0];
}

function getNormalizedTime(hora?: string | number): string {
    if (hora === undefined || hora === null) return "";
    const str = String(hora).trim();
    if (/^\d{1,2}$/.test(str)) {
        return `${str.padStart(2, "0")}:00`;
    }
    return str.slice(0, 5);
}

export default function InicioPage() {
    const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
    const [labs, setLabs] = useState<Representative[]>([]);
    const [reservations, setReservations] = useState<Appointment[]>([]);
    const [scheduleConfig, setScheduleConfig] = useState<SystemScheduleConfig>({
        startHour: DEFAULT_START_HOUR,
        endHour: DEFAULT_END_HOUR,
        slotInterval: DEFAULT_SLOT_INTERVAL,
    });
    const [activeReservations, setActiveReservations] = useState(0);
    const [recentUpcoming, setRecentUpcoming] = useState<Appointment[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
    const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);
    const [cancelAppointmentObj, setCancelAppointmentObj] = useState<Appointment | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const timeSlots = useMemo(() => {
        return generateTimeSlots(
            scheduleConfig.startHour,
            scheduleConfig.endHour,
            scheduleConfig.slotInterval
        );
    }, [scheduleConfig]);

    const slotOptions = useMemo(() => {
        return buildSlotOptions(timeSlots, scheduleConfig.slotInterval);
    }, [timeSlots, scheduleConfig]);

    const fetchDashboardData = async (silent = false) => {
        try {
            const [labsData, reservationsData, settingsData] = await Promise.all([
                AppointmentService.listRepresentatives(),
                AppointmentService.getAppointments(),
                SettingsService.getSettings().catch(() => []),
            ]);

            setLabs(labsData);
            setReservations(reservationsData);
            if (settingsData && settingsData.length > 0) {
                setScheduleConfig(parseScheduleConfig(settingsData));
            }

            const upcoming = reservationsData.filter((res) => res.estado === "active");
            setActiveReservations(upcoming.length);
            setRecentUpcoming(reservationsData.slice(0, 5));

            if (!silent) {
                setIsInitialLoading(false);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            if (!silent) {
                toast.error("Error al conectar con el servidor API");
                setIsInitialLoading(false);
            }
        }
    };

    const handleRescheduleSubmit = async (newDate: string, newSlot: string) => {
        if (!rescheduleAppointment || !newDate || !newSlot) return;
        const statusMeta = getAppointmentStatusMeta(rescheduleAppointment.estado);
        if (statusMeta.code !== "ACTIVE") {
            toast.error("No es posible reagendar una cita que ya ha expirado o finalizado.");
            setRescheduleAppointment(null);
            return;
        }

        setIsSaving(true);
        try {
            await AppointmentService.adminRescheduleAppointment(rescheduleAppointment.id, newDate, newSlot);
            toast.success("Cita presencial UGD modificada exitosamente.");
            setRescheduleAppointment(null);
            fetchDashboardData(true);
        } catch (error: any) {
            toast.error(error.message || "Error al intentar reagendar. Comprueba que el horario esté libre.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmCancel = async () => {
        if (!cancelAppointmentObj) return;
        const statusMeta = getAppointmentStatusMeta(cancelAppointmentObj.estado);
        if (statusMeta.code !== "ACTIVE") {
            toast.error("No es posible cancelar una cita que ya ha expirado o finalizado.");
            setCancelAppointmentObj(null);
            return;
        }

        setIsSaving(true);
        try {
            await AppointmentService.adminCancelAppointment(cancelAppointmentObj.id);
            toast.success("Cita cancelada y liberada.");
            setCancelAppointmentObj(null);
            fetchDashboardData(true);
        } catch (error: any) {
            toast.error(error.message || "Error al cancelar la cita.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteFromViewModal = async (id: number) => {
        const target = reservations.find((a) => a.id === id) || viewingAppointment;
        setViewingAppointment(null);
        if (target) {
            setCancelAppointmentObj(target);
        }
    };

    useEffect(() => {
        if (!AuthService.isAuthenticated()) {
            AuthService.logout();
            return;
        }
        setCurrentUser(AuthService.getCurrentUser());
        fetchDashboardData(false);

        const handleSync = (event: Event) => {
            const customEvent = event as CustomEvent<Appointment[]>;
            if (customEvent.detail) {
                setReservations(customEvent.detail);
                const upcoming = customEvent.detail.filter((res) => res.estado === "active");
                setActiveReservations(upcoming.length);
                setRecentUpcoming(customEvent.detail.slice(0, 5));
            }
        };

        window.addEventListener("ugd:appointments-synced", handleSync);
        return () => window.removeEventListener("ugd:appointments-synced", handleSync);
    }, []);

    const userRole = currentUser?.role_code || "";

    const quickCards = [
        {
            title: "Revisar Citas UGD",
            description: `Supervisar ${activeReservations} citas presenciales agendadas`,
            href: "/dashboard/calendario",
            icon: CheckCircle,
            iconColor: "text-accent-foreground bg-accent border-border-strong",
            allowedRoles: ["DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS", "ANALISTA_TECNICO"],
        },
        {
            title: "Representantes UGD",
            description: `Administrar ${labs.length} representantes de la Unidad de Doctorados`,
            href: "/dashboard/representantes",
            icon: UserCheck,
            iconColor: "text-role-process bg-role-process-bg border-role-process-border",
            allowedRoles: ["DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS", "ANALISTA_TECNICO"],
        },
        {
            title: "Directorio Usuarios",
            description: "Consultar cuentas y accesos autorizados UCE",
            href: "/dashboard/usuarios",
            icon: Users,
            iconColor: "text-role-dev bg-role-dev-bg border-role-dev-border",
            allowedRoles: ["DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS"],
        },
        {
            title: "Ajustes del Sistema",
            description: "Configurar horarios, cupos y avisos institucionales",
            href: "/dashboard/ajustes",
            icon: Settings,
            iconColor: "text-role-director bg-role-director-bg border-role-director-border",
            allowedRoles: ["DESARROLLADOR", "DIRECTOR"],
        },
    ];

    return (
        <div className="flex flex-col space-y-6 pb-12">
            <div className="rounded-3xl bg-card border border-border p-6 md:p-8 shadow-xs">
                {/* Encabezado Dinámico por Rol */}
                <RoleDashboardHeader
                    user={currentUser}
                    isSystemOnline={true}
                    startHour={scheduleConfig.startHour}
                    endHour={scheduleConfig.endHour}
                />

                {isInitialLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Activity className="w-10 h-10 text-primary animate-pulse mb-4" />
                        <p className="text-muted-foreground font-medium">Sincronizando agenda UGD...</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Widget Especializado según el Rol */}
                        {userRole === "DESARROLLADOR" && (
                            <DeveloperSystemHealthWidget
                                activeAppointmentsCount={activeReservations}
                                totalRepresentatives={labs.length}
                            />
                        )}

                        {userRole === "DIRECTOR" && (
                            <DirectorStatsWidget
                                appointments={reservations}
                                representativesCount={labs.length}
                            />
                        )}

                        {userRole === "ANALISTA_PROCESOS" && (
                            <div className="bg-surface-subtle p-6 rounded-3xl border border-border shadow-xs space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-role-process-bg rounded-2xl border border-role-process-border text-role-process shadow-2xs">
                                            <ClipboardList className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-lg font-bold text-foreground">
                                                    Mesa de Atención Doctoral
                                                </h2>
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-role-process-bg text-role-process border border-role-process-border">
                                                    OPERACIÓN
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Atención de turnos presenciales y seguimiento a doctorandos UCE.
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/dashboard/calendario"
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-primary-foreground transition-all shadow-xs"
                                    >
                                        <Calendar className="w-4 h-4" /> Abrir Calendario de Turnos
                                    </Link>
                                </div>
                            </div>
                        )}

                        {userRole === "ANALISTA_TECNICO" && (
                            <div className="bg-surface-subtle p-6 rounded-3xl border border-border shadow-xs space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-role-tech-bg rounded-2xl border border-role-tech-border text-role-tech shadow-2xs">
                                            <UserCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-lg font-bold text-foreground">
                                                    Monitoreo de Representantes y Estaciones
                                                </h2>
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-role-tech-bg text-role-tech border border-role-tech-border">
                                                    SOPORTE
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Supervisión de disponibilidad física en las {labs.length} estaciones UGD.
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/dashboard/representantes"
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-primary-foreground transition-all shadow-xs"
                                    >
                                        <UserCheck className="w-4 h-4" /> Administrar Estaciones
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Quick Cards Grid */}
                        <QuickAccessCardsGrid cards={quickCards} userRole={userRole} />

                        {/* Recent Activity Table */}
                        <UpcomingAppointmentsTable
                            appointments={recentUpcoming}
                            onView={(res) => setViewingAppointment(res)}
                            onReschedule={(res) => setRescheduleAppointment(res)}
                            onDelete={(res) => setCancelAppointmentObj(res)}
                            slotInterval={scheduleConfig.slotInterval}
                            startHour={scheduleConfig.startHour}
                            endHour={scheduleConfig.endHour}
                        />
                    </div>
                )}
            </div>

            {/* View Details Modal */}
            <ViewAppointmentModal
                isOpen={!!viewingAppointment}
                onClose={() => setViewingAppointment(null)}
                appointment={viewingAppointment}
                onDelete={handleDeleteFromViewModal}
                isDeleting={isSaving}
            />

            {/* Reschedule Modal */}
            <CitaRescheduleModal
                isOpen={!!rescheduleAppointment}
                appointment={rescheduleAppointment}
                onClose={() => setRescheduleAppointment(null)}
                onConfirm={handleRescheduleSubmit}
                isSubmitting={isSaving}
                slotOptions={slotOptions}
                getNormalizedDate={getNormalizedDate}
                getNormalizedTime={getNormalizedTime}
            />

            {/* Cancel Modal */}
            <CitaCancelModal
                isOpen={!!cancelAppointmentObj}
                appointment={cancelAppointmentObj}
                onClose={() => setCancelAppointmentObj(null)}
                onConfirm={handleConfirmCancel}
                isSubmitting={isSaving}
                getNormalizedDate={getNormalizedDate}
            />
        </div>
    );
}
