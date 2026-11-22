"use client";

import React from "react";
import { LucideIcon, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TableEmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    actionText?: string;
    onAction?: () => void;
    className?: string;
}

export function TableEmptyState({
    icon: Icon = Inbox,
    title,
    description,
    actionText,
    onAction,
    className = "",
}: TableEmptyStateProps) {
    return (
        <div
            className={`bg-card border border-border rounded-2xl sm:rounded-3xl p-12 text-center shadow-xs space-y-3 ${className}`}
        >
            <div className="w-12 h-12 rounded-2xl bg-surface-hover text-muted-foreground flex items-center justify-center mx-auto">
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">{description}</p>
            {actionText && onAction && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onAction}
                    className="rounded-xl mt-2 text-xs cursor-pointer"
                >
                    {actionText}
                </Button>
            )}
        </div>
    );
}
