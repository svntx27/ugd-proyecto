"use client";

import React, { useRef, useState, useEffect } from "react";
import { Search, Filter, ChevronDown, Check } from "lucide-react";
import { getRoleMeta } from "@/lib/role-badge.helper";

export interface CategoryItem {
    code: string;
    label: string;
    count: number;
}

export interface UsuariosFilterBarProps {
    search: string;
    onSearchChange: (val: string) => void;
    categoryFilter: string;
    onCategoryChange: (val: string) => void;
    statusFilter: string;
    onStatusChange: (val: string) => void;
    dynamicCategories: CategoryItem[];
    selectedCategoryMeta: { label: string; count: number };
    totalCount: number;
}

export function UsuariosFilterBar({
    search,
    onSearchChange,
    categoryFilter,
    onCategoryChange,
    statusFilter,
    onStatusChange,
    dynamicCategories,
    selectedCategoryMeta,
    totalCount,
}: UsuariosFilterBarProps) {
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setCategoryDropdownOpen(false);
            }
        }
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setCategoryDropdownOpen(false);
            }
        }
        if (categoryDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [categoryDropdownOpen]);

    return (
        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-2xs">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 text-muted-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Buscar por nombre, correo institucional o cédula..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-surface-subtle border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder-muted-subtle focus:outline-none focus:border-primary focus:bg-white transition-all font-medium"
                />
            </div>

            {/* Dynamic Filters Row */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap items-stretch sm:items-center gap-2 w-full lg:w-auto min-w-0">
                {/* Custom Executive Category / Role Dropdown */}
                <div ref={categoryDropdownRef} className="relative w-full sm:w-auto min-w-0 sm:min-w-[210px]">
                    <button
                        type="button"
                        onClick={() => setCategoryDropdownOpen((prev) => !prev)}
                        aria-haspopup="listbox"
                        aria-expanded={categoryDropdownOpen}
                        className={`w-full flex items-center justify-between gap-2.5 bg-surface-subtle hover:bg-white border rounded-xl px-3.5 py-2 text-xs sm:text-sm text-foreground transition-all font-medium shadow-2xs cursor-pointer ${
                            categoryDropdownOpen
                                ? "border-primary ring-2 ring-primary/10 bg-white"
                                : "border-border"
                        }`}
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <Filter className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="truncate text-left">{selectedCategoryMeta.label}</span>
                            <span className="text-[11px] font-semibold text-accent-foreground bg-accent px-1.5 py-0.5 rounded-md shrink-0">
                                {selectedCategoryMeta.count}
                            </span>
                        </div>
                        <ChevronDown
                            className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                                categoryDropdownOpen ? "rotate-180 text-primary" : ""
                            }`}
                        />
                    </button>

                    {/* Floating Custom Menu */}
                    {categoryDropdownOpen && (
                        <div className="absolute left-0 sm:right-auto z-30 mt-1.5 w-full sm:w-72 rounded-2xl bg-card border border-border shadow-xl p-1.5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                            <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                Filtrar por Rol o Cargo
                            </div>

                            {/* All Categories Option */}
                            <button
                                type="button"
                                onClick={() => {
                                    onCategoryChange("all");
                                    setCategoryDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-all font-medium cursor-pointer ${
                                    categoryFilter === "all"
                                        ? "bg-accent text-accent-foreground font-semibold"
                                        : "text-foreground-soft hover:bg-surface-hover"
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span className="w-2 h-2 rounded-full bg-primary" />
                                    <span>Todas las Categorías</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-semibold text-foreground-soft bg-border-strong px-1.5 py-0.5 rounded-md">
                                        {totalCount}
                                    </span>
                                    {categoryFilter === "all" && <Check className="w-4 h-4 text-accent-foreground" />}
                                </div>
                            </button>

                            <div className="my-1 h-px bg-surface-hover" />

                            {/* Dynamic Categories List */}
                            <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
                                {dynamicCategories.map((cat) => {
                                    const isSelected = categoryFilter === cat.code;
                                    const meta = getRoleMeta(cat.code);
                                    return (
                                        <button
                                            key={cat.code}
                                            type="button"
                                            onClick={() => {
                                                onCategoryChange(cat.code);
                                                setCategoryDropdownOpen(false);
                                            }}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-all font-medium cursor-pointer ${
                                                isSelected
                                                    ? "bg-accent text-accent-foreground font-semibold"
                                                    : "text-foreground-soft hover:bg-surface-hover"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dotClass}`} />
                                                <span className="truncate text-left">{cat.label}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <span className="text-[11px] font-semibold text-foreground-soft bg-border-strong px-1.5 py-0.5 rounded-md">
                                                    {cat.count}
                                                </span>
                                                {isSelected && <Check className="w-4 h-4 text-accent-foreground" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Filter Buttons */}
                <div className="w-full sm:w-auto overflow-x-auto scrollbar-none bg-surface-hover p-1 rounded-xl max-w-full">
                    <div className="flex items-center gap-1 min-w-max sm:min-w-0">
                        <button
                            type="button"
                            onClick={() => onStatusChange("all")}
                            className={`px-2.5 sm:px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 text-center flex-1 sm:flex-initial ${
                                statusFilter === "all"
                                    ? "bg-white text-accent-foreground shadow-2xs font-semibold"
                                    : "text-foreground-muted hover:text-accent-foreground font-medium"
                            }`}
                        >
                            Todos
                        </button>
                        <button
                            type="button"
                            onClick={() => onStatusChange("active")}
                            className={`px-2.5 sm:px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 text-center flex-1 sm:flex-initial ${
                                statusFilter === "active"
                                    ? "bg-white text-success shadow-2xs font-semibold"
                                    : "text-foreground-muted hover:text-success font-medium"
                            }`}
                        >
                            Activos
                        </button>
                        <button
                            type="button"
                            onClick={() => onStatusChange("preregistered")}
                            className={`px-2.5 sm:px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 text-center flex-1 sm:flex-initial ${
                                statusFilter === "preregistered"
                                    ? "bg-white text-warning shadow-2xs font-semibold"
                                    : "text-foreground-muted hover:text-warning font-medium"
                            }`}
                        >
                            Pre-registrados
                        </button>
                        <button
                            type="button"
                            onClick={() => onStatusChange("inactive")}
                            className={`px-2.5 sm:px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 text-center flex-1 sm:flex-initial ${
                                statusFilter === "inactive"
                                    ? "bg-white text-destructive shadow-2xs font-semibold"
                                    : "text-foreground-muted hover:text-destructive font-medium"
                            }`}
                        >
                            Inhabilitados
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
