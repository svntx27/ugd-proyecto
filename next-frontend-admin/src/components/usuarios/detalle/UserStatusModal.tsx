"use client";

import React from "react";
import { UserCheck, UserX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

export interface UserStatusModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    isActive: boolean;
    fullName: string;
    email: string;
    toggling: boolean;
    onConfirm: () => void;
}

export function UserStatusModal({
    isOpen,
    onOpenChange,
    isActive,
    fullName,
    email,
    toggling,
    onConfirm,
}: UserStatusModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border border-border rounded-3xl p-5 sm:p-7 shadow-2xl">
                <DialogHeader className="space-y-3 pb-2 border-b border-border-subtle">
                    <div className="flex items-center gap-3">
                        <div
                            className={`p-3 rounded-2xl border shadow-2xs ${
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
                            <DialogTitle className="text-lg font-bold text-foreground">
                                {isActive ? "Inhabilitar Cuenta de Usuario" : "Activar Cuenta de Usuario"}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                Confirma la modificación de acceso para este usuario.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-3 space-y-3 text-xs text-muted-foreground">
                    <p>
                        Estás a punto de <strong>{isActive ? "inhabilitar" : "activar"}</strong> la cuenta de{" "}
                        <strong>{fullName}</strong> ({email}).
                    </p>
                    <p>
                        {isActive
                            ? "Al inhabilitarla, el usuario no podrá iniciar sesión en ninguna plataforma de la UGD hasta ser habilitado nuevamente."
                            : "Al activarla, el usuario recuperará el acceso inmediato a la plataforma y sus trámites."}
                    </p>
                </div>

                <DialogFooter className="gap-2 pt-2 border-t border-border-subtle">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={toggling}
                        className="rounded-xl border-border cursor-pointer"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={toggling}
                        className={`rounded-xl font-medium cursor-pointer ${
                            isActive
                                ? "bg-destructive hover:bg-destructive-hover text-white"
                                : "bg-primary hover:bg-primary-hover text-white"
                        }`}
                    >
                        {toggling ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isActive ? (
                            "Confirmar Inhabilitación"
                        ) : (
                            "Confirmar Activación"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
