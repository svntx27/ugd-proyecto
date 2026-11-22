"use client";

import React from "react";
import { Search } from "lucide-react";

export interface RepresentantesFilterBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    statusFilter: "all" | "active" | "inactive";
    onStatusChange: (status: "all" | "active" | "inactive") => void;
    totalCount: number;
    activeCount: number;
    inactiveCount: number;
}

export function RepresentantesFilterBar({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusChange,
    totalCount,
    activeCount,
    inactiveCount,
}: RepresentantesFilterBarProps) {
    return (
        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
            <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Buscar por nombre, correo institucional o cargo..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-surface-subtle border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder-muted-subtle focus:outline-none focus:border-primary focus:bg-white transition-all font-medium"
                />
            </div>

            <div className="flex items-center gap-1 bg-surface-hover p-1 rounded-xl shrink-0 overflow-x-auto">
                <button
                    type="button"
                    onClick={() => onStatusChange("all")}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs rounded-lg transition-all text-center whitespace-nowrap cursor-pointer ${
                        statusFilter === "all"
                            ? "bg-white text-accent-foreground shadow-2xs font-semibold"
                            : "text-foreground-muted hover:text-accent-foreground font-medium"
                    }`}
                >
                    Todos ({totalCount})
                </button>
                <button
                    type="button"
                    onClick={() => onStatusChange("active")}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs rounded-lg transition-all text-center whitespace-nowrap cursor-pointer ${
                        statusFilter === "active"
                            ? "bg-white text-success shadow-2xs font-semibold"
                            : "text-foreground-muted hover:text-success font-medium"
                    }`}
                >
                    Activos ({activeCount})
                </button>
                <button
                    type="button"
                    onClick={() => onStatusChange("inactive")}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs rounded-lg transition-all text-center whitespace-nowrap cursor-pointer ${
                        statusFilter === "inactive"
                            ? "bg-white text-destructive-text shadow-2xs font-semibold"
                            : "text-foreground-muted hover:text-destructive-text font-medium"
                    }`}
                >
                    Pausados ({inactiveCount})
                </button>
            </div>
        </div>
    );
}
