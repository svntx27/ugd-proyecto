"use client";

import React, { useState, useRef, useEffect } from "react";
import { LucideIcon, Filter, ChevronDown, Check } from "lucide-react";

export interface FilterOption {
    key: string;
    label: string;
    count?: number;
    dotColor?: string;
}

export interface FilterSelectDropdownProps {
    title?: string;
    icon?: LucideIcon;
    selectedKey: string;
    onSelect: (key: string) => void;
    allOptionLabel?: string;
    allOptionCount?: number;
    options: FilterOption[];
    selectedLabel: string;
    selectedCount?: number;
    className?: string;
    menuWidthClassName?: string;
}

export function FilterSelectDropdown({
    title = "Filtrar opciones",
    icon: Icon = Filter,
    selectedKey,
    onSelect,
    allOptionLabel = "Todas las Categorías",
    allOptionCount,
    options,
    selectedLabel,
    selectedCount,
    className = "",
    menuWidthClassName = "w-full sm:w-72",
}: FilterSelectDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    return (
        <div ref={dropdownRef} className={`relative w-full sm:w-auto min-w-0 sm:min-w-[210px] ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className={`w-full flex items-center justify-between gap-2.5 bg-surface-subtle hover:bg-white border rounded-xl px-3.5 py-2 text-xs sm:text-sm text-foreground transition-all font-medium shadow-2xs cursor-pointer ${
                    isOpen
                        ? "border-primary ring-2 ring-primary/10 bg-white"
                        : "border-border"
                }`}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate text-left">{selectedLabel}</span>
                    {typeof selectedCount === "number" && (
                        <span className="text-[11px] font-semibold text-accent-foreground bg-accent px-1.5 py-0.5 rounded-md shrink-0">
                            {selectedCount}
                        </span>
                    )}
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-primary" : ""
                    }`}
                />
            </button>

            {/* Floating Custom Menu */}
            {isOpen && (
                <div
                    className={`absolute left-0 sm:right-auto z-30 mt-1.5 ${menuWidthClassName} rounded-2xl bg-card border border-border shadow-xl p-1.5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150`}
                >
                    {title && (
                        <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            {title}
                        </div>
                    )}

                    {/* All Option */}
                    <button
                        type="button"
                        onClick={() => {
                            onSelect("all");
                            setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-all font-medium cursor-pointer ${
                            selectedKey === "all"
                                ? "bg-accent text-accent-foreground font-semibold"
                                : "text-foreground-soft hover:bg-surface-hover"
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            <span>{allOptionLabel}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {typeof allOptionCount === "number" && (
                                <span className="text-[11px] font-semibold text-foreground-soft bg-border-strong px-1.5 py-0.5 rounded-md">
                                    {allOptionCount}
                                </span>
                            )}
                            {selectedKey === "all" && <Check className="w-4 h-4 text-accent-foreground" />}
                        </div>
                    </button>

                    <div className="my-1 h-px bg-surface-hover" />

                    {/* Options List */}
                    <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
                        {options.map((opt) => {
                            const isSelected = selectedKey === opt.key;
                            return (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => {
                                        onSelect(opt.key);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-all font-medium cursor-pointer ${
                                        isSelected
                                            ? "bg-accent text-accent-foreground font-semibold"
                                            : "text-foreground-soft hover:bg-surface-hover"
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span
                                            className={`w-2 h-2 rounded-full shrink-0 ${
                                                opt.dotColor || (isSelected ? "bg-primary" : "bg-muted-subtle")
                                            }`}
                                        />
                                        <span className="truncate">{opt.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {typeof opt.count === "number" && (
                                            <span className="text-[11px] font-semibold text-muted-foreground bg-surface-hover px-1.5 py-0.5 rounded-md">
                                                {opt.count}
                                            </span>
                                        )}
                                        {isSelected && <Check className="w-4 h-4 text-accent-foreground" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
