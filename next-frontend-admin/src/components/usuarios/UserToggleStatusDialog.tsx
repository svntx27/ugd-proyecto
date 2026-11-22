"use client";

import React from "react";
import { UserX, UserCheck, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User } from "@/services/user.service";
import { getRoleMeta } from "@/lib/role-badge.helper";

interface UserToggleStatusDialogProps {
    user: User | null;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    isSubmitting: boolean;
    getUserRoleCode: (u: User) => string;
}

export function UserToggleStatusDialog({
    user,
    onClose,
    onConfirm,
    isSubmitting,
    getUserRoleCode,
}: UserToggleStatusDialogProps) {
    if (!user) return null;

    const isActive = user.estado === "activo" || user.isActive === true;
    const roleCode = getUserRoleCode(user);
    const roleMeta = getRoleMeta(roleCode);

    return (
        <Dialog open={!!user} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
            <DialogContent className="sm:max-w-md bg-card border border-border rounded-3xl p-5 sm:p-7 shadow-2xl">
                <DialogHeader className="space-y-3 pb-2 border-b border-border-subtle">
                    <div className="flex items-center gap-3">
                        <div
                            className={`p-2.5 sm:p-3 rounded-2xl border shadow-2xs shrink-0 ${
                                isActive
                                    ? "bg-destructive-bg border-destructive-border text-destructive"
                                    : "bg-accent border-border-strong text-accent-foreground"
                            }`}
                        >
                            {isActive ? (
                                <UserX className="w-5 h-5 sm:w-6 sm:h-6" />
                            ) : (
                                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                        </div>
                        <div>
                            <DialogTitle className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                                {isActive ? "Inhabilitar Cuenta de Usuario" : "Activar Cuenta de Usuario"}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                Confirma el cambio de privilegios de acceso para esta cuenta.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-3 space-y-3">
                    <div className="bg-white border border-border rounded-2xl p-4 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                            Usuario Seleccionado
                        </span>
                        <p className="text-sm sm:text-base font-bold text-foreground">
                            {user.full_name || user.name || "Usuario"}
                        </p>
                        <p className="text-xs text-foreground-muted font-mono">{user.email}</p>
                        <div className="pt-1">
                            <span className="text-[11px] font-medium text-foreground-soft bg-surface-hover px-2 py-0.5 rounded border border-border">
                                Rol: {roleMeta.shortLabel}
                            </span>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {isActive
                            ? "Al inhabilitar la cuenta, el usuario no podrá iniciar sesión ni agendar turnos hasta que sea reactivado por un administrador."
                            : "Al activar la cuenta, el usuario recuperará el acceso inmediato a la plataforma y sus trámites."}
                    </p>
                </div>

                <DialogFooter className="gap-2 pt-2 border-t border-border-subtle flex-col sm:flex-row">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-xl border-border hover:bg-surface-subtle text-xs font-medium w-full sm:w-auto"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className={`font-medium rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs w-full sm:w-auto ${
                            isActive
                                ? "bg-destructive hover:bg-destructive-hover text-white"
                                : "bg-primary hover:bg-primary-hover text-white"
                        }`}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Procesando...
                            </>
                        ) : isActive ? (
                            <>
                                <UserX className="w-3.5 h-3.5" /> Inhabilitar Cuenta
                            </>
                        ) : (
                            <>
                                <UserCheck className="w-3.5 h-3.5" /> Activar Cuenta
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
