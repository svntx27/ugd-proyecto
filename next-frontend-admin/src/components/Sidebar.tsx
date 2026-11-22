"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Calendar as CalendarIcon,
    Settings,
    LogOut,
    UserCheck,
    GraduationCap,
    ChevronLeft,
    ChevronRight,
    X,
    History
} from "lucide-react";
import { AuthService } from "@/services/auth.service";
import { useSidebarStore } from "@/store/sidebarStore";
import { getRoleMeta } from "@/lib/role-badge.helper";

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    allowedRoles: string[];
    badge?: string;
}

const navItems: NavItem[] = [
    {
        name: "Inicio",
        href: "/dashboard",
        icon: LayoutDashboard,
        allowedRoles: ["DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS", "ANALISTA_TECNICO"],
    },
    {
        name: "Calendario",
        href: "/dashboard/calendario",
        icon: CalendarIcon,
        allowedRoles: ["DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS", "ANALISTA_TECNICO"],
    },
    {
        name: "Historial de Citas",
        href: "/dashboard/historial-citas",
        icon: History,
        allowedRoles: ["DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS", "ANALISTA_TECNICO"],
    },
    {
        name: "Representantes",
        href: "/dashboard/representantes",
        icon: UserCheck,
        allowedRoles: ["DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS", "ANALISTA_TECNICO"],
    },
    {
        name: "Usuarios",
        href: "/dashboard/usuarios",
        icon: Users,
        allowedRoles: ["DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS"],
    },
    {
        name: "Ajustes",
        href: "/dashboard/ajustes",
        icon: Settings,
        allowedRoles: ["DESARROLLADOR", "DIRECTOR"],
    },
];

interface SidebarProps {
    initialRole?: string;
}

export function Sidebar({ initialRole = "" }: SidebarProps) {
    const pathname = usePathname();
    const [userRole, setUserRole] = useState(initialRole);
    const [userName, setUserName] = useState("Administrador");
    const [mounted, setMounted] = useState(false);

    const { isMobileOpen, setMobileOpen, isCollapsed, toggleCollapse } = useSidebarStore();

    useEffect(() => {
        setMounted(true);
        const current = AuthService.getCurrentUser();
        if (current?.role_code) {
            setUserRole(current.role_code);
        }
        if (current?.full_name) {
            setUserName(current.full_name);
        }
    }, []);

    // Bloquear scroll de fondo cuando el menú lateral está activo en responsive
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = "hidden";
            document.documentElement.style.overflow = "hidden";
            document.body.style.touchAction = "none";
        } else {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
            document.body.style.touchAction = "";
        }
        return () => {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
            document.body.style.touchAction = "";
        };
    }, [isMobileOpen]);

    // Cerrar menú móvil al navegar a otra página
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname, setMobileOpen]);

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        AuthService.logout();
    };

    const effectiveRole = mounted ? (userRole || initialRole) : initialRole;

    const visibleNavItems = effectiveRole
        ? navItems.filter((item) => item.allowedRoles.includes(effectiveRole))
        : navItems;

    const roleMeta = getRoleMeta(effectiveRole);

    return (
        <>
            {/* Mobile / Tablet Backdrop Overlay */}
            {isMobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    onTouchMove={(e) => e.preventDefault()}
                    className="fixed inset-0 bg-foreground/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out shadow-[2px_0_16px_-4px_rgba(27,38,32,0.05)]
                ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                w-full sm:w-80 ${isCollapsed ? "lg:w-20" : "lg:w-64"}
                `}
            >
                {/* Brand Header */}
                <div className={`flex items-center justify-between px-5 sm:px-4 py-5 border-b border-border-subtle ${isCollapsed ? "lg:justify-center lg:px-2" : ""}`}>
                    <Link
                        href="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 group focus:outline-none relative ${isCollapsed ? "lg:justify-center" : ""}`}
                    >
                        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs border border-primary-hover shrink-0 transition-transform group-hover:scale-105">
                            <GraduationCap className="w-5 h-5 text-gold" strokeWidth={2.2} />
                        </div>
                        <div className={`flex flex-col transition-opacity duration-200 ${isCollapsed ? "lg:hidden" : ""}`}>
                            <span className="font-bold text-foreground text-sm tracking-tight flex items-center gap-1.5">
                                UGD Admin
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gold text-white shadow-2xs tracking-wide">
                                    UCE
                                </span>
                            </span>
                            <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[160px]">
                                Gestión de Doctorados
                            </span>
                        </div>

                        {/* Tooltip flotante en modo colapsado para escritorio */}
                        {isCollapsed && (
                            <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 bg-foreground text-card text-xs font-medium rounded-lg whitespace-nowrap shadow-lg z-50 pointer-events-none items-center border border-foreground-soft animate-in fade-in-0 zoom-in-95 duration-150">
                                UGD Admin — UCE
                            </div>
                        )}
                    </Link>

                    {/* Mobile / Tablet Close Button */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="p-2 -mr-1 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors lg:hidden cursor-pointer"
                        title="Cerrar menú"
                        aria-label="Cerrar menú"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className={`flex-1 px-4 sm:px-3 py-4 space-y-1 sm:space-y-1.5 ${isCollapsed ? "lg:overflow-visible lg:px-2.5 overflow-y-auto no-scrollbar" : "overflow-y-auto no-scrollbar lg:px-3"}`}>
                    {visibleNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3.5 sm:gap-3 px-3.5 sm:px-3 py-3 sm:py-2.5 rounded-xl text-base sm:text-sm font-medium transition-all duration-150 group relative
                                ${isActive
                                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                    : "text-foreground-soft hover:text-foreground hover:bg-surface-hover"
                                }
                                ${isCollapsed ? "lg:justify-center lg:px-0 lg:py-2.5" : ""}
                                `}
                            >
                                <div
                                    className={`p-1.5 rounded-lg transition-colors shrink-0
                                    ${isActive
                                        ? "text-primary-foreground"
                                        : "text-muted-foreground group-hover:text-foreground"
                                    }`}
                                >
                                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                                </div>

                                <span className={`truncate transition-opacity duration-200 ${isCollapsed ? "lg:hidden" : ""}`}>
                                    {item.name}
                                </span>

                                {isActive && !isCollapsed && (
                                    <span className="ml-auto w-1.5 h-4 rounded-full bg-gold hidden sm:block shadow-2xs" />
                                )}

                                {/* Tooltip flotante en modo colapsado para escritorio */}
                                {isCollapsed && (
                                    <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 bg-foreground text-card text-xs font-medium rounded-lg whitespace-nowrap shadow-lg z-50 pointer-events-none items-center border border-foreground-soft animate-in fade-in-0 zoom-in-95 duration-150">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Desktop Collapse / Expand Toggle */}
                <div className={`hidden lg:flex px-3 py-2 border-t border-border-subtle ${isCollapsed ? "justify-center px-1" : ""}`}>
                    <button
                        onClick={toggleCollapse}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer group relative
                        ${isCollapsed ? "justify-center px-1" : ""}
                        `}
                        title={isCollapsed ? "Expandir menú" : "Contraer menú"}
                        aria-label={isCollapsed ? "Expandir menú" : "Contraer menú"}
                    >
                        {isCollapsed ? (
                            <>
                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                                <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 bg-foreground text-card text-xs font-medium rounded-lg whitespace-nowrap shadow-lg z-50 pointer-events-none items-center border border-foreground-soft animate-in fade-in-0 zoom-in-95 duration-150">
                                    Expandir menú
                                </div>
                            </>
                        ) : (
                            <>
                                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                                <span>Contraer menú</span>
                            </>
                        )}
                    </button>
                </div>

                {/* User Info & Logout Footer */}
                <div className={`p-4 sm:p-3 border-t border-border-subtle bg-surface-subtle/80 mt-auto ${isCollapsed ? "lg:p-2" : ""}`}>
                    <div
                        className={`relative overflow-hidden flex items-center gap-3 p-2.5 sm:p-2 rounded-xl bg-card border border-border shadow-2xs transition-all ${
                            isCollapsed
                                ? "lg:justify-center lg:p-1.5 lg:bg-transparent lg:border-transparent lg:shadow-none"
                                : ""
                        }`}
                    >
                        {/* Patrón ornamental de enrejado de balcón metálico / forja arquitectónica (SVG ligero, estética clásica y bajo costo computacional) */}
                        {!isCollapsed && (
                            <svg
                                className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07] dark:opacity-[0.12] text-foreground"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <defs>
                                    <pattern
                                        id="balcony-ironwork-pattern"
                                        width="32"
                                        height="32"
                                        patternUnits="userSpaceOnUse"
                                    >
                                        {/* Celosía / Rombo principal de forja */}
                                        <path
                                            d="M 16 0 L 32 16 L 16 32 L 0 16 Z"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="0.75"
                                        />
                                        {/* Volutas entrelazadas de balcón metálico */}
                                        <path
                                            d="M 0 16 C 8 10, 8 22, 16 16 C 24 10, 24 22, 32 16"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="0.6"
                                        />
                                        <path
                                            d="M 16 0 C 10 8, 22 8, 16 16 C 10 24, 22 24, 16 32"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="0.6"
                                        />
                                        {/* Medallón central ornamental */}
                                        <circle
                                            cx="16"
                                            cy="16"
                                            r="3.5"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="0.7"
                                        />
                                        {/* Remaches de forja en intersecciones */}
                                        <circle cx="16" cy="16" r="1.1" fill="currentColor" />
                                        <circle cx="0" cy="16" r="0.9" fill="currentColor" />
                                        <circle cx="32" cy="16" r="0.9" fill="currentColor" />
                                        <circle cx="16" cy="0" r="0.9" fill="currentColor" />
                                        <circle cx="16" cy="32" r="0.9" fill="currentColor" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#balcony-ironwork-pattern)" />
                            </svg>
                        )}

                        <div
                            className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 relative z-10 shadow-2xs"
                            title={userName}
                        >
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className={`flex flex-col min-w-0 transition-opacity duration-200 relative z-10 ${isCollapsed ? "lg:hidden" : ""}`}>
                            <span className="text-xs font-semibold text-foreground truncate">
                                {userName}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${roleMeta.dotClass} shrink-0 animate-pulse`} />
                                <span className="text-[10px] text-muted-foreground font-medium truncate">
                                    {roleMeta.label}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className={`mt-2.5 sm:mt-2 w-full flex items-center gap-2 px-3.5 sm:px-3 py-2.5 sm:py-2 rounded-xl text-sm sm:text-xs font-medium text-muted-foreground hover:text-destructive-text hover:bg-destructive-bg hover:border-destructive-border transition-colors cursor-pointer group relative
                        ${isCollapsed ? "lg:justify-center lg:px-1" : ""}
                        `}
                        title="Cerrar sesión"
                        aria-label="Cerrar sesión"
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span className={`truncate ${isCollapsed ? "lg:hidden" : ""}`}>
                            Cerrar Sesión
                        </span>
                        {isCollapsed && (
                            <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 bg-foreground text-card text-xs font-medium rounded-lg whitespace-nowrap shadow-lg z-50 pointer-events-none items-center border border-foreground-soft animate-in fade-in-0 zoom-in-95 duration-150">
                                Cerrar Sesión
                            </div>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}
