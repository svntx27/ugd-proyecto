"use client";

import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Representative } from "@/services/appointment.service";

export interface DeleteRepresentanteDialogProps {
    isOpen: boolean;
    representative: Representative | null;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    isSubmitting: boolean;
}

export function DeleteRepresentanteDialog({
    isOpen,
    representative,
    onClose,
    onConfirm,
    isSubmitting,
}: DeleteRepresentanteDialogProps) {
    if (!representative) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
            <DialogContent className="sm:max-w-md bg-card border border-destructive-border rounded-3xl p-5 sm:p-7 shadow-2xl">
                <DialogHeader className="space-y-3 pb-2 border-b border-destructive-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 sm:p-3 rounded-2xl bg-destructive-bg border border-destructive-border text-destructive shadow-2xs shrink-0">
                            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg sm:text-xl font-bold text-destructive tracking-tight">
                                Eliminar Representante
                            </DialogTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Esta acción retirará al representante del directorio administrativo.
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-3 space-y-3">
                    <div className="bg-destructive-bg border border-destructive-border rounded-2xl p-4">
                        <p className="text-xs font-bold text-destructive-hover uppercase tracking-wider mb-1">
                            Representante a retirar
                        </p>
                        <p className="text-sm sm:text-base font-bold text-foreground">
                            {representative.nombre || representative.name}
                        </p>
                        <p className="text-xs text-foreground-muted mt-0.5">
                            {representative.title || "Personal UGD"} {representative.email && `(${representative.email})`}
                        </p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        ¿Estás seguro de continuar? Si este representante tiene citas presenciales asociadas, se mantendrán registradas para el historial, pero ya no estará disponible para nuevas asignaciones.
                    </p>
                </div>

                <DialogFooter className="gap-2 pt-2 border-t border-destructive-border flex-col sm:flex-row">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-xl border-border hover:bg-surface-subtle text-xs font-medium w-full sm:w-auto cursor-pointer"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="bg-destructive hover:bg-destructive-hover text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs w-full sm:w-auto cursor-pointer"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Eliminando...
                            </>
                        ) : (
                            "Eliminar Definitivamente"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
