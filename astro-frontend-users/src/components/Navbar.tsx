import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import type { User } from '../types';
import { LogOut, Menu } from 'lucide-react';
import { SessionTimer } from './SessionTimer';
import { FullscreenNavMenu } from './navigation/FullscreenNavMenu';

export interface NavbarProps {
    initialUser?: User | null;
    currentPath?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ initialUser = null, currentPath = '/' }) => {
    const storeUser = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const user = storeUser || initialUser;
    const [greeting, setGreeting] = useState('Bienvenido');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [pathname, setPathname] = useState(
        typeof window !== 'undefined' ? window.location.pathname : currentPath
    );
    const triggerButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Buenos días');
        else if (hour < 18) setGreeting('Buenas tardes');
        else setGreeting('Buenas noches');
    }, []);

    // Sincronizar ruta en transiciones cliente de Astro
    useEffect(() => {
        const updatePath = () => {
            setPathname(window.location.pathname);
        };
        updatePath();

        document.addEventListener('astro:page-load', updatePath);
        window.addEventListener('popstate', updatePath);

        return () => {
            document.removeEventListener('astro:page-load', updatePath);
            window.removeEventListener('popstate', updatePath);
        };
    }, []);

    const handleLogout = () => {
        logout();
        window.location.replace('/login');
    };

    return (
        <>
            <nav className="bg-surface/80 backdrop-blur-md sticky top-0 z-50 border-b border-border-subtle transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        {/* Logo institucional */}
                        <a href="/" className="group flex items-center gap-2">
                            <span className="text-2xl font-serif text-primary tracking-tight group-hover:opacity-70 transition-opacity font-bold">
                                UGD
                            </span>
                        </a>

                        {/* Acciones del lado derecho */}
                        {user && (
                            <div className="flex items-center gap-3 sm:gap-6">
                                <SessionTimer />

                                <div className="h-8 w-px bg-border-subtle hidden sm:block"></div>

                                <div className="text-right hidden sm:block">
                                    <p className="text-xs text-muted uppercase tracking-widest mb-0.5">
                                        {greeting},
                                    </p>
                                    <p className="text-sm font-medium text-text-main flex items-center justify-end gap-2">
                                        {user.full_name}
                                    </p>
                                </div>

                                <div className="h-8 w-px bg-border-subtle hidden sm:block"></div>

                                <button
                                    onClick={handleLogout}
                                    className="group hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-muted hover:text-primary hover:bg-surface-subtle transition-all duration-200 cursor-pointer"
                                    title="Cerrar Sesión"
                                >
                                    <span>Salir</span>
                                    <LogOut className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                </button>

                                {/* Botón Hamburguesa responsive a nivel de navbar para tablets y móviles (< lg) */}
                                <button
                                    ref={triggerButtonRef}
                                    type="button"
                                    onClick={() => setIsMenuOpen(true)}
                                    aria-label="Abrir menú de navegación"
                                    aria-expanded={isMenuOpen}
                                    aria-controls="mobile-fullscreen-nav"
                                    className="lg:hidden p-2 rounded-lg text-text-main hover:text-primary hover:bg-surface-subtle/60 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/30"
                                >
                                    <Menu className="h-6 w-6 stroke-[1.75]" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Menú a pantalla completa (100vw x 100dvh) controlado desde el Navbar */}
            {user && (
                <FullscreenNavMenu
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    currentPath={pathname}
                    triggerRef={triggerButtonRef}
                    user={user}
                    onLogout={handleLogout}
                />
            )}
        </>
    );
};
