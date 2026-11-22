"use client";

import React from "react";
import { Database, Download, Lock, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export interface DatabaseBackupSectionProps {
    isDeveloper: boolean;
    onOpenBackupModal: () => void;
    isOpen: boolean;
    onClose: () => void;
    adminPassword: string;
    onPasswordChange: (val: string) => void;
    onSubmit: () => void;
    downloadingBackup: boolean;
}

export function DatabaseBackupSection({
    isDeveloper,
    onOpenBackupModal,
    isOpen,
    onClose,
    adminPassword,
    onPasswordChange,
    onSubmit,
    downloadingBackup,
}: DatabaseBackupSectionProps) {
    if (!isDeveloper) return null;

    return (
        <>
            <div className="bg-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-border shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                    <div className="flex items-center gap-3">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-surface-subtle text-primary border border-border shrink-0">
                            <Database className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm sm:text-base font-bold text-foreground">
                                    Respaldo de Base de Datos
                                </h2>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent text-accent-foreground">
                                    Técnico
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Exportación estructural en formato JSON (Neon PostgreSQL).
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-subtle border border-border text-xs text-foreground-muted space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px]">Motor DB:</span>
                        <span className="font-semibold text-foreground">PostgreSQL Neon Serverless</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[11px]">Seguridad:</span>
                        <span className="font-semibold text-success">Verificación Cifrada</span>
                    </div>
                </div>

                <Button
                    type="button"
                    onClick={onOpenBackupModal}
                    className="w-full bg-primary hover:bg-primary-hover text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-xs text-xs sm:text-sm py-2.5 cursor-pointer"
                >
                    <Download className="w-4 h-4" /> Generar y Descargar Respaldo JSON
                </Button>
            </div>

            {/* Modal Verificación Contraseña Backup */}
            <Dialog open={isOpen} onOpenChange={(open) => !open && !downloadingBackup && onClose()}>
                <DialogContent className="sm:max-w-md bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-2xl">
                    <DialogHeader className="space-y-3 pb-2 border-b border-border-subtle">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-accent border border-border-strong text-accent-foreground shadow-2xs">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                                    Verificación de Seguridad
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                    Por protocolo técnico, confirma tu contraseña para descargar el respaldo de la base de datos.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 py-3">
                        <div className="bg-warning-bg p-3.5 rounded-2xl border border-role-director-border flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                            <p className="text-xs text-role-director leading-relaxed">
                                El archivo descargado contiene los esquemas, citas registradas y credenciales de usuario del sistema UGD.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground-soft uppercase tracking-wider block">
                                Contraseña de Desarrollador
                            </label>
                            <input
                                type="password"
                                placeholder="Ingresa tu contraseña..."
                                value={adminPassword}
                                onChange={(e) => onPasswordChange(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && adminPassword && !downloadingBackup) {
                                        onSubmit();
                                    }
                                }}
                                className="w-full bg-white border border-border rounded-xl text-foreground p-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-accent transition-all"
                                autoFocus
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-2 border-t border-border-subtle flex-col sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={downloadingBackup}
                            className="rounded-xl border-border hover:bg-surface-subtle text-xs font-medium w-full sm:w-auto cursor-pointer"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={onSubmit}
                            disabled={downloadingBackup || !adminPassword}
                            className="bg-primary hover:bg-primary-hover text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs w-full sm:w-auto cursor-pointer"
                        >
                            {downloadingBackup ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verificando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirmar y Descargar JSON
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
