"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Representative, CreateBookingRequest } from "@/services/appointment.service";
import { CalendarPlus, Clock, UserCheck, FileText, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { CustomSelect, CustomSelectOption } from "@/components/ui/custom-select";
import {
    generateTimeSlots,
    buildSlotOptions,
    DEFAULT_START_HOUR,
    DEFAULT_SLOT_INTERVAL,
} from "@/lib/schedule.helper";

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date;
    initialSlot?: string;
    representatives: Representative[];
    onSave: (data: CreateBookingRequest) => void;
    timeSlots?: string[];
    slotInterval?: number;
}

const SUGGESTED_TOPICS = [
    "Revisión de Avance Doctoral",
    "Trámite de Titulación",
    "Defensa de Propuesta",
    "Comité Académico",
    "Consultoría Metodológica"
];

export function AppointmentModal({
    isOpen,
    onClose,
    selectedDate,
    initialSlot,
    representatives,
    onSave,
    timeSlots,
    slotInterval = DEFAULT_SLOT_INTERVAL,
}: AppointmentModalProps) {
    const availableSlots = useMemo(() => {
        return timeSlots && timeSlots.length > 0 ? timeSlots : generateTimeSlots();
    }, [timeSlots]);

    const defaultInitialSlot = initialSlot || availableSlots[0] || DEFAULT_START_HOUR;
    const [representativeId, setRepresentativeId] = useState<string>("");
    const [selectedSlot, setSelectedSlot] = useState(defaultInitialSlot);
    const [materia, setMateria] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSelectedSlot(initialSlot || availableSlots[0] || DEFAULT_START_HOUR);
            setMateria("");
            setIsSubmitting(false);
            if (representatives.length > 0 && !representativeId) {
                setRepresentativeId(representatives[0].id.toString());
            }
        }
    }, [isOpen, initialSlot, representatives, availableSlots]);

    const formattedSelectedDate = useMemo(() => {
        return new Intl.DateTimeFormat('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(selectedDate);
    }, [selectedDate]);

    const selectedRepresentative = useMemo(() => {
        return representatives.find(r => r.id.toString() === representativeId);
    }, [representatives, representativeId]);

    const representativeOptions: CustomSelectOption[] = useMemo(() => {
        return representatives.map((rep) => ({
            value: rep.id.toString(),
            label: rep.nombre,
            sublabel: `${rep.title || 'Personal UGD'} • ${rep.ubicacion || 'Oficina UGD'}`,
            dotClass: "bg-primary"
        }));
    }, [representatives]);

    const slotOptions: CustomSelectOption[] = useMemo(() => {
        return buildSlotOptions(availableSlots, slotInterval);
    }, [availableSlots, slotInterval]);

    const handleSave = async () => {
        if (!representativeId) {
            toast.error("Por favor, seleccione un representante UGD.");
            return;
        }

        if (!materia.trim()) {
            toast.error("Por favor, indique el motivo o trámite de la cita.");
            return;
        }

        setIsSubmitting(true);
        try {
            const yyyy = selectedDate.getFullYear();
            const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const dd = String(selectedDate.getDate()).padStart(2, '0');
            const localDateStr = `${yyyy}-${mm}-${dd}`;

            await onSave({
                representative_id: Number(representativeId),
                lab_id: Number(representativeId),
                fecha: localDateStr,
                horas: [selectedSlot],
                materia: materia.trim(),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg bg-card border border-border rounded-3xl p-5 sm:p-7 shadow-2xl overflow-visible">
                {/* Cabecera de Alto Impacto */}
                <DialogHeader className="pb-4 border-b border-border-subtle">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gold-light border border-gold-border flex items-center justify-center text-gold shadow-2xs shrink-0">
                            <CalendarPlus className="w-6 h-6 text-gold" />
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="text-lg sm:text-xl font-serif font-bold text-foreground tracking-tight">
                                Agendar Cita Presencial UGD
                            </DialogTitle>
                            <DialogDescription className="text-xs text-foreground-muted mt-0.5">
                                Reserva un turno de atención personalizada en la Unidad de Gestión de Doctorados.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex flex-col gap-4 my-2">
                    {/* Tarjeta Ejecutiva de Fecha y Horario */}
                    <div className="bg-background p-3.5 rounded-2xl border border-border flex items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-card border border-border-strong flex flex-col items-center justify-center text-primary-deep shrink-0 font-mono shadow-2xs">
                                <span className="text-[9px] font-bold uppercase leading-none text-muted-foreground">
                                    {selectedDate.toLocaleDateString('es-ES', { month: 'short' })}
                                </span>
                                <span className="text-base font-bold leading-tight">
                                    {selectedDate.getDate()}
                                </span>
                            </div>
                            <div className="min-w-0">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                                    Fecha del Turno
                                </span>
                                <p className="text-xs sm:text-sm font-bold text-foreground capitalize truncate">
                                    {formattedSelectedDate}
                                </p>
                            </div>
                        </div>

                        <div className="text-right shrink-0">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                                Turno Seleccionado
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-role-dev bg-accent px-2.5 py-1 rounded-full border border-border-strong shadow-2xs mt-0.5">
                                <Clock className="w-3 h-3 text-primary" />
                                {selectedSlot} HS (30 min)
                            </span>
                        </div>
                    </div>

                    {/* Grilla de Selección: Representante y Horario */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Selector Representante Personalizado */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground-soft flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5 text-primary" />
                                <span>Representante UGD</span>
                            </label>
                            <CustomSelect
                                value={representativeId}
                                onChange={(val) => setRepresentativeId(val)}
                                options={representativeOptions}
                                placeholder="Seleccione un representante..."
                            />
                            {selectedRepresentative && (
                                <p className="text-[10px] text-muted-foreground truncate px-1">
                                    {selectedRepresentative.title || 'Personal UGD'} • {selectedRepresentative.ubicacion || 'Oficina UGD'}
                                </p>
                            )}
                        </div>

                        {/* Selector Horario Personalizado */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground-soft flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-primary" />
                                <span>Franja Horaria</span>
                            </label>
                            <CustomSelect
                                value={selectedSlot}
                                onChange={(val) => setSelectedSlot(val)}
                                options={slotOptions}
                                placeholder="Seleccione horario..."
                            />
                            <p className="text-[10px] text-muted-foreground truncate px-1 font-mono">
                                Intervalo de atención: 30 minutos
                            </p>
                        </div>
                    </div>

                    {/* Campo Motivo / Consulta con Tags Frecuentes */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-foreground-soft flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-primary" />
                                <span>Motivo de la Cita / Consulta</span>
                            </label>
                            <span className="text-[10px] text-muted-subtle font-mono">
                                {materia.length}/200
                            </span>
                        </div>
                        <textarea
                            value={materia}
                            onChange={(e) => setMateria(e.target.value)}
                            maxLength={200}
                            placeholder="Describa brevemente el motivo o trámite doctoral..."
                            className="w-full bg-card border border-border rounded-xl p-3 text-xs sm:text-sm resize-none outline-none focus:border-primary-focus focus:ring-2 focus:ring-primary/15 placeholder:text-muted-subtle h-20 text-foreground transition-all shadow-2xs leading-relaxed"
                        />

                        {/* Plantillas Frecuentes */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1 mr-0.5">
                                <Sparkles className="w-3 h-3 text-primary" />
                                Sugerencias:
                            </span>
                            {SUGGESTED_TOPICS.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => setMateria(tag)}
                                    className="text-[10px] font-medium bg-surface-subtle hover:bg-surface-hover border border-border hover:border-border-strong text-foreground-soft hover:text-foreground px-2.5 py-1 rounded-lg transition-colors cursor-pointer active:scale-95 shadow-2xs"
                                >
                                    + {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-end gap-2.5">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-xl border-border hover:bg-surface-hover text-foreground-soft text-xs sm:text-sm cursor-pointer shadow-2xs"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSubmitting}
                            className="bg-primary-deep hover:bg-primary-deep-hover text-white font-semibold rounded-xl text-xs sm:text-sm px-5 py-2.5 flex items-center gap-2 shadow-xs cursor-pointer active:scale-[0.98] transition-all"
                        >
                            <CalendarPlus className="w-4 h-4 text-accent-hover" />
                            <span>{isSubmitting ? "Agendando..." : "Agendar Cita UGD"}</span>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
