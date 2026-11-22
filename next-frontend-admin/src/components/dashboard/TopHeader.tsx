"use client";

import { useEffect, useState } from "react";
import { Settings, Bell, X, Trash2, History, Menu, Calendar } from "lucide-react";
import { AuthService, AdminUser } from "@/services/auth.service";
import { useNotificationStore } from "@/store/notificationsStore";
import { useSidebarStore } from "@/store/sidebarStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";

export function TopHeader() {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [mounted, setMounted] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const { notifications, unreadCount, clearUnread, removeNotification, clearAllNotifications } = useNotificationStore();
    const { toggleMobile } = useSidebarStore();

    useEffect(() => {
        setMounted(true);
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }

        const handleOpenNotifications = () => {
            setSheetOpen(true);
            clearUnread();
        };

        window.addEventListener("ugd:open-notifications", handleOpenNotifications);
        return () => {
            window.removeEventListener("ugd:open-notifications", handleOpenNotifications);
        };
    }, [clearUnread]);

    const currentUser = mounted ? user : null;

    const getGreeting = () => {
        // Hora de Ecuador: en Vercel el servidor trabaja en UTC y getHours() daría 5 horas de más
        const hour = Number(
            new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: "America/Guayaquil" }).format(new Date())
        );
        if (hour >= 5 && hour < 12) return "Buenos días";
        if (hour >= 12 && hour < 19) return "Buenas tardes";
        return "Buenas noches";
    };

    const getInitials = (name?: string) => {
        if (!name) return "AD";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <header className="w-full flex justify-between items-center mb-6 pb-4 border-b border-border gap-3">
            <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                {/* Mobile Menu Toggle Button */}
                <button
                    onClick={toggleMobile}
                    className="p-2 -ml-1 sm:-ml-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors lg:hidden shrink-0 cursor-pointer"
                    title="Abrir menú de navegación"
                    aria-label="Abrir menú"
                >
                    <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-2xs">
                        <span suppressHydrationWarning className="text-primary font-bold text-xs sm:text-sm tracking-wider">
                            {getInitials(currentUser?.full_name)}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <h2 suppressHydrationWarning className="text-sm sm:text-base font-bold text-foreground truncate">
                            {getGreeting()}, <span className="text-primary">{currentUser ? currentUser.full_name.split(" ")[0] : "Admin"}</span>
                        </h2>
                        <p suppressHydrationWarning className="text-xs text-muted-foreground truncate mt-0.5">
                            <span className="font-medium text-foreground-soft">{currentUser?.userType || "Personal UGD"}</span>
                            <span className="text-border-strong mx-1.5">•</span>
                            <span>Universidad Central del Ecuador</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <div className="flex items-center gap-2 text-foreground-muted">
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <button className="p-2 hover:bg-surface-hover rounded-xl hover:text-foreground transition-colors outline-none cursor-pointer border border-transparent hover:border-border">
                                <Settings className="w-5 h-5 text-foreground-muted" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mt-2">
                            <DropdownMenuLabel>Accesos Rápidos</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <Link href="/dashboard/historial-citas" className="w-full flex items-center gap-2">
                                    <History className="w-4 h-4 text-muted-subtle" />
                                    Historial Global
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Link href="/dashboard/ajustes" className="w-full flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-muted-subtle" />
                                    Ajustes del Sistema
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Sheet 
                        open={sheetOpen} 
                        onOpenChange={(open: boolean) => { 
                            setSheetOpen(open); 
                            if (open) clearUnread(); 
                        }}
                    >
                        <SheetTrigger>
                            <button
                                onClick={() => setSheetOpen(true)}
                                className="p-2 hover:bg-surface-hover rounded-xl hover:text-foreground transition-colors relative cursor-pointer border border-transparent hover:border-border"
                                title="Notificaciones"
                                aria-label="Abrir historial de notificaciones"
                            >
                                <Bell className="w-5 h-5 text-foreground-muted" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                        </SheetTrigger>
                        <SheetContent className="overflow-y-auto no-scrollbar sm:max-w-md w-full p-6 flex flex-col">
                            <SheetHeader className="mb-4 shrink-0">
                                <SheetTitle className="text-foreground flex items-center gap-2">
                                    <div className="p-2 rounded-xl bg-accent/20 text-accent-text border border-accent/30">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    Historial de Notificaciones
                                </SheetTitle>
                                <SheetDescription className="text-muted-foreground">
                                    Actividad reciente del sistema de citas y doctorandos.
                                </SheetDescription>

                                {notifications.length > 0 && (
                                    <div className="flex justify-end mt-2">
                                        <button 
                                            onClick={clearAllNotifications}
                                            className="text-xs flex items-center gap-1.5 text-muted-subtle hover:text-destructive transition-colors cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Limpiar todo
                                        </button>
                                    </div>
                                )}
                            </SheetHeader>
                            <div className="space-y-3 flex-1 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="w-12 h-12 rounded-2xl bg-surface-hover flex items-center justify-center text-muted-subtle mb-3">
                                            <Bell className="w-6 h-6" />
                                        </div>
                                        <p className="text-foreground-soft font-medium text-sm">Bandeja Vacía</p>
                                        <p className="text-xs text-muted-foreground mt-1 max-w-xs">Acá aparecerán las nuevas alertas de interacción de los alumnos y citas agendadas.</p>
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div key={notif.id} className="p-4 rounded-2xl bg-surface-subtle border border-border hover:border-border-strong transition-colors relative group">
                                            <button 
                                                onClick={() => removeNotification(notif.id)}
                                                className="absolute top-3.5 right-3.5 text-muted-subtle hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity bg-card p-1 rounded-lg border border-border cursor-pointer shadow-2xs"
                                                title="Ocultar notificación"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                            <div className="flex justify-between items-start mb-2 pr-6">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-text bg-accent/15 px-2.5 py-0.5 rounded-full border border-accent/30">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                                                    Reserva Registrada
                                                </span>
                                                <span className="text-[11px] font-mono text-muted-foreground bg-card px-2 py-0.5 rounded-md border border-border">#{notif.id}</span>
                                            </div>
                                            
                                            {(notif.user_nombre || notif.usuario_nombre) && (
                                                <p className="text-xs text-foreground-muted mb-1 font-medium truncate">
                                                    Doctorando: <span className="font-semibold text-foreground">{notif.user_nombre || notif.usuario_nombre}</span>
                                                </p>
                                            )}

                                            <p className="text-xs text-foreground-soft mb-3 font-medium leading-relaxed">
                                                Materia/Trámite: <span className="font-semibold text-foreground">{notif.materia}</span>
                                            </p>

                                            <div className="text-[11px] text-foreground-muted flex flex-wrap gap-2">
                                                <span className="bg-card px-2 py-1 rounded-lg border border-border flex items-center gap-1">
                                                    <span className="text-muted-foreground">Personal:</span> {notif.lab_nombre || notif.lab_id}
                                                </span>
                                                <span className="bg-card px-2 py-1 rounded-lg border border-border flex items-center gap-1">
                                                    <span className="text-muted-foreground">Fecha:</span> 
                                                    {(() => {
                                                        try {
                                                            const parts = String(notif.fecha).split('T')[0].split('-');
                                                            return `${parts[2]}/${parts[1]}/${parts[0]}`;
                                                        } catch {
                                                            return String(notif.fecha);
                                                        }
                                                    })()}
                                                </span>
                                                <span className="bg-accent text-accent-foreground px-2 py-1 rounded-lg border border-accent-border flex items-center gap-1 font-semibold">
                                                    <span>Turno:</span> {notif.hora_inicio}
                                                </span>
                                            </div>

                                            <div className="mt-3 pt-2 border-t border-border-subtle flex justify-end">
                                                <Link
                                                    href="/dashboard/calendario"
                                                    onClick={() => setSheetOpen(false)}
                                                    className="text-[11px] font-semibold text-primary hover:text-accent-foreground flex items-center gap-1 transition-colors"
                                                >
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    Consultar en calendario
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <SheetFooter className="mt-6 pt-4 border-t border-border-subtle shrink-0">
                                <Link 
                                    href="/dashboard/historial-citas"
                                    onClick={() => setSheetOpen(false)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-accent-foreground rounded-xl transition-colors text-sm font-semibold border border-border-strong"
                                >
                                    <History className="w-4 h-4" />
                                    Buscador Global e Historial
                                </Link>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
