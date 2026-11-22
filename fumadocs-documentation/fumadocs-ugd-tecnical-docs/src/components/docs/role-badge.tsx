import React from 'react';
import { ShieldCheck, UserCheck, Code, Award, GraduationCap, Globe } from 'lucide-react';

interface RoleBadgeProps {
  role: string;
  description?: string;
}

const roleConfigs: Record<string, { label: string; icon: React.ReactNode; style: string }> = {
  DESARROLLADOR: {
    label: 'Desarrollador',
    icon: <Code className="w-3.5 h-3.5" />,
    style: 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300',
  },
  DIRECTOR: {
    label: 'Director',
    icon: <Award className="w-3.5 h-3.5" />,
    style: 'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300',
  },
  ANALISTA_PROCESOS: {
    label: 'Analista de Procesos',
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    style: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  },
  ANALISTA_TECNICO: {
    label: 'Analista Técnico',
    icon: <UserCheck className="w-3.5 h-3.5" />,
    style: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
  },
  ESTUDIANTE: {
    label: 'Estudiante / Doctorando',
    icon: <GraduationCap className="w-3.5 h-3.5" />,
    style: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
  PUBLICO: {
    label: 'Público',
    icon: <Globe className="w-3.5 h-3.5" />,
    style: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300',
  },
  ADMIN: {
    label: 'Administrador',
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    style: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
  },
};

export function RoleBadge({ role, description }: RoleBadgeProps) {
  const normalizedKey = role.toUpperCase().trim();
  const config = roleConfigs[normalizedKey] || {
    label: role,
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    style: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
  };

  return (
    <span
      title={description || `Rol permitido: ${config.label}`}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${config.style}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}
