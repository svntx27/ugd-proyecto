import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    ChevronRight,
    LayoutDashboard,
    User as UserIcon,
    GraduationCap,
    FileSignature,
    Calendar,
    CalendarPlus,
    Compass,
    LogOut,
    UserCheck,
} from 'lucide-react';
import { MENU_PANEL, type SeccionPanel } from '../../lib/panel-nav';
import type { User } from '../../types';

interface FullscreenNavMenuProps {
    isOpen: boolean;
    onClose: () => void;
    currentPath: string;
    triggerRef?: React.RefObject<HTMLButtonElement | null>;
    user?: User | null;
    onLogout?: () => void;
}

const ICONOS_SECCION: Record<SeccionPanel, React.ComponentType<{ className?: string }>> = {
    resumen: LayoutDashboard,
    datos: UserIcon,
    formacion: GraduationCap,
    contrato: FileSignature,
    citas: Calendar,
    agendar: CalendarPlus,
};

const DESCRIPCIONES_SECCION: Record<SeccionPanel, string> = {
    resumen: 'Estado general del doctorado, alertas y resumen',
    datos: 'Información personal, contacto y filiación',
    formacion: 'Títulos de tercer y cuarto nivel registrados',
    contrato: 'Contrato, adendas, convenios y devengamiento',
    citas: 'Citas programadas y estado de atención',
    agendar: 'Reserva de turnos presenciales con la UGD',
};

export const FullscreenNavMenu: React.FC<FullscreenNavMenuProps> = ({
    isOpen,
    onClose,
    currentPath,
    triggerRef,
    user,
    onLogout,
}) => {
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Bloqueo y restauración del scroll
    const unlockScroll = () => {
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
    };

    const lockScroll = () => {
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
    };

    useEffect(() => {
        if (isOpen) {
            lockScroll();
            setIsAnimatingOut(false);
        } else {
            unlockScroll();
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            unlockScroll();
            setIsAnimatingOut(false);
            onClose();
            triggerRef?.current?.focus();
        }, 220);
    };

    const handleItemClick = () => {
        unlockScroll();
        setIsAnimatingOut(false);
        onClose();
    };

    // Cerrar con Escape y atrapar el foco dentro del diálogo accesible
    useEffect(() => {
        if (!isOpen) return;

        const focusTimer = setTimeout(() => {
            closeButtonRef.current?.focus();
        }, 60);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                handleClose();
                return;
            }

            if (e.key === 'Tab' && modalRef.current) {
                const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusableElements.length === 0) return;

                const first = focusableElements[0];
                const last = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            clearTimeout(focusTimer);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    // Restauración de scroll en redimensionamiento (> 1024px) y navegación Astro ViewTransitions
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024 && isOpen) {
                unlockScroll();
                setIsAnimatingOut(false);
                onClose();
            }
        };

        window.addEventListener('resize', handleResize);
        document.addEventListener('astro:before-swap', unlockScroll);
        document.addEventListener('astro:page-load', unlockScroll);

        return () => {
            unlockScroll();
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('astro:before-swap', unlockScroll);
            document.removeEventListener('astro:page-load', unlockScroll);
        };
    }, [isOpen]);

    if (!isMounted || !isOpen) return null;

    // Normalizar ruta actual para destacar el enlace activo
    const normalizedPath = currentPath.replace(/\/$/, '') || '/';

    return createPortal(
        <div
            id="mobile-fullscreen-nav"
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación del portal"
            className={`fixed inset-0 z-[100] w-screen h-[100dvh] max-h-[100dvh] bg-surface flex flex-col overflow-hidden transition-all duration-250 ease-out ${
                isAnimatingOut
                    ? 'opacity-0 translate-y-3 pointer-events-none'
                    : 'opacity-100 translate-y-0'
            }`}
        >
            {/* Cabecera institucional a pantalla completa */}
            <header className="h-20 border-b border-border-subtle px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 bg-surface/95 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <a href="/" onClick={handleItemClick} className="group flex items-center gap-2">
                        <span className="text-2xl font-serif font-bold text-primary tracking-tight group-hover:opacity-75 transition-opacity">
                            UGD
                        </span>
                    </a>
                    <div className="h-6 w-px bg-border-subtle"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-text">
                            Portal del Estudiante
                        </span>
                        <span className="text-xs text-muted font-medium truncate max-w-[200px] sm:max-w-none">
                            Unidad de Gestión de Doctorados
                        </span>
                    </div>
                </div>

                <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={handleClose}
                    aria-label="Cerrar menú de navegación"
                    className="group p-2 rounded-lg text-text-main hover:text-primary hover:bg-surface-subtle/60 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/30"
                >
                    <X className="h-6 w-6 stroke-[1.75] group-hover:rotate-90 transition-transform duration-200" />
                </button>
            </header>

            {/* Área principal desplazable del menú */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 max-w-2xl mx-auto w-full">
                {/* Perfil del usuario activo en vista móvil */}
                {user && (
                    <div className="rounded-xl border border-border bg-surface-subtle/80 p-4 flex items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm shrink-0">
                                {user.full_name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-text-main truncate">
                                    {user.full_name}
                                </p>
                                <p className="text-xs text-muted truncate">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gold-light text-gold-text border border-gold-border/60">
                            <UserCheck className="w-3 h-3 text-gold" />
                            Doctorando
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    <h2 className="font-serif text-2xl sm:text-3xl font-normal text-text-main">
                        Navegación del Expediente
                    </h2>
                    <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                        Selecciona una sección para gestionar tu expediente doctoral o acceder a tus servicios presenciales.
                    </p>
                </div>

                <nav aria-label="Secciones del panel móvil" className="space-y-6">
                    {MENU_PANEL.map((grupo) => (
                        <div key={grupo.grupo} className="space-y-3">
                            <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
                                    {grupo.grupo}
                                </h3>
                            </div>

                            <ul className="space-y-2.5">
                                {grupo.items.map((item) => {
                                    const itemNormalized = item.href.replace(/\/$/, '') || '/';
                                    const isActive = normalizedPath === itemNormalized;
                                    const ItemIcon = ICONOS_SECCION[item.id] || Compass;
                                    const descripcion = DESCRIPCIONES_SECCION[item.id];

                                    return (
                                        <li key={item.id}>
                                            <a
                                                href={item.href}
                                                data-astro-prefetch="load"
                                                onClick={handleItemClick}
                                                aria-current={isActive ? 'page' : undefined}
                                                className={`group flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                                                    isActive
                                                        ? 'border-gold bg-gold-light/80 text-primary shadow-xs ring-1 ring-gold/40'
                                                        : 'border-border bg-surface hover:border-gold/50 hover:bg-surface-subtle text-text-body hover:text-primary'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    <div
                                                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                                            isActive
                                                                ? 'bg-gold/20 text-gold-text border border-gold-border/60'
                                                                : 'bg-surface-muted text-muted group-hover:text-primary group-hover:bg-gold-light/40 border border-border-subtle'
                                                        }`}
                                                    >
                                                        <ItemIcon className="w-5 h-5" />
                                                    </div>
                                                    <div className="min-w-0 text-left">
                                                        <p
                                                            className={`text-sm sm:text-base ${
                                                                isActive
                                                                    ? 'font-semibold text-primary'
                                                                    : 'font-medium text-text-main group-hover:text-primary'
                                                            }`}
                                                        >
                                                            {item.label}
                                                        </p>
                                                        {descripcion && (
                                                            <p className="text-xs text-muted font-light truncate mt-0.5">
                                                                {descripcion}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0 ml-3">
                                                    {isActive ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gold/20 text-gold-text border border-gold-border">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></span>
                                                            Actual
                                                        </span>
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 text-muted/60 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                                    )}
                                                </div>
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Opción de cerrar sesión en móvil */}
                {user && onLogout && (
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                handleItemClick();
                                onLogout();
                            }}
                            className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl border border-border bg-surface hover:bg-status-danger-bg hover:border-status-danger-border text-muted hover:text-status-danger transition-all duration-200 cursor-pointer text-sm font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Cerrar sesión de forma segura</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Pie institucional */}
            <footer className="border-t border-border-subtle py-3.5 px-4 sm:px-6 lg:px-8 shrink-0 bg-surface-subtle/60 text-xs text-muted flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                <p className="font-light">
                    &copy; {new Date().getFullYear()} Universidad Central del Ecuador &bull; UGD
                </p>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-muted">
                    <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface font-mono text-[10px] text-text-main shadow-2xs">
                        Esc
                    </kbd>{' '}
                    para cerrar
                </span>
            </footer>
        </div>,
        document.body
    );
};
