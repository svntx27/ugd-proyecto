"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface CustomSelectOption {
    value: string;
    label: string;
    sublabel?: string;
    count?: number;
    dotClass?: string;
    icon?: React.ReactNode;
}

export interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: CustomSelectOption[];
    placeholder?: string;
    icon?: React.ReactNode;
    className?: string;
    triggerClassName?: string;
    menuClassName?: string;
    disabled?: boolean;
    align?: "left" | "right";
    size?: "sm" | "md";
}

export function CustomSelect({
    value,
    onChange,
    options,
    placeholder = "Seleccione una opción...",
    icon,
    className = "",
    triggerClassName = "",
    menuClassName = "",
    disabled = false,
    align = "left",
    size = "md",
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const listboxId = useId();

    const selectedOption = options.find((opt) => String(opt.value) === String(value));

    // Handle outside click and Escape key
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    const handleToggle = () => {
        if (disabled) return;
        if (!isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            setOpenUpward(spaceBelow < 260 && spaceAbove > spaceBelow);
        }
        setIsOpen((prev) => !prev);
    };

    const isSmall = size === "sm";

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={handleToggle}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={listboxId}
                className={`w-full flex items-center justify-between gap-2 bg-card border rounded-xl transition-all font-medium shadow-2xs text-left ${
                    isSmall ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm"
                } ${
                    disabled
                        ? "opacity-50 cursor-not-allowed border-border"
                        : isOpen
                        ? "border-primary ring-2 ring-primary/15 bg-card"
                        : "border-border hover:border-border-strong hover:bg-surface-hover cursor-pointer"
                } text-foreground ${triggerClassName}`}
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {icon && <span className="shrink-0 text-primary">{icon}</span>}
                    {selectedOption?.dotClass && (
                        <span className={`w-2 h-2 rounded-full shrink-0 ${selectedOption.dotClass}`} />
                    )}
                    {selectedOption ? (
                        <span className="truncate">{selectedOption.label}</span>
                    ) : (
                        <span className="text-muted-subtle truncate">{placeholder}</span>
                    )}

                    {selectedOption?.count !== undefined && (
                        <span className="text-[11px] font-semibold text-accent-text bg-accent/15 border border-accent/25 px-1.5 py-0.2 rounded-md shrink-0">
                            {selectedOption.count}
                        </span>
                    )}
                </div>

                <ChevronDown
                    className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
                        isSmall ? "w-3.5 h-3.5" : "w-4 h-4"
                    } ${isOpen ? "rotate-180 text-primary" : ""}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    id={listboxId}
                    role="listbox"
                    className={`absolute z-50 w-full min-w-[200px] rounded-2xl bg-card border border-border shadow-xl p-1.5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 ${
                        openUpward ? "bottom-full mb-1.5" : "top-full mt-1.5"
                    } ${
                        align === "right" ? "right-0" : "left-0"
                    } ${menuClassName}`}
                >
                    <div className="max-h-60 overflow-y-auto space-y-0.5 pr-0.5">
                        {options.map((opt) => {
                            const isSelected = String(opt.value) === String(value);
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={() => handleSelect(opt.value)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                                        isSmall ? "text-xs" : "text-xs sm:text-sm"
                                    } ${
                                        isSelected
                                            ? "bg-primary text-primary-foreground font-semibold"
                                            : "text-foreground-soft hover:bg-surface-hover hover:text-foreground font-medium"
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        {opt.icon && <span className="shrink-0 text-primary">{opt.icon}</span>}
                                        {opt.dotClass && (
                                            <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dotClass}`} />
                                        )}
                                        <div className="min-w-0">
                                            <p className="truncate">{opt.label}</p>
                                            {opt.sublabel && (
                                                <p className="text-[10px] text-muted-foreground font-normal truncate">
                                                    {opt.sublabel}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                        {opt.count !== undefined && (
                                            <span className="text-[11px] font-semibold text-foreground-soft bg-border px-1.5 py-0.5 rounded-md">
                                                {opt.count}
                                            </span>
                                        )}
                                        {isSelected && <Check className="w-4 h-4 text-accent shrink-0" />}
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
