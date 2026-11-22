"use client";

import React from "react";
import { LucideIcon, Loader2, AlertTriangle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface ConfirmActionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    description?: string;
    icon?: LucideIcon;
    variant?: "danger" | "primary" | "warning";
    confirmText?: string;
    cancelText?: string;
    isSubmitting?: boolean;
    loadingText?: string;
    children?: React.ReactNode;
}

export function ConfirmActionDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    icon: Icon = AlertTriangle,
    variant = "danger",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    isSubmitting = false,
    loadingText = "Procesando...",
    children,
}: ConfirmActionDialogProps) {
    const isDanger = variant === "danger";
    const isWarning = variant === "warning";

    const iconColors = isDanger
        ? "bg-destructive-bg border-destructive-border text-destructive"
        : isWarning
        ? "bg-warning-bg border-warning-border text-warning"
        : "bg-accent border-border-strong text-accent-foreground";

    const titleColor = isDanger
        ? "text-destructive"
        : isWarning
        ? "text-warning"
        : "text-foreground";

    const confirmButtonClass = isDanger
        ? "bg-destructive hover:bg-destructive-hover text-white"
        : isWarning
        ? "bg-warning hover:bg-warning/90 text-white"
        : "bg-primary hover:bg-primary-hover text-white";

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
            <DialogContent
                className={`max-w-md w-full rounded-3xl p-5 sm:p-6 ${
                    isDanger ? "border-destructive-border" : "border-border"
                }`}
            >
                <DialogHeader className="text-left pb-2">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-2xl border shadow-2xs shrink-0 ${iconColors}`}>
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <DialogTitle className={`text-lg sm:text-xl font-bold tracking-tight ${titleColor}`}>
                                {title}
                            </DialogTitle>
                            {description && (
                                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                    {description}
                                </DialogDescription>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                {children && <div className="py-3 space-y-3">{children}</div>}

                <DialogFooter
                    className={`gap-2 pt-2 border-t flex-col sm:flex-row ${
                        isDanger ? "border-destructive-border" : "border-border-subtle"
                    }`}
                >
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-xl border-border hover:bg-surface-subtle text-xs font-medium w-full sm:w-auto"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className={`font-medium rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs w-full sm:w-auto ${confirmButtonClass}`}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> {loadingText}
                            </>
                        ) : (
                            <>
                                <Icon className="w-3.5 h-3.5" /> {confirmText}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
