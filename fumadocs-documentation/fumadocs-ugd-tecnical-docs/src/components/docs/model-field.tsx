import React from 'react';
import { Key, Link as LinkIcon, Sparkles } from 'lucide-react';

interface ModelFieldProps {
  name: string;
  type: string;
  isPrimary?: boolean;
  isUnique?: boolean;
  isForeign?: boolean;
  isNullable?: boolean;
  defaultValue?: string;
  children?: React.ReactNode;
}

export function ModelField({
  name,
  type,
  isPrimary = false,
  isUnique = false,
  isForeign = false,
  isNullable = false,
  defaultValue,
  children,
}: ModelFieldProps) {
  return (
    <div className="p-3.5 flex flex-col gap-1.5 text-sm border-b border-border last:border-b-0 hover:bg-muted/20 transition">
      <div className="flex flex-wrap items-center gap-2">
        <code className="rounded bg-muted px-2 py-0.5 font-mono text-sm font-bold text-foreground">
          {name}
        </code>

        <span className="rounded bg-secondary/80 px-2 py-0.5 font-mono text-xs text-secondary-foreground font-medium">
          {type}
        </span>

        {isPrimary && (
          <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-500/30">
            <Key className="w-3 h-3" /> PK
          </span>
        )}

        {isForeign && (
          <span className="inline-flex items-center gap-1 rounded bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-500/30">
            <LinkIcon className="w-3 h-3" /> FK
          </span>
        )}

        {isUnique && (
          <span className="inline-flex items-center gap-1 rounded bg-purple-500/15 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-300 border border-purple-500/30">
            <Sparkles className="w-3 h-3" /> Unique
          </span>
        )}

        {isNullable ? (
          <span className="rounded bg-zinc-500/10 px-1.5 py-0.5 text-[11px] text-zinc-600 dark:text-zinc-400">
            Nullable
          </span>
        ) : (
          <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
            NOT NULL
          </span>
        )}

        {defaultValue && (
          <span className="text-xs text-muted-foreground font-mono">
            Default: <span className="text-foreground">{defaultValue}</span>
          </span>
        )}
      </div>

      {children && (
        <div className="text-xs sm:text-sm text-muted-foreground pl-1">
          {children}
        </div>
      )}
    </div>
  );
}

interface ModelTableProps {
  title?: string;
  tableName?: string;
  children: React.ReactNode;
}

export function ModelTable({ title, tableName, children }: ModelTableProps) {
  return (
    <div className="my-6 rounded-lg border border-border bg-card overflow-hidden shadow-xs">
      {(title || tableName) && (
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title || 'Estructura del Modelo'}
          </span>
          {tableName && (
            <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-foreground">
              @@map(&quot;{tableName}&quot;)
            </code>
          )}
        </div>
      )}
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}
