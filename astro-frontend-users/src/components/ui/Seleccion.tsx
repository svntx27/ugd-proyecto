/**
 * Desplegable propio con el estilo del portal (reemplaza al <select> nativo).
 * Accesible: rol listbox, flechas para moverse, Enter/Espacio para elegir, Escape para cerrar.
 */
import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface OpcionSeleccion {
    valor: string;
    etiqueta: string;
    /** Texto secundario opcional bajo la etiqueta. */
    detalle?: string;
}

interface SeleccionProps {
    id?: string;
    opciones: OpcionSeleccion[];
    valor: string;
    onChange: (valor: string) => void;
    placeholder?: string;
}

export const Seleccion: React.FC<SeleccionProps> = ({ id, opciones, valor, onChange, placeholder = 'Selecciona una opción' }) => {
    const [abierto, setAbierto] = useState(false);
    const [activo, setActivo] = useState(0);
    const contenedor = useRef<HTMLDivElement>(null);
    const lista = useRef<HTMLUListElement>(null);
    const idLista = useId();
    const seleccionada = opciones.find((o) => o.valor === valor);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        if (!abierto) return;
        const fuera = (e: MouseEvent) => !contenedor.current?.contains(e.target as Node) && setAbierto(false);
        document.addEventListener('mousedown', fuera);
        return () => document.removeEventListener('mousedown', fuera);
    }, [abierto]);

    // Mantener visible la opción activa al moverse con el teclado
    useEffect(() => {
        if (abierto) lista.current?.children[activo]?.scrollIntoView({ block: 'nearest' });
    }, [abierto, activo]);

    const abrir = () => {
        setActivo(Math.max(0, opciones.findIndex((o) => o.valor === valor)));
        setAbierto(true);
    };

    const elegir = (i: number) => {
        onChange(opciones[i].valor);
        setAbierto(false);
    };

    const teclado = (e: React.KeyboardEvent) => {
        if (!abierto) {
            if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
                e.preventDefault();
                abrir();
            }
            return;
        }
        if (e.key === 'ArrowDown') setActivo((i) => Math.min(opciones.length - 1, i + 1));
        else if (e.key === 'ArrowUp') setActivo((i) => Math.max(0, i - 1));
        else if (e.key === 'Home') setActivo(0);
        else if (e.key === 'End') setActivo(opciones.length - 1);
        else if (e.key === 'Enter' || e.key === ' ') elegir(activo);
        else if (e.key === 'Escape' || e.key === 'Tab') return setAbierto(false);
        else return;
        e.preventDefault();
    };

    return (
        <div ref={contenedor} className={`relative ${abierto ? 'z-50' : ''}`}>
            <button
                id={id}
                type="button"
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={abierto}
                aria-controls={idLista}
                aria-activedescendant={abierto ? `${idLista}-${activo}` : undefined}
                onClick={() => (abierto ? setAbierto(false) : abrir())}
                onKeyDown={teclado}
                className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border bg-surface-subtle px-4 py-3.5 text-left text-sm transition-all focus:outline-none focus:ring-2 focus:ring-gold/25 ${
                    abierto ? 'border-primary bg-surface ring-2 ring-gold/25' : 'border-border hover:border-primary/60'
                }`}
            >
                <span className={seleccionada ? 'text-text-main' : 'text-muted'}>{seleccionada?.etiqueta || placeholder}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition-transform ${abierto ? 'rotate-180' : ''}`} />
            </button>

            {abierto && (
                <ul
                    ref={lista}
                    id={idLista}
                    role="listbox"
                    className="absolute left-0 z-50 mt-2 max-h-80 w-max min-w-full max-w-[min(30rem,calc(100vw-2rem))] overflow-auto rounded-xl border border-border bg-surface py-1.5 shadow-lg"
                >
                    {opciones.map((opcion, i) => {
                        const elegida = opcion.valor === valor;
                        return (
                            <li
                                key={opcion.valor}
                                id={`${idLista}-${i}`}
                                role="option"
                                aria-selected={elegida}
                                onMouseEnter={() => setActivo(i)}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => elegir(i)}
                                className={`mx-1.5 flex cursor-pointer items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-sm ${
                                    i === activo ? 'bg-surface-subtle' : ''
                                } ${elegida ? 'font-medium text-primary' : 'text-text-body'}`}
                            >
                                <span>
                                    {opcion.etiqueta}
                                    {opcion.detalle && <span className="mt-0.5 block text-xs font-normal text-muted">{opcion.detalle}</span>}
                                </span>
                                {elegida && <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-text" />}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};
