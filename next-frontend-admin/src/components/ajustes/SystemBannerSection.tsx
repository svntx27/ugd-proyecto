"use client";

import React from "react";
import { Megaphone } from "lucide-react";

export interface SystemBannerSectionProps {
    settings: Record<string, string>;
    onSettingsChange: (newSettings: Record<string, string>) => void;
}

export function SystemBannerSection({ settings, onSettingsChange }: SystemBannerSectionProps) {
    const isBannerActive = settings.banner_active === "true";

    return (
        <div className="bg-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-3">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-surface-subtle text-primary border border-border shrink-0">
                        <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-foreground">
                            Aviso en Portal Estudiantil
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Mensaje de cabecera visible para los estudiantes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Banner Toggle Switch */}
            <div className="p-3.5 rounded-2xl bg-white border border-border flex items-center justify-between">
                <div>
                    <span className="text-xs font-bold text-foreground block">Visibilidad del Banner</span>
                    <span className="text-[11px] text-muted-foreground">
                        {isBannerActive
                            ? "El banner se mostrará en el portal"
                            : "El banner está oculto para estudiantes"}
                    </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isBannerActive}
                        onChange={(e) =>
                            onSettingsChange({
                                ...settings,
                                banner_active: e.target.checked ? "true" : "false",
                            })
                        }
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-active peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>

            {/* Textarea for Message */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground-soft uppercase tracking-wider block">
                        Contenido del Comunicado
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                        {(settings.global_message || "").length} caracteres
                    </span>
                </div>
                <textarea
                    value={settings.global_message || ""}
                    onChange={(e) => onSettingsChange({ ...settings, global_message: e.target.value })}
                    placeholder="Ej: Se solicita a los estudiantes de doctorado presentarse con 5 minutos de anticipación con su documentación impresa..."
                    rows={3}
                    className="w-full bg-white border border-border rounded-xl p-3 text-xs sm:text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-accent resize-none placeholder:text-muted-subtle transition-all font-medium"
                />
            </div>

            {/* Live Preview Box */}
            <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Vista Previa en Portal Estudiantil
                </span>
                {isBannerActive ? (
                    <div className="p-3 rounded-xl bg-success-bg border border-border-strong text-xs text-accent-foreground flex items-start gap-2.5 shadow-2xs">
                        <Megaphone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div className="min-w-0">
                            <p className="font-semibold text-foreground text-xs">Aviso Institucional UGD</p>
                            <p className="text-[11px] text-foreground-soft mt-0.5 leading-relaxed">
                                {settings.global_message || "Sin mensaje redactado aún."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="p-3 rounded-xl bg-surface-subtle border border-border text-xs text-muted-subtle text-center italic">
                        El banner institucional se encuentra inactivo actualmente.
                    </div>
                )}
            </div>
        </div>
    );
}
