"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Dashboard error caught by boundary:", error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-destructive-bg border border-destructive-border flex items-center justify-center text-destructive shadow-xs">
                <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                    Ocurrió una eventualidad técnica
                </h2>
                <p className="text-sm text-foreground-muted leading-relaxed">
                    No fue posible procesar la información de este módulo en este instante. Puedes reintentar la operación o volver al inicio.
                </p>
                {error.message && (
                    <p className="text-xs font-mono text-muted-foreground pt-2 break-words bg-background p-3 rounded-xl border border-border">
                        {error.message}
                    </p>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                    onClick={() => reset()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary-hover transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                >
                    <RefreshCw className="w-4 h-4" /> Reintentar Operación
                </button>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-card text-foreground-soft hover:text-foreground border border-border hover:bg-surface-hover shadow-xs transition-colors"
                >
                    <Home className="w-4 h-4" /> Ir a Inicio
                </Link>
            </div>
        </div>
    );
}
