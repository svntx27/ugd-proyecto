"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface CompactPaginationProps {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (nextPage: number) => void;
    itemLabel?: string;
    className?: string;
}

export function CompactPagination({
    currentPage,
    totalItems,
    pageSize,
    onPageChange,
    itemLabel = "registros",
    className = "",
}: CompactPaginationProps) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    if (totalItems <= pageSize) return null;

    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const startItem = (safePage - 1) * pageSize + 1;
    const endItem = Math.min(safePage * pageSize, totalItems);

    return (
        <div
            className={`flex items-center justify-between gap-2 pt-3 border-t border-border-subtle ${className}`.trim()}
        >
            <span className="text-[11px] text-muted-foreground tabular-nums truncate">
                {startItem}-{endItem} de {totalItems} {itemLabel}
            </span>

            <div className="flex items-center gap-1 shrink-0">
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, safePage - 1))}
                    disabled={safePage <= 1}
                    className="p-1.5 rounded-lg border border-border bg-card text-foreground-soft hover:bg-surface-hover disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                    title="Página anterior"
                    aria-label="Página anterior"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-[11px] font-semibold text-foreground tabular-nums select-none">
                    {safePage} / {totalPages}
                </span>
                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
                    disabled={safePage >= totalPages}
                    className="p-1.5 rounded-lg border border-border bg-card text-foreground-soft hover:bg-surface-hover disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                    title="Página siguiente"
                    aria-label="Página siguiente"
                >
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
