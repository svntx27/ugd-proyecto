/** Isla del paso 2 de la activación: contraseña con reglas en tiempo real, preloader directo y auto-login. */
import React, { useEffect, useState } from 'react';
import { Check, CheckCircle2, Lock, X } from 'lucide-react';
import { navigate } from 'astro:transitions/client';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { toast } from '../../lib/toast';
import { borrarActivacion, leerActivacion, REGLAS_PASSWORD, resumenDoctorando, type DatosActivacion } from '../../lib/activacion';
import { BotonPrincipal, Campo } from './Campo';

export const CrearContrasenaForm: React.FC = () => {
    useAuthGuard(false);
    const activateAccount = useAuthStore((s) => s.activateAccount);
    const [datos, setDatos] = useState<DatosActivacion | null>(null);
    const [password, setPassword] = useState('');
    const [confirmacion, setConfirmacion] = useState('');
    const [activando, setActivando] = useState(false);

    // Sin la verificación del paso 1 no hay nada que activar
    useEffect(() => {
        const guardados = leerActivacion();
        if (!guardados) window.location.replace('/activar');
        else setDatos(guardados);
    }, []);

    if (!datos) return null;

    const reglas = REGLAS_PASSWORD.map((r) => ({ ...r, ok: r.cumple(password) }));
    const valida = reglas.every((r) => r.ok);
    const coinciden = confirmacion.length > 0 && password === confirmacion;
    const { nombre, facultad, carrera } = resumenDoctorando(datos.doctorando);

    const volver = () => {
        borrarActivacion();
        navigate('/activar');
    };

    const activar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!valida || !coinciden) return;
        // Transición directa e instantánea al preloader institucional
        setActivando(true);
        try {
            await activateAccount(datos.cedula, datos.correo, password);
            borrarActivacion();
            window.location.replace('/');
        } catch (error: any) {
            setActivando(false);
            const status = error.response?.status;
            const res = error.response?.data;
            if (status === 409) {
                borrarActivacion();
                toast.info('Tu cuenta ya estaba activada', { description: 'Te llevamos al inicio de sesión.' });
                setTimeout(() => navigate('/login'), 1500);
            } else {
                toast.error('No se pudo activar la cuenta', { description: res?.error || 'Intenta de nuevo en unos minutos.' });
            }
        }
    };

    if (activando) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-200">
                <div className="relative mb-5 flex items-center justify-center">
                    <span className="h-12 w-12 animate-spin rounded-full border-2 border-border-subtle border-t-primary" />
                    <CheckCircle2 className="absolute h-5 w-5 text-status-success" />
                </div>
                <h2 className="font-serif text-2xl font-bold tracking-tight text-text-main">
                    Activando tu cuenta…
                </h2>
                <p className="mt-2.5 max-w-xs text-xs text-muted leading-relaxed">
                    Registrando tu clave institucional y configurando tu acceso al portal doctoral.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Barra de progreso e indicador de paso con opción de rectificación */}
            <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-medium text-muted">
                    <span className="text-sm font-semibold text-text-main">2. Creación de contraseña</span>
                    <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-status-success font-medium">✓ Identidad validada</span>
                        <span className="text-muted-foreground/40">·</span>
                        <button
                            type="button"
                            onClick={volver}
                            className="cursor-pointer text-muted underline decoration-border hover:text-primary hover:decoration-primary transition-colors"
                        >
                            ¿No eres tú?
                        </button>
                    </div>
                </div>
                <div className="flex gap-1.5 h-1">
                    <div className="flex-1 rounded-full bg-primary"></div>
                    <div className="flex-1 rounded-full bg-primary"></div>
                </div>
                <p className="text-xs text-muted">
                    Define tu clave de acceso institucional cumpliendo los requisitos de seguridad.
                </p>
            </div>

            {/* En celular el panel lateral no se ve: resumen compacto del doctorando */}
            <div className="space-y-1 rounded-xl border border-border bg-surface-subtle p-3.5 lg:hidden">
                <p className="text-[11px] uppercase tracking-wider text-muted font-medium">Doctorando identificado</p>
                <p className="font-serif text-sm font-semibold text-text-main">¡Hola, {nombre}!</p>
                {(facultad || carrera) && <p className="text-xs text-muted">{[facultad, carrera].filter(Boolean).join(' · ')}</p>}
            </div>

            <form className="space-y-4" onSubmit={activar}>
                <Campo
                    id="password"
                    type="password"
                    label="Nueva contraseña"
                    icon={Lock}
                    placeholder="Escribe tu nueva contraseña"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <ul aria-live="polite" className="space-y-1.5 rounded-xl border border-border-subtle bg-muted-bg p-4 text-xs">
                    {reglas.map((r) => (
                        <li key={r.id} className={`flex items-center gap-2 ${r.ok ? 'font-medium text-status-success' : 'text-muted'}`}>
                            {r.ok ? <Check className="h-3.5 w-3.5 shrink-0" /> : <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-muted-foreground/40" />}
                            {r.label}
                        </li>
                    ))}
                </ul>

                <div>
                    <Campo
                        id="confirmacion"
                        type="password"
                        label="Confirmar contraseña"
                        icon={Lock}
                        placeholder="Repite tu contraseña"
                        autoComplete="new-password"
                        required
                        value={confirmacion}
                        onChange={(e) => setConfirmacion(e.target.value)}
                    />
                    {confirmacion.length > 0 && (
                        <p className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${coinciden ? 'text-status-success' : 'text-status-danger'}`}>
                            {coinciden ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                            {coinciden ? 'Las contraseñas coinciden' : 'Las contraseñas aún no coinciden'}
                        </p>
                    )}
                </div>

                <div className="pt-2">
                    <BotonPrincipal disabled={!valida || !coinciden}>
                        Activar cuenta e iniciar sesión <CheckCircle2 className="h-4 w-4" />
                    </BotonPrincipal>
                </div>
            </form>
        </div>
    );
};
