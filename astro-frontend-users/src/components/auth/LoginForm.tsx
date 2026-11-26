/** Isla del formulario de inicio de sesión con transición inmediata a preloader institucional. */
import React, { useState } from 'react';
import { AlertTriangle, GraduationCap, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { toast } from '../../lib/toast';
import { BotonPrincipal, Campo } from './Campo';

export const LoginForm: React.FC<{ mantenimientoInicial?: boolean }> = ({ mantenimientoInicial = false }) => {
    useAuthGuard(false);
    const login = useAuthStore((s) => s.login);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [ingresando, setIngresando] = useState(false);
    const [mantenimiento, setMantenimiento] = useState(mantenimientoInicial);

    const enviar = async (e: React.FormEvent) => {
        e.preventDefault();
        // Transición directa e instantánea al preloader
        setIngresando(true);
        try {
            await login(email, password);
            window.location.replace('/');
        } catch (error: any) {
            // Si las credenciales fallan, se restaura el formulario y se informa con toast de error
            setIngresando(false);
            const datos = error.response?.data;
            if (error.response?.status === 503 || datos?.code === 'PLATFORM_LOCKDOWN' || String(datos?.error || '').includes('PLATFORM_LOCKDOWN')) {
                setMantenimiento(true);
            }
            toast.error('No se pudo iniciar sesión', {
                description: typeof datos?.error === 'string' ? datos.error : 'Verifica tu correo y contraseña.',
            });
        }
    };

    if (ingresando) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-200">
                <div className="relative mb-5 flex items-center justify-center">
                    <span className="h-12 w-12 animate-spin rounded-full border-2 border-border-subtle border-t-primary" />
                    <GraduationCap className="absolute h-5 w-5 text-gold" strokeWidth={2.2} />
                </div>
                <h2 className="font-serif text-2xl font-bold tracking-tight text-text-main">
                    Iniciando sesión…
                </h2>
                <p className="mt-2.5 max-w-xs text-xs text-muted leading-relaxed">
                    Comprobando credenciales y preparando tu expediente doctoral en el portal de la UGD.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-text-main">
                    Iniciar sesión
                </h1>
                <p className="mt-2 text-sm text-muted">
                    Ingresa tus credenciales institucionales para continuar
                </p>
            </div>

            {mantenimiento && (
                <div role="alert" className="flex items-start gap-3 rounded-xl border border-status-warning-border bg-status-warning-bg p-4 text-status-warning-text">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-status-warning" />
                    <div>
                        <p className="text-sm font-semibold">Portal en mantenimiento</p>
                        <p className="mt-1 text-xs leading-relaxed">
                            El acceso está suspendido temporalmente por trabajos técnicos. Por favor, intenta más tarde.
                        </p>
                    </div>
                </div>
            )}

            <form className="space-y-4" onSubmit={enviar}>
                <Campo
                    id="email"
                    type="email"
                    icon={Mail}
                    placeholder="Correo institucional"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Campo
                    id="password"
                    type="password"
                    icon={Lock}
                    placeholder="Contraseña"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <div className="pt-2">
                    <BotonPrincipal>
                        Iniciar sesión
                    </BotonPrincipal>
                </div>
            </form>

            <div className="text-center text-sm text-text-body">
                ¿Eres doctorando y aún no tienes cuenta?{' '}
                <a href="/activar" className="font-medium text-primary hover:text-primary-hover hover:underline">
                    Activa tu cuenta aquí
                </a>
            </div>
        </div>
    );
};
