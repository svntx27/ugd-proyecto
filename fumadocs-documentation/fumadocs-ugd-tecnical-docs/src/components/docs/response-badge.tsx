import React from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface ResponseBadgeProps {
  status: number;
  text?: string;
  description?: string;
}

export function ResponseBadge({ status, text, description }: ResponseBadgeProps) {
  let style = 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/30';
  let Icon = AlertCircle;

  if (status >= 200 && status < 300) {
    style = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
    Icon = CheckCircle2;
  } else if (status >= 300 && status < 400) {
    style = 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30';
    Icon = AlertCircle;
  } else if (status >= 400 && status < 500) {
    style = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30';
    Icon = AlertCircle;
  } else if (status >= 500) {
    style = 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30';
    Icon = XCircle;
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1 text-xs">
      <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono font-bold border ${style}`}>
        <Icon className="w-3 h-3" />
        <span>{status}</span>
        {text && <span className="font-sans font-semibold text-[11px] ml-0.5">{text}</span>}
      </span>
      {description && <span className="text-muted-foreground text-xs">{description}</span>}
    </div>
  );
}
