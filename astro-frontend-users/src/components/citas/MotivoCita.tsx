/** Motivos de cita según el rol del representante; "Otro motivo" permite escribirlo. */
import React, { useState } from 'react';
import { MOTIVOS_POR_ROL, OTRO_MOTIVO, rolDeRepresentante } from '../../lib/motivos-cita';
import type { Representative } from '../../types';
import { Seleccion } from '../ui/Seleccion';

interface MotivoCitaProps {
    representante: Representative & { roleCode?: string | null };
    onChange: (motivo: string) => void;
}

export const MotivoCita: React.FC<MotivoCitaProps> = ({ representante, onChange }) => {
    const opciones = [
        ...MOTIVOS_POR_ROL[rolDeRepresentante(representante)].map((m) => ({ valor: m, etiqueta: m })),
        { valor: OTRO_MOTIVO, etiqueta: 'Otro motivo', detalle: 'Escríbelo con tus palabras' },
    ];
    const [seleccion, setSeleccion] = useState('');
    const [otro, setOtro] = useState('');

    const elegir = (valor: string) => {
        setSeleccion(valor);
        onChange(valor === OTRO_MOTIVO ? otro.trim() : valor);
    };

    return (
        <div className="space-y-3">
            <Seleccion id="motivo" opciones={opciones} valor={seleccion} onChange={elegir} placeholder="Selecciona el motivo de tu cita" />

            {seleccion === OTRO_MOTIVO && (
                <input
                    id="motivo-otro"
                    type="text"
                    value={otro}
                    onChange={(e) => {
                        setOtro(e.target.value);
                        onChange(e.target.value.trim());
                    }}
                    maxLength={200}
                    placeholder="Describe brevemente el motivo"
                    aria-label="Describe el motivo de la cita"
                    className="w-full rounded-lg border border-border bg-surface-subtle px-4 py-3.5 text-sm text-text-main placeholder-muted transition-all focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-gold/25"
                    autoFocus
                />
            )}
        </div>
    );
};
