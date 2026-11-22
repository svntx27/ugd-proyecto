"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { AppointmentService, Representative, Appointment, CreateBookingRequest } from "@/services/appointment.service";
import { SettingsService } from "@/services/settings.service";
import { AuthService } from "@/services/auth.service";
import {
    generateTimeSlots,
    parseScheduleConfig,
    SystemScheduleConfig,
    DEFAULT_START_HOUR,
    DEFAULT_END_HOUR,
    DEFAULT_SLOT_INTERVAL,
} from "@/lib/schedule.helper";
import { AppointmentModal } from "./AppointmentModal";
import { ViewAppointmentModal } from "./ViewAppointmentModal";
import { CalendarHeaderToolbar, RepFilterOption } from "@/components/calendar/CalendarHeaderToolbar";
import { CalendarInfoBanner } from "@/components/calendar/CalendarInfoBanner";
import { CalendarDayTimeline } from "@/components/calendar/CalendarDayTimeline";
import { CalendarWeekGridView } from "@/components/calendar/CalendarWeekGridView";

interface MainCalendarProps {
    currentViewDate?: Date;
    setCurrentViewDate?: React.Dispatch<React.SetStateAction<Date>>;
    selectedRepId?: string;
    setSelectedRepId?: React.Dispatch<React.SetStateAction<string>>;
    externalViewingAppointment?: Appointment | null;
    setExternalViewingAppointment?: React.Dispatch<React.SetStateAction<Appointment | null>>;
    isNewModalRequested?: boolean;
    setIsNewModalRequested?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function MainCalendar({
    currentViewDate: externalDate,
    setCurrentViewDate: setExternalDate,
    selectedRepId: externalRepId,
    setSelectedRepId: setExternalRepId,
    externalViewingAppointment,
    setExternalViewingAppointment,
    isNewModalRequested,
    setIsNewModalRequested
}: MainCalendarProps) {
    const [labs, setLabs] = useState<Representative[]>([]);
    const [reservations, setReservations] = useState<Appointment[]>([]);
    const [scheduleConfig, setScheduleConfig] = useState<SystemScheduleConfig>({
        startHour: DEFAULT_START_HOUR,
        endHour: DEFAULT_END_HOUR,
        slotInterval: DEFAULT_SLOT_INTERVAL,
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalSlot, setModalSlot] = useState(DEFAULT_START_HOUR);

    const timeSlots = useMemo(() => {
        return generateTimeSlots(
            scheduleConfig.startHour,
            scheduleConfig.endHour,
            scheduleConfig.slotInterval
        );
    }, [scheduleConfig]);

    const [internalRepId, setInternalRepId] = useState<string>("all");
    const selectedRepId = externalRepId ?? internalRepId;
    const setSelectedRepId = setExternalRepId ?? setInternalRepId;

    const [searchQuery, setSearchQuery] = useState("");
    
    // Switch de vista propicio para agenda: 'day' (Agenda horaria) vs 'week' (Semana laboral L-V)
    const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

    const repFilterOptions = useMemo(() => {
        return [
            { value: "all", label: "Todos los Representantes", dotClass: "bg-primary" },
            ...labs.map((rep) => ({
                value: String(rep.id),
                label: rep.nombre,
                sublabel: rep.title || "Personal UGD",
                dotClass: "bg-primary",
            })),
        ];
    }, [labs]);

    // Filtro de turnos para la agenda diaria: 'all' | 'morning' | 'afternoon' | 'booked'
    const [shiftFilter, setShiftFilter] = useState<'all' | 'morning' | 'afternoon' | 'booked'>('all');

    // Control para mostrar u ocultar franjas ya transcurridas en el día actual
    const [showPastTodaySlots, setShowPastTodaySlots] = useState(false);

    const [internalViewDate, setInternalViewDate] = useState<Date>(new Date());
    const currentViewDate = externalDate || internalViewDate;
    const setCurrentViewDate = setExternalDate || setInternalViewDate;

    // Resetear visualización de transcurridos al cambiar de fecha
    useEffect(() => {
        setShowPastTodaySlots(false);
    }, [currentViewDate]);

    const [viewReservation, setViewReservation] = useState<Appointment | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeletingReservation, setIsDeletingReservation] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Reloj en vivo para hora real si es hoy
    const [liveNow, setLiveNow] = useState<Date>(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setLiveNow(new Date());
        }, 15000);
        return () => clearInterval(timer);
    }, []);

    // Sincronizar modal externo si es solicitado desde el RightPanel
    useEffect(() => {
        if (externalViewingAppointment) {
            setViewReservation(externalViewingAppointment);
            setIsViewModalOpen(true);
        }
    }, [externalViewingAppointment]);

    useEffect(() => {
        if (isNewModalRequested) {
            handleOpenModal(undefined, scheduleConfig.startHour);
            setIsNewModalRequested?.(false);
        }
    }, [isNewModalRequested, setIsNewModalRequested, scheduleConfig.startHour]);

    useEffect(() => {
        if (!AuthService.isAuthenticated()) return;

        const fetchData = async () => {
            try {
                const [labsData, resData, settingsData] = await Promise.all([
                    AppointmentService.listRepresentatives(),
                    AppointmentService.getAppointments(),
                    SettingsService.getSettings().catch(() => []),
                ]);
                setLabs(labsData);
                setReservations(resData);
                if (settingsData && settingsData.length > 0) {
                    setScheduleConfig(parseScheduleConfig(settingsData));
                }
            } catch (error) {
                console.error("Error fetching calendar data", error);
            }
        };
        fetchData();

        const handleSync = (event: Event) => {
            const customEvent = event as CustomEvent<Appointment[]>;
            if (customEvent.detail) {
                setReservations(customEvent.detail);
            }
        };

        window.addEventListener('ugd:appointments-synced', handleSync);
        return () => window.removeEventListener('ugd:appointments-synced', handleSync);
    }, []);

    const refreshData = async () => {
        try {
            const resData = await AppointmentService.getAppointments();
            setReservations(resData);
        } catch (error) {
            console.error("Error refreshing reservations", error);
        }
    };

    const handleManualRefresh = async () => {
        setIsRefreshing(true);
        await refreshData();
        setTimeout(() => setIsRefreshing(false), 500);
        toast.success("Agenda actualizada");
    };

    const handleOpenModal = (dateObj?: Date, slot = scheduleConfig.startHour) => {
        if (dateObj) {
            setCurrentViewDate(dateObj);
        }
        setModalSlot(slot);
        setIsModalOpen(true);
    };

    const handleSaveReservation = async (data: CreateBookingRequest) => {
        try {
            await AppointmentService.createAppointment(data);
            setIsModalOpen(false);
            toast.success("Cita presencial UGD agendada correctamente");
            refreshData();
        } catch (error) {
            console.error("Error creating booking", error);
            toast.error("Error al agendar cita");
        }
    };

    const handleOpenViewModal = (res: Appointment) => {
        setViewReservation(res);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setViewReservation(null);
        setExternalViewingAppointment?.(null);
    };

    const handleDeleteReservation = async (id: number) => {
        setIsDeletingReservation(true);
        try {
            await AppointmentService.adminCancelAppointment(id);
            toast.success("Cita UGD cancelada exitosamente");
            handleCloseViewModal();
            refreshData();
        } catch (error) {
            console.error(error);
            toast.error("Error al cancelar cita");
        } finally {
            setIsDeletingReservation(false);
        }
    };

    // Navegación de días o semanas
    const handlePrev = () => {
        if (viewMode === 'week') {
            const currentMonday = weekDays[0] ? new Date(weekDays[0]) : new Date(currentViewDate);
            currentMonday.setDate(currentMonday.getDate() - 7);
            setCurrentViewDate(currentMonday);
        } else {
            const prev = new Date(currentViewDate);
            prev.setDate(prev.getDate() - 1);
            setCurrentViewDate(prev);
        }
    };

    const handleNext = () => {
        if (viewMode === 'week') {
            const currentMonday = weekDays[0] ? new Date(weekDays[0]) : new Date(currentViewDate);
            currentMonday.setDate(currentMonday.getDate() + 7);
            setCurrentViewDate(currentMonday);
        } else {
            const next = new Date(currentViewDate);
            next.setDate(next.getDate() + 1);
            setCurrentViewDate(next);
        }
    };

    const handleToday = () => {
        setCurrentViewDate(new Date());
    };

    // Formato de clave YYYY-MM-DD para el día visualizado
    const currentDayKey = useMemo(() => {
        const y = currentViewDate.getFullYear();
        const m = String(currentViewDate.getMonth() + 1).padStart(2, '0');
        const d = String(currentViewDate.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }, [currentViewDate]);

    // Filtrar citas del día visualizado
    const dayAppointments = useMemo(() => {
        return reservations.filter(r => {
            if (!r.fecha) return false;
            const resDateKey = String(r.fecha).split('T')[0];
            if (resDateKey !== currentDayKey) return false;

            // Filtro por representante
            if (selectedRepId !== "all") {
                const repId = String(r.representative_id || r.lab_id);
                if (repId !== selectedRepId) return false;
            }

            // Filtro por búsqueda
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const repName = (r.representative_nombre || r.lab_nombre || '').toLowerCase();
                const userName = (r.usuario_nombre || r.user_nombre || '').toLowerCase();
                const materia = (r.materia || '').toLowerCase();
                const hora = String(r.hora_inicio || '');

                if (!repName.includes(query) && !userName.includes(query) && !materia.includes(query) && !hora.includes(query)) {
                    return false;
                }
            }

            return true;
        });
    }, [reservations, currentDayKey, selectedRepId, searchQuery]);

    // Mapa de citas por franja horaria para el día seleccionado
    const slotAppointmentsMap = useMemo(() => {
        const map: Record<string, Appointment[]> = {};
        timeSlots.forEach(slot => {
            map[slot] = [];
        });

        dayAppointments.forEach(app => {
            const hora = String(app.hora_inicio || scheduleConfig.startHour).substring(0, 5);
            if (!map[hora]) {
                map[hora] = [];
            }
            map[hora].push(app);
        });

        return map;
    }, [dayAppointments, timeSlots, scheduleConfig.startHour]);

    // Verificar si el día visualizado es HOY
    const isToday = currentViewDate.toDateString() === liveNow.toDateString();

    // Franjas horarias base para el día:
    // - Día actual: muestra dinámicamente desde la hora actual en adelante (manteniendo visible el turno en curso si aún no termina)
    // - Días anteriores o futuros: muestra la jornada completa
    const { baseTimeSlots, pastSlotsCount } = useMemo(() => {
        if (!isToday) {
            return { baseTimeSlots: timeSlots, pastSlotsCount: 0 };
        }

        const currentMinutes = liveNow.getHours() * 60 + liveNow.getMinutes();

        // Franjas que ya finalizaron completamente (fin de turno <= hora actual)
        const passedSlots = timeSlots.filter(slot => {
            const [h, m] = slot.split(':').map(Number);
            const slotEndMinutes = h * 60 + m + scheduleConfig.slotInterval;
            return slotEndMinutes <= currentMinutes;
        });

        if (showPastTodaySlots) {
            return { baseTimeSlots: timeSlots, pastSlotsCount: passedSlots.length };
        }

        // Franjas pendientes o en curso (fin de turno > hora actual)
        const pendingSlots = timeSlots.filter(slot => {
            const [h, m] = slot.split(':').map(Number);
            const slotEndMinutes = h * 60 + m + scheduleConfig.slotInterval;
            return slotEndMinutes > currentMinutes;
        });

        return { baseTimeSlots: pendingSlots, pastSlotsCount: passedSlots.length };
    }, [isToday, showPastTodaySlots, liveNow, timeSlots, scheduleConfig.slotInterval]);

    // Conteo por turnos para badges de filtros
    const morningCount = useMemo(() => {
        return dayAppointments.filter(app => {
            const h = String(app.hora_inicio || scheduleConfig.startHour).substring(0, 5);
            if (h >= "12:00") return false;
            if (isToday && !showPastTodaySlots) {
                return baseTimeSlots.includes(h);
            }
            return true;
        }).length;
    }, [dayAppointments, isToday, showPastTodaySlots, baseTimeSlots, scheduleConfig.startHour]);

    const afternoonCount = useMemo(() => {
        return dayAppointments.filter(app => {
            const h = String(app.hora_inicio || scheduleConfig.startHour).substring(0, 5);
            if (h < "12:00") return false;
            if (isToday && !showPastTodaySlots) {
                return baseTimeSlots.includes(h);
            }
            return true;
        }).length;
    }, [dayAppointments, isToday, showPastTodaySlots, baseTimeSlots, scheduleConfig.startHour]);

    // Franjas horarias filtradas por turno o disponibilidad
    const filteredTimeSlots = useMemo(() => {
        let slots = baseTimeSlots;

        if (shiftFilter === 'morning') {
            slots = slots.filter(slot => slot < "12:00");
        } else if (shiftFilter === 'afternoon') {
            slots = slots.filter(slot => slot >= "12:00");
        } else if (shiftFilter === 'booked') {
            slots = slots.filter(slot => (slotAppointmentsMap[slot] || []).length > 0);
        }

        return slots;
    }, [baseTimeSlots, shiftFilter, slotAppointmentsMap]);

    // Calcular días laborales de la semana (Lunes a Viernes)
    const weekDays = useMemo(() => {
        const base = new Date(currentViewDate);
        const day = base.getDay(); // 0 es Domingo, 1 es Lunes...
        // Si es Domingo (0), la semana laboral que corresponde en el calendario es el lunes siguiente (+1).
        // Para Lunes a Sábado (1-6), tomamos el lunes de la semana laboral activa (1 - day).
        const diffToMonday = day === 0 ? 1 : (1 - day);
        const monday = new Date(base.getFullYear(), base.getMonth(), base.getDate() + diffToMonday);

        return [0, 1, 2, 3, 4].map(offset => {
            return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset);
        });
    }, [currentViewDate]);

    // Número de semana del año para el indicador visual
    const weekNumber = useMemo(() => {
        if (weekDays.length === 0) return 1;
        const d = new Date(Date.UTC(weekDays[0].getFullYear(), weekDays[0].getMonth(), weekDays[0].getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    }, [weekDays]);

    // Título formateado de la semana (Versión completa para desktop)
    const formattedWeekTitle = useMemo(() => {
        if (weekDays.length < 5) return "";
        const start = weekDays[0];
        const end = weekDays[4];
        const startMonth = start.toLocaleDateString('es-ES', { month: 'short' });
        const endMonth = end.toLocaleDateString('es-ES', { month: 'short' });

        if (startMonth === endMonth) {
            return `${start.getDate()} al ${end.getDate()} de ${start.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
        }
        return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth} ${end.getFullYear()}`;
    }, [weekDays]);

    // Título compacto de la semana (A prueba de desbordes en móviles)
    const compactWeekTitle = useMemo(() => {
        if (weekDays.length < 5) return "";
        const start = weekDays[0];
        const end = weekDays[4];
        const startMonth = start.toLocaleDateString('es-ES', { month: 'short' });
        const endMonth = end.toLocaleDateString('es-ES', { month: 'short' });

        if (startMonth === endMonth) {
            return `${start.getDate()} - ${end.getDate()} ${startMonth}`;
        }
        return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth}`;
    }, [weekDays]);

    // Obtener citas de un día específico en la semana
    const getAppointmentsForDay = useCallback((dateObj: Date) => {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        const key = `${y}-${m}-${d}`;

        return reservations.filter(r => {
            if (!r.fecha) return false;
            const resKey = String(r.fecha).split('T')[0];
            if (resKey !== key) return false;

            if (selectedRepId !== "all") {
                const repId = String(r.representative_id || r.lab_id);
                if (repId !== selectedRepId) return false;
            }

            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const repName = (r.representative_nombre || r.lab_nombre || '').toLowerCase();
                const userName = (r.usuario_nombre || r.user_nombre || '').toLowerCase();
                const materia = (r.materia || '').toLowerCase();
                const hora = String(r.hora_inicio || '');

                if (!repName.includes(query) && !userName.includes(query) && !materia.includes(query) && !hora.includes(query)) {
                    return false;
                }
            }

            return true;
        }).sort((a, b) => String(a.hora_inicio || '').localeCompare(String(b.hora_inicio || '')));
    }, [reservations, selectedRepId, searchQuery]);

    // Conteo total de citas en la semana visualizada
    const totalWeekAppointments = useMemo(() => {
        return weekDays.reduce((acc, d) => acc + getAppointmentsForDay(d).length, 0);
    }, [weekDays, getAppointmentsForDay]);

    // Formato legible para el título del día
    const formattedDayTitle = useMemo(() => {
        return new Intl.DateTimeFormat('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(currentViewDate);
    }, [currentViewDate]);

    return (
        <div className="flex-1 w-full max-w-full bg-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 lg:p-7 flex flex-col border border-border shadow-xs overflow-hidden">
            {/* 1. Header Toolbar Totalmente Responsivo */}
            <CalendarHeaderToolbar
                onNewAppointment={() => handleOpenModal(currentViewDate, "08:00")}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onToday={handleToday}
                isToday={isToday}
                onRefresh={handleManualRefresh}
                isRefreshing={isRefreshing}
                selectedRepId={selectedRepId}
                onRepChange={(val) => setSelectedRepId(val)}
                repFilterOptions={repFilterOptions}
                onPrev={handlePrev}
                onNext={handleNext}
                displayDateLabel={
                    viewMode === "week"
                        ? compactWeekTitle
                        : currentViewDate.toLocaleDateString("es-ES", { month: "short", day: "numeric" })
                }
            />

            {/* 2. Banner de Información y Filtros Rápidos */}
            <CalendarInfoBanner
                viewMode={viewMode}
                currentViewDate={currentViewDate}
                isToday={isToday}
                weekNumber={weekNumber}
                formattedWeekTitle={formattedWeekTitle}
                formattedDayTitle={formattedDayTitle}
                totalWeekAppointments={totalWeekAppointments}
                dayAppointmentsCount={dayAppointments.length}
                showPastTodaySlots={showPastTodaySlots}
                baseTimeSlotsCount={baseTimeSlots.length}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                shiftFilter={shiftFilter}
                onShiftFilterChange={setShiftFilter}
                morningCount={morningCount}
                afternoonCount={afternoonCount}
                startHour={scheduleConfig.startHour}
                endHour={scheduleConfig.endHour}
            />

            {/* 3. VISTA PRINCIPAL: Desglose por Horas del Día (Timeline Agenda) */}
            {viewMode === 'day' && (
                <CalendarDayTimeline
                    isToday={isToday}
                    pastSlotsCount={pastSlotsCount}
                    showPastTodaySlots={showPastTodaySlots}
                    onToggleShowPastSlots={() => setShowPastTodaySlots(prev => !prev)}
                    baseTimeSlots={timeSlots}
                    filteredTimeSlots={filteredTimeSlots}
                    slotAppointmentsMap={slotAppointmentsMap}
                    dayAppointmentsCount={dayAppointments.length}
                    liveNow={liveNow}
                    onOpenModal={(date, slot) => handleOpenModal(date || currentViewDate, slot)}
                    onOpenViewModal={handleOpenViewModal}
                    onNextDay={handleNext}
                    onResetShiftFilter={() => setShiftFilter('all')}
                    currentViewDate={currentViewDate}
                    slotInterval={scheduleConfig.slotInterval}
                    endHour={scheduleConfig.endHour}
                />
            )}

            {/* 4. VISTA SEMANAL (L-V): Agenda tipo Grid Horario Profesional (Celdas por Hora) */}
            {viewMode === 'week' && (
                <CalendarWeekGridView
                    weekDays={weekDays}
                    liveNow={liveNow}
                    currentViewDate={currentViewDate}
                    timeSlots={timeSlots}
                    selectedRepId={selectedRepId}
                    getAppointmentsForDay={getAppointmentsForDay}
                    onSelectDayDate={setCurrentViewDate}
                    onSwitchToDayView={(dayDate) => {
                        setCurrentViewDate(dayDate);
                        setViewMode('day');
                    }}
                    onOpenModal={(dayDate, slot) => handleOpenModal(dayDate, slot)}
                    onOpenViewModal={handleOpenViewModal}
                />
            )}

            {/* Modales de Gestión de Citas */}
            <AppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedDate={currentViewDate}
                initialSlot={modalSlot}
                representatives={labs}
                onSave={handleSaveReservation}
                timeSlots={timeSlots}
                slotInterval={scheduleConfig.slotInterval}
            />

            <ViewAppointmentModal
                isOpen={isViewModalOpen}
                onClose={handleCloseViewModal}
                appointment={viewReservation}
                onDelete={handleDeleteReservation}
                isDeleting={isDeletingReservation}
            />
        </div>
    );
}
