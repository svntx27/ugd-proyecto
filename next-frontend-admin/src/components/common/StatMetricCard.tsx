"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

export interface StatMetricCardProps {
    icon?: LucideIcon;
    iconClassName?: string;
    iconContainerClassName?: string;
    label: string;
    value: string | number;
    sublabel?: string;
    sublabelClassName?: string;
    onClick?: () => void;
    isActive?: boolean;
    className?: string;
}

export function StatMetricCard({
    icon: Icon,
    iconClassName = "w-4 h-4 sm:w-5 sm:h-5",
    iconContainerClassName = "p-2 sm:p-2.5 rounded-xl bg-surface-subtle text-primary border border-border shrink-0",
    label,
    value,
    sublabel,
    sublabelClassName = "text-[11px] font-normal text-muted-subtle",
    onClick,
    isActive = false,
    className = "",
}: StatMetricCardProps) {
    const isInteractive = typeof onClick === "function";

    if (isInteractive) {
        return (
            <button
                type="button"
                onClick={onClick}
                className={`text-left p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                    isActive
                        ? "bg-card border-primary ring-1 ring-primary/25 shadow-xs"
                        : "bg-card border-border hover:border-border-strong"
                } ${className}`}
            >
                {Icon ? (
                    <div className="flex items-center gap-3">
                        <div className={iconContainerClassName}>
                            <Icon className={iconClassName} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">{label}</p>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                <span className="text-lg sm:text-xl font-bold text-foreground">{value}</span>
                                {sublabel && <span className={sublabelClassName}>{sublabel}</span>}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                            {label}
                        </span>
                        <div className="flex items-baseline justify-between mt-1">
                            <span className="text-2xl font-bold text-foreground">{value}</span>
                            {sublabel && <span className={sublabelClassName}>{sublabel}</span>}
                        </div>
                    </div>
                )}
            </button>
        );
    }

    return (
        <div
            className={`bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 shadow-2xs ${className}`}
        >
            {Icon && (
                <div className={iconContainerClassName}>
                    <Icon className={iconClassName} />
                </div>
            )}
            <div className="min-w-0">
                <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">{label}</p>
                <p className="text-lg sm:text-xl font-bold text-foreground">
                    {value} {sublabel && <span className={sublabelClassName}>{sublabel}</span>}
                </p>
            </div>
        </div>
    );
}
