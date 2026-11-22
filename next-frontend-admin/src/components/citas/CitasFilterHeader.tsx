"use client";

import React from "react";
import {
    Search,
    X,
    SlidersHorizontal,
    Calendar,
    Clock,
    History,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";

export type DatePreset = "all" | "today" | "upcoming" | "week" | "month" | "custom";
export type SortOrder = "date_desc" | "date_asc" | "id_desc" | "id_asc";

export interface OptionItem {
    value: string;
    label: string;
    sublabel?: string;
    dotClass?: string;
}

export interface CitasFilterHeaderProps {
    search: string;
    onSearchChange: (val: string) => void;
    selectedRepId: string;
    onRepChange: (val: string) => void;
    repOptions: OptionItem[];
    selectedStatus: string;
    onStatusChange: (val: string) => void;
    statusOptions: OptionItem[];
    showAdvancedFilters: boolean;
    onToggleAdvancedFilters: () => void;
    datePreset: DatePreset;
    onApplyDatePreset: (preset: DatePreset) => void;
    dateFrom: string;
    onDateFromChange: (val: string) => void;
    dateTo: string;
    onDateToChange: (val: string) => void;
    selectedTimeFilter: string;
    onTimeFilterChange: (val: string) => void;
    timeFilterOptions: OptionItem[];
    sortOrder: SortOrder;
    onSortOrderChange: (val: SortOrder) => void;
    sortOptions: OptionItem[];
    activeFiltersCount: number;
    onClearAllFilters: () => void;
}

export function CitasFilterHeader({
    search,
    onSearchChange,
    selectedRepId,
    onRepChange,
    repOptions,
    selectedStatus,
    onStatusChange,
    statusOptions,
    showAdvancedFilters,
    onToggleAdvancedFilters,
    datePreset,
    onApplyDatePreset,
    dateFrom,
    onDateFromChange,
    dateTo,
    onDateToChange,
    selectedTimeFilter,
    onTimeFilterChange,
    timeFilterOptions,
    sortOrder,
    onSortOrderChange,
    sortOptions,
    activeFiltersCount,
    onClearAllFilters,
}: CitasFilterHeaderProps) {
    return (
        <div className="bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-2xs space-y-4">
            {/* Fila 1: Búsqueda + Representante + Estado */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
                <div className="relative md:col-span-5">
                    <Search className="w-4 h-4 text-muted-subtle absolute left-3.5 top-3" />
                    <Input
                        placeholder="Buscar por #ID, trámite, doctorando, correo o representante..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 pr-9"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => onSearchChange("")}
                            className="absolute right-3 top-2.5 text-muted-subtle hover:text-foreground p-0.5 rounded-md cursor-pointer"
                            title="Borrar búsqueda"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <div className="md:col-span-3">
                    <CustomSelect
                        value={selectedRepId}
                        onChange={onRepChange}
                        options={repOptions}
                        placeholder="Todos los Representantes"
                    />
                </div>

                <div className="md:col-span-3">
                    <CustomSelect
                        value={selectedStatus}
                        onChange={onStatusChange}
                        options={statusOptions}
                        placeholder="Todos los Estados"
                    />
                </div>

                <div className="md:col-span-1 flex justify-end">
                    <button
                        type="button"
                        onClick={onToggleAdvancedFilters}
                        className={`w-full md:w-auto h-10 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                            showAdvancedFilters
                                ? "bg-accent border-border-strong text-accent-foreground"
                                : "bg-white border-border text-foreground-muted hover:bg-surface-hover"
                        }`}
                        title="Mostrar u ocultar subfiltros de fecha y hora"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span className="md:hidden">Subfiltros de Fecha y Hora</span>
                    </button>
                </div>
            </div>

            {/* Fila 2: Subfiltros por Fecha, Horario y Ordenamiento */}
            {showAdvancedFilters && (
                <div className="pt-3.5 border-t border-border-subtle space-y-3.5">
                    {/* Presets rápidos de fecha */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mr-1.5">
                                Periodo:
                            </span>
                            {(
                                [
                                    { key: "all", label: "Todas las fechas" },
                                    { key: "today", label: "Hoy" },
                                    { key: "upcoming", label: "Próximas" },
                                    { key: "week", label: "Esta semana" },
                                    { key: "month", label: "Este mes" },
                                ] as { key: DatePreset; label: string }[]
                            ).map((item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => onApplyDatePreset(item.key)}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                                        datePreset === item.key
                                            ? "bg-primary text-white border-primary"
                                            : "bg-white text-foreground-muted border-border hover:bg-surface-hover hover:text-foreground"
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {activeFiltersCount > 0 && (
                            <button
                                type="button"
                                onClick={onClearAllFilters}
                                className="text-xs font-semibold text-destructive hover:text-destructive-text flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-destructive-bg transition-colors cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                                Limpiar filtros ({activeFiltersCount})
                            </button>
                        )}
                    </div>

                    {/* Controles específicos de Rango de Fecha, Horario y Ordenamiento */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                Fecha Desde
                            </label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => onDateFromChange(e.target.value)}
                                className="w-full h-10 bg-white border border-border focus:border-primary focus:ring-2 focus:ring-accent px-3 rounded-xl text-foreground text-xs font-medium outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                Fecha Hasta
                            </label>
                            <input
                                type="date"
                                value={dateTo}
                                min={dateFrom || undefined}
                                onChange={(e) => onDateToChange(e.target.value)}
                                className="w-full h-10 bg-white border border-border focus:border-primary focus:ring-2 focus:ring-accent px-3 rounded-xl text-foreground text-xs font-medium outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-primary" />
                                Horario / Jornada
                            </label>
                            <CustomSelect
                                value={selectedTimeFilter}
                                onChange={onTimeFilterChange}
                                options={timeFilterOptions}
                                placeholder="Todos los Horarios"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                                <History className="w-3.5 h-3.5 text-primary" />
                                Ordenar Resultados
                            </label>
                            <CustomSelect
                                value={sortOrder}
                                onChange={(val) => onSortOrderChange(val as SortOrder)}
                                options={sortOptions}
                                placeholder="Ordenar por..."
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
