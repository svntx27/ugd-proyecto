import React from 'react';

interface ParamTableProps {
  title?: string;
  children: React.ReactNode;
}

export function ParamTable({ title, children }: ParamTableProps) {
  return (
    <div className="my-4 rounded-lg border border-border bg-card overflow-hidden shadow-xs">
      {title && (
        <div className="border-b border-border bg-muted/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </div>
      )}
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

interface ParamFieldProps {
  name: string;
  type: string;
  required?: boolean;
  defaultValue?: string;
  children?: React.ReactNode;
}

export function ParamField({
  name,
  type,
  required = false,
  defaultValue,
  children,
}: ParamFieldProps) {
  return (
    <div className="p-4 flex flex-col gap-1.5 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm font-semibold text-foreground">
          {name}
        </code>
        <span className="rounded-md border border-border bg-secondary/50 px-2 py-0.5 font-mono text-xs text-secondary-foreground">
          {type}
        </span>
        {required ? (
          <span className="rounded bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/20">
            Requerido
          </span>
        ) : (
          <span className="rounded bg-zinc-500/10 px-2 py-0.5 text-xs font-normal text-zinc-600 dark:text-zinc-400">
            Opcional
          </span>
        )}
        {defaultValue && (
          <span className="text-xs text-muted-foreground font-mono">
            Default: <span className="font-semibold text-foreground">{defaultValue}</span>
          </span>
        )}
      </div>
      {children && (
        <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-1 pt-0.5">
          {children}
        </div>
      )}
    </div>
  );
}
