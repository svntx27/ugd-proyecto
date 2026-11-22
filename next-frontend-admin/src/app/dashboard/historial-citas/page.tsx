"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { AppointmentService, Appointment, Representative } from "@/services/appointment.service";
import { SettingsService } from "@/services/settings.service";
import { AuthService } from "@/services/auth.service";
import {
    History,
    RefreshCw,
    Download,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getAppointmentStatusMeta } from "@/lib/appointment-status.helper";
import {
    parseScheduleConfig,
    generateTimeSlots,
    buildTimeFilterOptions,
    buildSlotOptions,
    SystemScheduleConfig,
    DEFAULT_START_HOUR,
    DEFAULT_END_HOUR,
    DEFAULT_SLOT_INTERVAL,
} from "@/lib/schedule.helper";
import { ViewAppointmentModal } from "@/components/dashboard/ViewAppointmentModal";

import { CitasStatsSummary } from "@/components/citas/CitasStatsSummary";
import { CitasFilterHeader, DatePreset, SortOrder } from "@/components/citas/CitasFilterHeader";
import { CitasHistoryTable } from "@/components/citas/CitasHistoryTable";
import { CitaRescheduleModal } from "@/components/citas/CitaRescheduleModal";
import { CitaCancelModal } from "@/components/citas/CitaCancelModal";

function toLocalDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

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

export default function HistorialCitasPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [representatives, setRepresentatives] = useState<Representative[]>([]);
    const [scheduleConfig, setScheduleConfig] = useState<SystemScheduleConfig>({
        startHour: DEFAULT_START_HOUR,
        endHour: DEFAULT_END_HOUR,
        slotInterval: DEFAULT_SLOT_INTERVAL,
    });
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filtros principales
    const [search, setSearch] = useState("");
    const [selectedRepId, setSelectedRepId] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");

    // Subfiltros por fecha, horario y ordenamiento
    const [datePreset, setDatePreset] = useState<DatePreset>("all");
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");
    const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>("all");
    const [sortOrder, setSortOrder] = useState<SortOrder>("date_desc");
    const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(true);

    // Paginación
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    // Modales
    const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
    const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);
    const [cancelAppointmentObj, setCancelAppointmentObj] = useState<Appointment | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const repOptions = useMemo(() => [
        { value: "all", label: "Todos los Representantes", dotClass: "bg-primary" },
        ...representatives.map((rep) => ({
            value: rep.id.toString(),
            label: rep.nombre,
            sublabel: rep.title || "Personal UGD",
            dotClass: "bg-primary",
        })),
    ], [representatives]);

    const statusOptions = [
        { value: "all", label: "Todos los Estados" },
        { value: "ACTIVE", label: "Confirmadas", dotClass: "bg-primary" },
        { value: "EXPIRED", label: "Expiradas / Finalizadas", dotClass: "bg-warning-dot" },
        { value: "CANCELLED", label: "Canceladas", dotClass: "bg-destructive" },
    ];

    const timeSlots = useMemo(() => {
        return generateTimeSlots(
            scheduleConfig.startHour,
            scheduleConfig.endHour,
            scheduleConfig.slotInterval
        );
    }, [scheduleConfig]);

    const timeFilterOptions = useMemo(() => {
        return buildTimeFilterOptions(
            timeSlots,
            scheduleConfig.slotInterval,
            scheduleConfig.startHour,
            scheduleConfig.endHour,
            "12:00"
        );
    }, [timeSlots, scheduleConfig]);

    const sortOptions = [
        { value: "date_desc", label: "Fecha más reciente primero" },
        { value: "date_asc", label: "Fecha más antigua primero" },
        { value: "id_desc", label: "ID más reciente (Descendente)" },
        { value: "id_asc", label: "ID más antiguo (Ascendente)" },
    ];

    const pageSizeOptions = [
        { value: "5", label: "5 por página" },
        { value: "10", label: "10 por página" },
        { value: "20", label: "20 por página" },
        { value: "50", label: "50 por página" },
    ];

    const slotOptions = useMemo(() => {
        return buildSlotOptions(timeSlots, scheduleConfig.slotInterval);
    }, [timeSlots, scheduleConfig]);

    // Resumen numérico general de citas
    const summaryStats = useMemo(() => {
        let active = 0;
        let expired = 0;
        let cancelled = 0;

        appointments.forEach((a) => {
            const meta = getAppointmentStatusMeta(a.estado);
            if (meta.code === "ACTIVE") active++;
            else if (meta.code === "EXPIRED") expired++;
            else if (meta.code === "CANCELLED") cancelled++;
        });

        return {
            total: appointments.length,
            active,
            expired,
            cancelled,
        };
    }, [appointments]);

    // Cantidad de filtros activos aplicados
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (search.trim()) count++;
        if (selectedRepId !== "all") count++;
        if (selectedStatus !== "all") count++;
        if (datePreset !== "all" || dateFrom || dateTo) count++;
        if (selectedTimeFilter !== "all") count++;
        if (sortOrder !== "date_desc") count++;
        return count;
    }, [search, selectedRepId, selectedStatus, datePreset, dateFrom, dateTo, selectedTimeFilter, sortOrder]);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setIsRefreshing(true);
        else setLoading(true);

        try {
            const [repsData, appsData, settingsData] = await Promise.all([
                AppointmentService.listRepresentatives(),
                AppointmentService.getAppointments(),
                SettingsService.getSettings().catch(() => []),
            ]);
            setRepresentatives(repsData);
            setAppointments(appsData);
            if (settingsData && settingsData.length > 0) {
                setScheduleConfig(parseScheduleConfig(settingsData));
            }
            if (isRefresh) {
                toast.success("Historial de citas actualizado.");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error al cargar los datos del historial de citas.");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (!AuthService.isAuthenticated()) {
            AuthService.logout();
            return;
        }
        fetchData();

        const handleSync = (event: Event) => {
            const customEvent = event as CustomEvent<Appointment[]>;
            if (customEvent.detail) {
                setAppointments(customEvent.detail);
            }
        };

        window.addEventListener("ugd:appointments-synced", handleSync);
        return () => window.removeEventListener("ugd:appointments-synced", handleSync);
    }, [fetchData]);

    const applyDatePreset = (preset: DatePreset) => {
        setDatePreset(preset);
        setCurrentPage(1);

        const now = new Date();
        const todayStr = toLocalDateStr(now);

        if (preset === "all") {
            setDateFrom("");
            setDateTo("");
        } else if (preset === "today") {
            setDateFrom(todayStr);
            setDateTo(todayStr);
        } else if (preset === "upcoming") {
            setDateFrom(todayStr);
            setDateTo("");
        } else if (preset === "week") {
            const dayOfWeek = (now.getDay() + 6) % 7;
            const monday = new Date(now);
            monday.setDate(now.getDate() - dayOfWeek);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            setDateFrom(toLocalDateStr(monday));
            setDateTo(toLocalDateStr(sunday));
        } else if (preset === "month") {
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            setDateFrom(toLocalDateStr(firstDay));
            setDateTo(toLocalDateStr(lastDay));
        }
    };

    const handleDateFromChange = (val: string) => {
        setDateFrom(val);
        setDatePreset("custom");
        setCurrentPage(1);
        if (dateTo && val && val > dateTo) {
            setDateTo(val);
        }
    };

    const handleDateToChange = (val: string) => {
        setDateTo(val);
        setDatePreset("custom");
        setCurrentPage(1);
    };

    const clearAllFilters = () => {
        setSearch("");
        setSelectedRepId("all");
        setSelectedStatus("all");
        setDatePreset("all");
        setDateFrom("");
        setDateTo("");
        setSelectedTimeFilter("all");
        setSortOrder("date_desc");
        setCurrentPage(1);
    };

    // Filtrado y ordenamiento de citas
    const filteredAppointments = useMemo(() => {
        const filtered = appointments.filter((app) => {
            const searchLower = search.toLowerCase().trim();
            const repName = (app.representative_nombre || app.lab_nombre || "").toLowerCase();
            const studentName = (app.usuario_nombre || app.user_nombre || "").toLowerCase();
            const studentEmail = (app.usuario_email || app.user_email || "").toLowerCase();
            const materia = (app.materia || "").toLowerCase();
            const idStr = String(app.id);

            const matchesSearch =
                !searchLower ||
                idStr.includes(searchLower) ||
                repName.includes(searchLower) ||
                studentName.includes(searchLower) ||
                studentEmail.includes(searchLower) ||
                materia.includes(searchLower);

            const repId = String(app.representative_id || app.lab_id);
            const matchesRep = selectedRepId === "all" || repId === selectedRepId;

            const statusMeta = getAppointmentStatusMeta(app.estado);
            const matchesStatus = selectedStatus === "all" || statusMeta.code === selectedStatus;

            const appDate = getNormalizedDate(app.fecha);
            const matchesDateFrom = !dateFrom || appDate >= dateFrom;
            const matchesDateTo = !dateTo || appDate <= dateTo;

            const appTime = getNormalizedTime(app.hora_inicio);
            let matchesTime = true;
            if (selectedTimeFilter === "morning") {
                matchesTime = appTime >= scheduleConfig.startHour && appTime < "12:00";
            } else if (selectedTimeFilter === "afternoon") {
                matchesTime = appTime >= "12:00" && appTime <= scheduleConfig.endHour;
            } else if (selectedTimeFilter !== "all") {
                matchesTime = appTime === selectedTimeFilter;
            }

            return (
                matchesSearch &&
                matchesRep &&
                matchesStatus &&
                matchesDateFrom &&
                matchesDateTo &&
                matchesTime
            );
        });

        return [...filtered].sort((a, b) => {
            const dateA = `${getNormalizedDate(a.fecha)} ${getNormalizedTime(a.hora_inicio)}`;
            const dateB = `${getNormalizedDate(b.fecha)} ${getNormalizedTime(b.hora_inicio)}`;

            if (sortOrder === "date_desc") {
                return dateB.localeCompare(dateA) || b.id - a.id;
            }
            if (sortOrder === "date_asc") {
                return dateA.localeCompare(dateB) || a.id - b.id;
            }
            if (sortOrder === "id_desc") {
                return b.id - a.id;
            }
            return a.id - b.id;
        });
    }, [appointments, search, selectedRepId, selectedStatus, dateFrom, dateTo, selectedTimeFilter, sortOrder]);

    // Cálculos de paginación
    const totalItems = filteredAppointments.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);

    const paginatedAppointments = useMemo(() => {
        const start = (safeCurrentPage - 1) * pageSize;
        return filteredAppointments.slice(start, start + pageSize);
    }, [filteredAppointments, safeCurrentPage, pageSize]);

    const visibleRangeStart = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
    const visibleRangeEnd = Math.min(safeCurrentPage * pageSize, totalItems);

    const paginationNumbers = useMemo(() => {
        const pages: (number | "ellipsis")[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
            return pages;
        }

        pages.push(1);
        if (safeCurrentPage > 3) pages.push("ellipsis");

        const start = Math.max(2, safeCurrentPage - 1);
        const end = Math.min(totalPages - 1, safeCurrentPage + 1);
        for (let i = start; i <= end; i++) pages.push(i);

        if (safeCurrentPage < totalPages - 2) pages.push("ellipsis");
        pages.push(totalPages);
        return pages;
    }, [totalPages, safeCurrentPage]);

    // Exportar CSV con BOM UTF-8 para compatibilidad directa en Excel
    const handleExportCSV = () => {
        if (filteredAppointments.length === 0) {
            toast.error("No hay citas filtradas para exportar.");
            return;
        }

        const headers = ["ID", "Representante UGD", "Motivo / Consulta", "Doctorando", "Correo", "Fecha", "Horario", "Estado"];
        const escapeCell = (val: string) => `"${val.replace(/"/g, '""')}"`;

        const rows = filteredAppointments.map((app) => {
            const rep = app.representative_nombre || app.lab_nombre || `UGD #${app.representative_id || app.lab_id}`;
            const student = app.usuario_nombre || app.user_nombre || "Estudiante";
            const email = app.usuario_email || app.user_email || "";
            const statusMeta = getAppointmentStatusMeta(app.estado);

            return [
                app.id,
                escapeCell(rep),
                escapeCell(app.materia || "Sin motivo"),
                escapeCell(student),
                escapeCell(email),
                getNormalizedDate(app.fecha),
                getNormalizedTime(app.hora_inicio),
                escapeCell(statusMeta.label),
            ].join(",");
        });

        const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const today = toLocalDateStr(new Date());

        link.setAttribute("href", url);
        link.setAttribute("download", `citas_ugd_${today}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success(`Exportadas ${filteredAppointments.length} citas exitosamente.`);
    };

    const handleRescheduleSubmit = async (rescheduleDate: string, rescheduleSlot: string) => {
        if (!rescheduleAppointment || !rescheduleDate || !rescheduleSlot) return;

        const statusMeta = getAppointmentStatusMeta(rescheduleAppointment.estado);
        if (statusMeta.code !== "ACTIVE") {
            toast.error("No es posible reagendar una cita que ya ha expirado o finalizado.");
            setRescheduleAppointment(null);
            return;
        }

        setSubmitting(true);
        try {
            await AppointmentService.adminRescheduleAppointment(
                rescheduleAppointment.id,
                rescheduleDate,
                rescheduleSlot
            );
            toast.success("Cita presencial modificada exitosamente.");
            setRescheduleAppointment(null);
            fetchData(true);
        } catch (error: any) {
            console.error("Error al reagendar cita:", error);
            toast.error(error.message || "Error al reagendar la cita presencial.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelSubmit = async () => {
        if (!cancelAppointmentObj) return;

        const statusMeta = getAppointmentStatusMeta(cancelAppointmentObj.estado);
        if (statusMeta.code !== "ACTIVE") {
            toast.error("No es posible cancelar una cita que ya ha expirado o finalizado.");
            setCancelAppointmentObj(null);
            return;
        }

        setSubmitting(true);
        try {
            await AppointmentService.adminCancelAppointment(cancelAppointmentObj.id);
            toast.success("Cita presencial cancelada correctamente.");
            setCancelAppointmentObj(null);
            fetchData(true);
        } catch (error: any) {
            console.error("Error al cancelar cita:", error);
            toast.error(error.message || "Error al anular la cita presencial.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteFromViewModal = async (id: number) => {
        const target = appointments.find((a) => a.id === id) || viewingAppointment;
        setViewingAppointment(null);
        if (target) {
            setCancelAppointmentObj(target);
        }
    };

    return (
        <div className="space-y-5 pb-12">
            {/* Encabezado */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card p-5 sm:p-6 rounded-3xl border border-border shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-2xl bg-gold-light border border-gold-border text-gold-text shadow-2xs shrink-0">
                        <History className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                            Historial Global de Citas UGD
                        </h1>
                        <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
                            Consulta, filtra y gestiona todas las citas presenciales agendadas con el personal UGD.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
                    <Button
                        variant="outline"
                        onClick={() => fetchData(true)}
                        disabled={isRefreshing}
                        className="rounded-xl border-border bg-white hover:bg-surface-hover text-foreground-soft hover:text-foreground text-xs font-semibold h-9 px-3.5 gap-1.5 cursor-pointer shadow-2xs"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 text-primary ${isRefreshing ? "animate-spin" : ""}`} />
                        <span>Actualizar</span>
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleExportCSV}
                        disabled={filteredAppointments.length === 0}
                        className="rounded-xl border-gold-border bg-gold-light hover:bg-gold hover:text-white text-gold-text text-xs font-semibold h-9 px-3.5 gap-1.5 cursor-pointer transition-all shadow-2xs"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Exportar CSV</span>
                    </Button>
                </div>
            </div>

            {/* Tarjetas de Resumen Rápido (Interactivas por Estado) */}
            <CitasStatsSummary
                stats={summaryStats}
                selectedStatus={selectedStatus}
                onSelectStatus={(status) => {
                    setSelectedStatus(status);
                    setCurrentPage(1);
                }}
            />

            {/* Panel de Filtros y Subfiltros Administrativos */}
            <CitasFilterHeader
                search={search}
                onSearchChange={(val) => {
                    setSearch(val);
                    setCurrentPage(1);
                }}
                selectedRepId={selectedRepId}
                onRepChange={(val) => {
                    setSelectedRepId(val);
                    setCurrentPage(1);
                }}
                repOptions={repOptions}
                selectedStatus={selectedStatus}
                onStatusChange={(val) => {
                    setSelectedStatus(val);
                    setCurrentPage(1);
                }}
                statusOptions={statusOptions}
                showAdvancedFilters={showAdvancedFilters}
                onToggleAdvancedFilters={() => setShowAdvancedFilters((prev) => !prev)}
                datePreset={datePreset}
                onApplyDatePreset={applyDatePreset}
                dateFrom={dateFrom}
                onDateFromChange={handleDateFromChange}
                dateTo={dateTo}
                onDateToChange={handleDateToChange}
                selectedTimeFilter={selectedTimeFilter}
                onTimeFilterChange={(val) => {
                    setSelectedTimeFilter(val);
                    setCurrentPage(1);
                }}
                timeFilterOptions={timeFilterOptions}
                sortOrder={sortOrder}
                onSortOrderChange={(val) => {
                    setSortOrder(val);
                    setCurrentPage(1);
                }}
                sortOptions={sortOptions}
                activeFiltersCount={activeFiltersCount}
                onClearAllFilters={clearAllFilters}
            />

            {/* Tabla con Control Vertical y Paginación */}
            <CitasHistoryTable
                loading={loading}
                appointments={appointments}
                totalItems={totalItems}
                activeFiltersCount={activeFiltersCount}
                paginatedAppointments={paginatedAppointments}
                visibleRangeStart={visibleRangeStart}
                visibleRangeEnd={visibleRangeEnd}
                pageSize={pageSize}
                pageSizeOptions={pageSizeOptions}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                }}
                safeCurrentPage={safeCurrentPage}
                totalPages={totalPages}
                paginationNumbers={paginationNumbers}
                onPageChange={setCurrentPage}
                onViewAppointment={setViewingAppointment}
                onRescheduleAppointment={(app) => setRescheduleAppointment(app)}
                onCancelAppointment={(app) => setCancelAppointmentObj(app)}
                getNormalizedDate={getNormalizedDate}
                getNormalizedTime={getNormalizedTime}
            />

            {/* Modal Ficha de Cita */}
            <ViewAppointmentModal
                isOpen={!!viewingAppointment}
                onClose={() => setViewingAppointment(null)}
                appointment={viewingAppointment}
                onDelete={handleDeleteFromViewModal}
                isDeleting={submitting}
            />

            {/* Modal Reagendar */}
            <CitaRescheduleModal
                isOpen={!!rescheduleAppointment}
                appointment={rescheduleAppointment}
                onClose={() => setRescheduleAppointment(null)}
                onConfirm={handleRescheduleSubmit}
                isSubmitting={submitting}
                slotOptions={slotOptions}
                getNormalizedDate={getNormalizedDate}
                getNormalizedTime={getNormalizedTime}
            />

            {/* Modal Cancelar */}
            <CitaCancelModal
                isOpen={!!cancelAppointmentObj}
                appointment={cancelAppointmentObj}
                onClose={() => setCancelAppointmentObj(null)}
                onConfirm={handleCancelSubmit}
                isSubmitting={submitting}
                getNormalizedDate={getNormalizedDate}
            />
        </div>
    );
}
