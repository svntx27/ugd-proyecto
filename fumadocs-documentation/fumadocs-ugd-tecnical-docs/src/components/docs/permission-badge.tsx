'use client';

import React from 'react';
import { Check, Minus } from 'lucide-react';

export function Permit({ label = 'Permitido' }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center justify-center size-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-transform hover:scale-110"
      title={label}
      aria-label={label}
    >
      <Check className="size-3.5 stroke-[2.5]" />
    </span>
  );
}

export function Deny({ label = 'Denegado' }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center justify-center size-5 rounded-full bg-muted/60 text-muted-foreground/40 border border-border/60 transition-transform hover:scale-110"
      title={label}
      aria-label={label}
    >
      <Minus className="size-3.5 stroke-[2]" />
    </span>
  );
}

export function PermissionBadge({
  allowed,
  label,
}: {
  allowed: boolean;
  label?: string;
}) {
  return allowed ? <Permit label={label} /> : <Deny label={label} />;
}
