import React from 'react';
import { Lock, Unlock, ShieldAlert } from 'lucide-react';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiEndpointProps {
  method: HttpMethod;
  path: string;
  auth?: boolean | string;
  role?: string;
  deprecated?: boolean;
}

const methodStyles: Record<HttpMethod, { bg: string; text: string; border: string }> = {
  GET: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/30',
  },
  POST: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-500/30',
  },
  PUT: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-500/30',
  },
  PATCH: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-500/30',
  },
  DELETE: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-500/30',
  },
};

export function ApiEndpoint({
  method,
  path,
  auth = true,
  role,
  deprecated = false,
}: ApiEndpointProps) {
  const upperMethod = method.toUpperCase() as HttpMethod;
  const style = methodStyles[upperMethod] || methodStyles.GET;

  const isAuthRequired = auth === true || typeof auth === 'string';
  const authLabel = typeof auth === 'string' ? auth : 'Bearer JWT';

  return (
    <div className={`my-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3 shadow-xs ${deprecated ? 'opacity-70 border-dashed' : 'border-border'}`}>
      <div className="flex items-center gap-3 overflow-x-auto font-mono text-sm">
        {/* Method Badge */}
        <span
          className={`inline-flex items-center justify-center rounded px-2.5 py-1 text-xs font-bold tracking-wider uppercase border ${style.bg} ${style.text} ${style.border}`}
        >
          {upperMethod}
        </span>

        {/* Endpoint Path */}
        <span className={`font-semibold tracking-tight text-foreground ${deprecated ? 'line-through' : ''}`}>
          {path}
        </span>

        {deprecated && (
          <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
            <ShieldAlert className="w-3 h-3" /> Deprecated
          </span>
        )}
      </div>

      {/* Badges Right (Auth & Role) */}
      <div className="flex items-center gap-2">
        {role && (
          <span className="inline-flex items-center rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
            Rol: {role}
          </span>
        )}

        {isAuthRequired ? (
          <span
            title="Requiere autenticación"
            className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300"
          >
            <Lock className="w-3 h-3" />
            <span>{authLabel}</span>
          </span>
        ) : (
          <span
            title="Endpoint público"
            className="inline-flex items-center gap-1 rounded-md border border-zinc-500/30 bg-zinc-500/10 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            <Unlock className="w-3 h-3" />
            <span>Público</span>
          </span>
        )}
      </div>
    </div>
  );
}
