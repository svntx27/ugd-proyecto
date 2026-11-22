"use client";

import { useEffect, useState, useMemo } from "react";
import { AppointmentService, Representative, Appointment } from "@/services/appointment.service";
import { AuthService } from "@/services/auth.service";
import { UserCheck, CalendarCheck, ChevronLeft, ChevronRight, Clock, Plus, Calendar, CheckCircle2 } from "lucide-react";
import { getAppointmentStatusMeta } from "@/lib/appointment-status.helper";
import { CompactPagination } from "@/components/ui/compact-pagination";

const PERIOD_PAGE_SIZE = 4;

function parseLocalDate(dateStr: unknown): Date {
    if (!dateStr) return new Date();
    const cleanDateStr = String(dateStr).split('T')[0];
    const [year, month, day] = cleanDateStr.split('-');
    return new Date(Number(year), Number(month) - 1, Number(day));
}

interface RightPanelProps {
    currentViewDate?: Date;
    setCurrentViewDate?: React.Dispatch<React.SetStateAction<Date>>;
    selectedRepId?: string;
    setSelectedRepId?: React.Dispatch<React.SetStateAction<string>>;
    onSelectAppointment?: (app: Appointment) => void;
    onRequestNewAppointment?: () => void;
}

export function RightPanel({
    currentViewDate = new Date(),
    setCurrentViewDate,
    selectedRepId = "all",
    setSelectedRepId,
    onSelectAppointment,
    onRequestNewAppointment
}: RightPanelProps) {
    const [labs, setLabs] = useState<Representative[]>([]);
    const [reservations, setReservations] = useState<Appointment[]>([]);
    const [periodPagination, setPeriodPagination] = useState<{ scopeKey: string; page: number }>({
        scopeKey: "",
        page: 1,
    });

    const today = new Date();
    const days = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    useEffect(() => {
        if (!AuthService.isAuthenticated()) return;

        const fetchData = async () => {
            if (!AuthService.isAuthenticated()) return;
            try {
                const [labsData, resData] = await Promise.all([
                    AppointmentService.listRepresentatives(),
                    AppointmentService.getAppointments()
                ]);
                setLabs(labsData);
                setReservations(resData);
            } catch (error) {
                console.error("Error fetching right panel data", error);
            }
        };

        fetchData();

        const handleSync = (event: Event) => {
            const customEvent = event as CustomEvent<Appointment[]>;
            if (customEvent.detail) {
                setReservations(customEvent.detail);
            }
        };

        window.addEventListener("ugd:appointments-synced", handleSync);
        return () => window.removeEventListener("ugd:appointments-synced", handleSync);
    }, []);

    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const miniDates = Array.from({ length: 42 }, (_, i) => {
        if (i < firstDayOfMonth) {
            return {
                day: prevMonthDays - firstDayOfMonth + i + 1,
                type: "prev",
                dateObj: new Date(year, month - 1, prevMonthDays - firstDayOfMonth + i + 1)
            };
        }
        if (i >= firstDayOfMonth + daysInMonth) {
            return {
                day: i - firstDayOfMonth - daysInMonth + 1,
                type: "next",
                dateObj: new Date(year, month + 1, i - firstDayOfMonth - daysInMonth + 1)
            };
        }
        return {
            day: i - firstDayOfMonth + 1,
            type: "current",
            dateObj: new Date(year, month, i - firstDayOfMonth + 1)
        };
    });

    // Fechas que tienen citas en el mes visualizado
    const datesWithAppointments = useMemo(() => {
        const set = new Set<string>();
        reservations.forEach(r => {
            if (r.fecha) {
                const dateKey = String(r.fecha).split('T')[0];
                set.add(dateKey);
            }
        });
        return set;
    }, [reservations]);

    // Citas filtradas del mes activo
    const currentMonthReservations = useMemo(() => {
        return reservations
            .filter(r => {
                if (!r.fecha) return false;
                const resDate = parseLocalDate(r.fecha);
                const matchesMonth = resDate.getMonth() === month && resDate.getFullYear() === year;
                if (!matchesMonth) return false;

                if (selectedRepId !== "all") {
                    return String(r.representative_id || r.lab_id) === selectedRepId;
                }
                return true;
            })
            .sort((a, b) => {
                const dA = parseLocalDate(a.fecha).getTime();
                const dB = parseLocalDate(b.fecha).getTime();
                if (dA !== dB) return dA - dB;
                return String(a.hora_inicio).localeCompare(String(b.hora_inicio));
            });
    }, [reservations, month, year, selectedRepId]);

    const periodScopeKey = `${year}-${month}-${selectedRepId}`;
    const totalPeriodPages = Math.max(1, Math.ceil(currentMonthReservations.length / PERIOD_PAGE_SIZE));
    const rawPeriodPage = periodPagination.scopeKey === periodScopeKey ? periodPagination.page : 1;
    const safePeriodPage = Math.min(rawPeriodPage, totalPeriodPages);
    const paginatedMonthReservations = currentMonthReservations.slice(
        (safePeriodPage - 1) * PERIOD_PAGE_SIZE,
        safePeriodPage * PERIOD_PAGE_SIZE
    );

    const handleMiniDayClick = (dateObj: Date) => {
        setCurrentViewDate?.(new Date(dateObj));
    };

    const handlePrevMonth = () => {
        setCurrentViewDate?.(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentViewDate?.(new Date(year, month + 1, 1));
    };

    return (
        <div className="w-full xl:w-80 flex flex-col gap-5 overflow-y-auto no-scrollbar shrink-0 pb-4">
            {/* 1. Mini Calendar Card con navegación y puntos de eventos */}
            <div className="bg-card rounded-3xl p-5 border border-border shadow-xs">
                <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-border-subtle">
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={handlePrevMonth}
                            className="p-1 hover:bg-surface-hover rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="Mes anterior"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <h3 className="font-serif font-bold text-foreground text-sm capitalize">
                            {monthNames[month]} {year}
                        </h3>
                        <button
                            onClick={handleNextMonth}
                            className="p-1 hover:bg-surface-hover rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="Mes siguiente"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <span className="text-[10px] font-semibold text-accent-foreground bg-accent px-2 py-0.5 rounded-full border border-border-strong">
                        {currentMonthReservations.length} citas
                    </span>
                </div>

                <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs">
                    {days.map(d => (
                        <div key={d} className="text-muted-subtle font-bold text-[10px] uppercase py-1 select-none">
                            {d}
                        </div>
                    ))}
                    {miniDates.map((item, i) => {
                        const isTodayDate = item.type === 'current' &&
                            item.day === today.getDate() &&
                            month === today.getMonth() &&
                            year === today.getFullYear();

                        const isSelectedDate = item.type === 'current' &&
                            item.day === currentViewDate.getDate() &&
                            month === currentViewDate.getMonth() &&
                            year === currentViewDate.getFullYear();

                        const dateKey = `${item.dateObj.getFullYear()}-${String(item.dateObj.getMonth() + 1).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`;
                        const hasAppointments = datesWithAppointments.has(dateKey);

                        return (
                            <button
                                key={i}
                                onClick={() => handleMiniDayClick(item.dateObj)}
                                className={`flex flex-col justify-center items-center w-8 h-8 mx-auto rounded-xl text-xs transition-all relative cursor-pointer
                                    ${isTodayDate
                                        ? 'bg-primary text-white font-bold shadow-xs'
                                        : isSelectedDate
                                        ? 'bg-accent text-foreground font-bold border border-border-strong'
                                        : item.type === 'current'
                                        ? 'text-foreground-soft hover:bg-surface-hover font-medium'
                                        : 'text-muted-subtle/60 hover:bg-surface-subtle'
                                    }
                                `}
                            >
                                <span>{item.day}</span>
                                {hasAppointments && !isTodayDate && (
                                    <span className="w-1 h-1 rounded-full bg-primary absolute bottom-1" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2. Equipo UGD & Filtro Rápido */}
            <div className="bg-card rounded-3xl p-5 border border-border shadow-xs space-y-3.5">
                <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
                    <h3 className="font-bold text-foreground text-sm">Equipo UGD</h3>
                    <span className="text-xs text-foreground-muted font-mono">{labs.length} representantes</span>
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => setSelectedRepId?.("all")}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer ${
                            selectedRepId === "all"
                                ? "bg-accent text-foreground border-border-strong shadow-2xs font-semibold"
                                : "bg-card text-foreground-muted border-border hover:bg-surface-hover"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-card border border-border-strong flex items-center justify-center text-role-dev font-bold text-[10px]">
                                ALL
                            </div>
                            <span>Todos los Representantes</span>
                        </div>
                        <span className="text-[11px] font-mono font-bold">{reservations.length}</span>
                    </button>

                    {labs.map((rep) => {
                        const repCount = reservations.filter(r => String(r.representative_id || r.lab_id) === String(rep.id)).length;
                        const isSelected = selectedRepId === String(rep.id);

                        return (
                            <button
                                key={rep.id}
                                onClick={() => setSelectedRepId?.(isSelected ? "all" : String(rep.id))}
                                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer ${
                                    isSelected
                                        ? "bg-accent text-foreground border-border-strong shadow-2xs font-semibold"
                                        : "bg-card text-foreground-muted border-border hover:bg-surface-hover"
                                }`}
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-7 h-7 rounded-lg bg-role-dev-bg border border-border-strong flex items-center justify-center text-role-dev font-bold text-xs shrink-0">
                                        {rep.nombre.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="truncate">
                                        <p className="truncate text-foreground">{rep.nombre}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">{rep.title || 'Personal UGD'}</p>
                                    </div>
                                </div>
                                <span className="text-[11px] font-mono font-bold text-primary shrink-0 ml-2">
                                    {repCount}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 3. Citas de la Agenda del Periodo */}
            <div className="bg-card rounded-3xl p-5 flex flex-col shrink-0 min-h-[220px] border border-border shadow-xs">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-border-subtle">
                    <div>
                        <h3 className="font-bold text-foreground text-sm">Citas del Periodo</h3>
                        <p className="text-[11px] text-muted-foreground capitalize">{monthNames[month]} {year}</p>
                    </div>
                    <button
                        onClick={() => onRequestNewAppointment?.()}
                        className="p-1.5 hover:bg-accent rounded-xl text-primary transition-colors cursor-pointer"
                        title="Agendar nueva cita"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {currentMonthReservations.length === 0 ? (
                    <div className="text-center py-10 flex flex-col items-center justify-center space-y-2.5 my-auto">
                        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-primary">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold text-foreground">Sin citas en este mes</p>
                        <p className="text-[11px] text-muted-subtle max-w-[180px]">
                            No hay citas presenciales agendadas para el periodo actual.
                        </p>
                        <button
                            onClick={() => onRequestNewAppointment?.()}
                            className="text-xs font-semibold text-primary hover:underline pt-1 cursor-pointer"
                        >
                            + Agendar Cita
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2.5">
                            {paginatedMonthReservations.map((res) => {
                                const dateParsed = parseLocalDate(res.fecha);
                                const dayNum = dateParsed.getDate();
                                const monthAbbr = dateParsed.toLocaleDateString('es-ES', { month: 'short' });
                                const statusMeta = getAppointmentStatusMeta(res.estado);

                                return (
                                    <div
                                        key={res.id}
                                        onClick={() => onSelectAppointment?.(res)}
                                        className="p-3 rounded-2xl bg-card hover:bg-accent/50 border border-border hover:border-border-strong transition-all cursor-pointer shadow-2xs hover:shadow-xs flex items-center justify-between gap-3 group"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center text-center shrink-0 ${statusMeta.timeBoxClass}`}>
                                                <span className={`text-[10px] font-bold leading-tight font-mono ${statusMeta.timeTextClass}`}>{res.hora_inicio}</span>
                                                <span className="text-[9px] text-foreground-muted uppercase">{dayNum} {monthAbbr}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-semibold text-xs text-foreground truncate group-hover:text-primary-deep">
                                                    {res.materia}
                                                </h4>
                                                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                                    {res.representative_nombre || `UGD ID: ${res.representative_id || res.lab_id}`}
                                                </p>
                                            </div>
                                        </div>

                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${statusMeta.badgeClass}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                                            {statusMeta.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <CompactPagination
                            currentPage={safePeriodPage}
                            totalItems={currentMonthReservations.length}
                            pageSize={PERIOD_PAGE_SIZE}
                            onPageChange={(nextPage) =>
                                setPeriodPagination({ scopeKey: periodScopeKey, page: nextPage })
                            }
                            itemLabel="citas"
                            className="mt-3"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
