/**
 * Campo de fecha con calendario de mes propio (reemplaza al <input type="date"> nativo).
 * Funciona igual que el nativo: abre un mes, solo deja elegir días permitidos y tiene "Borrar" y "Hoy".
 * Los días fuera del rango o no laborables se ven deshabilitados.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarioFechaProps {
    id?: string;
    /** Fecha elegida en formato YYYY-MM-DD ('' si no hay). */
    valor: string;
    onChange: (fecha: string) => void;
    /** Primer y último día permitidos (YYYY-MM-DD). */
    minimo: string;
    maximo: string;
    /** Indica si un día se puede elegir además del rango (por ejemplo, solo lunes a viernes). */
    esLaborable?: (fecha: Date) => boolean;
}

const DIAS = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];
const aTexto = (d: Date) => d.toISOString().split('T')[0];
const desdeTexto = (t: string) => new Date(`${t}T00:00:00Z`);
const formatoCampo = (t: string) => (t ? t.split('-').reverse().join('/') : '');

export const CalendarioFecha: React.FC<CalendarioFechaProps> = ({ id, valor, onChange, minimo, maximo, esLaborable = () => true }) => {
    const [abierto, setAbierto] = useState(false);
    const [mes, setMes] = useState(() => {
        const base = desdeTexto(valor || minimo);
        return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), 1));
    });
    const contenedor = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!abierto) return;
        const fuera = (e: MouseEvent) => !contenedor.current?.contains(e.target as Node) && setAbierto(false);
        const escape = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false);
        document.addEventListener('mousedown', fuera);
        document.addEventListener('keydown', escape);
        return () => {
            document.removeEventListener('mousedown', fuera);
            document.removeEventListener('keydown', escape);
        };
    }, [abierto]);

    const permitido = (t: string) => t >= minimo && t <= maximo && esLaborable(desdeTexto(t));

    // Celdas del mes: empieza en lunes, incluye días del mes anterior/siguiente para completar semanas
    const inicio = new Date(mes);
    inicio.setUTCDate(1 - ((mes.getUTCDay() + 6) % 7));
    const celdas = Array.from({ length: 42 }, (_, i) => {
        const d = new Date(inicio);
        d.setUTCDate(inicio.getUTCDate() + i);
        return d;
    });

    const mesAnterior = new Date(Date.UTC(mes.getUTCFullYear(), mes.getUTCMonth() - 1, 1));
    const mesSiguiente = new Date(Date.UTC(mes.getUTCFullYear(), mes.getUTCMonth() + 1, 1));
    const puedeRetroceder = aTexto(new Date(Date.UTC(mes.getUTCFullYear(), mes.getUTCMonth(), 0))) >= minimo;
    const puedeAvanzar = aTexto(mesSiguiente) <= maximo;
    const tituloMes = mes.toLocaleDateString('es-EC', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    const titulo = tituloMes.charAt(0).toUpperCase() + tituloMes.slice(1);

    const elegir = (t: string) => {
        onChange(t);
        setAbierto(false);
    };

    return (
        <div ref={contenedor} className={`relative ${abierto ? 'z-50' : ''}`}>
            <button
                id={id}
                type="button"
                aria-haspopup="dialog"
                aria-expanded={abierto}
                onClick={() => setAbierto((a) => !a)}
                className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border bg-surface-subtle px-4 py-3.5 text-left text-sm tabular-nums transition-all focus:outline-none focus:ring-2 focus:ring-gold/25 ${
                    abierto ? 'border-primary bg-surface ring-2 ring-gold/25' : 'border-border hover:border-primary/60'
                }`}
            >
                <span className={valor ? 'text-text-main' : 'text-muted'}>{valor ? formatoCampo(valor) : 'dd/mm/aaaa'}</span>
                <Calendar className="h-4 w-4 shrink-0 text-muted" />
            </button>

            {abierto && (
                <div role="dialog" aria-label="Elegir fecha" className="absolute left-0 z-50 mt-2 w-72 rounded-xl border border-border bg-surface p-4 shadow-lg">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="font-serif text-base text-text-main">{titulo}</p>
                        <div className="flex gap-1">
                            <button
                                type="button"
                                aria-label="Mes anterior"
                                disabled={!puedeRetroceder}
                                onClick={() => setMes(mesAnterior)}
                                className="cursor-pointer rounded-md p-1.5 text-text-body hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                aria-label="Mes siguiente"
                                disabled={!puedeAvanzar}
                                onClick={() => setMes(mesSiguiente)}
                                className="cursor-pointer rounded-md p-1.5 text-text-body hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                        {DIAS.map((d) => (
                            <span key={d} className="py-1 text-[10px] font-semibold tracking-wide text-muted">
                                {d}
                            </span>
                        ))}
                        {celdas.map((d) => {
                            const t = aTexto(d);
                            const delMes = d.getUTCMonth() === mes.getUTCMonth();
                            const habilitado = permitido(t);
                            const elegido = t === valor;
                            const esHoy = t === minimo;
                            return (
                                <button
                                    key={t}
                                    type="button"
                                    disabled={!habilitado}
                                    onClick={() => elegir(t)}
                                    aria-label={d.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })}
                                    aria-pressed={elegido}
                                    className={`relative flex h-9 cursor-pointer items-center justify-center rounded-lg text-sm tabular-nums transition-colors disabled:cursor-not-allowed ${
                                        elegido
                                            ? 'bg-primary font-semibold text-primary-foreground'
                                            : habilitado
                                              ? 'font-medium text-text-main hover:bg-gold-light'
                                              : delMes
                                                ? 'text-muted-foreground/60'
                                                : 'text-muted-foreground/30'
                                    }`}
                                >
                                    {d.getUTCDate()}
                                    {esHoy && !elegido && <span aria-hidden className="absolute bottom-1 h-1 w-1 rounded-full bg-gold" />}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3 text-sm">
                        <button type="button" onClick={() => elegir('')} className="cursor-pointer font-medium text-muted hover:text-primary">
                            Borrar
                        </button>
                        <button
                            type="button"
                            disabled={!permitido(minimo)}
                            onClick={() => elegir(minimo)}
                            className="cursor-pointer font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground"
                        >
                            Hoy
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
