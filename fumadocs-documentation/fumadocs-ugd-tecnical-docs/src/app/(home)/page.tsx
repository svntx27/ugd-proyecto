'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Server, LayoutDashboard, Users, GraduationCap, UserCheck, Award } from 'lucide-react';
import { thesisConfig } from '@/lib/shared';

export default function HomePage() {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-[calc(100vh-3.5rem)] flex justify-between overflow-hidden bg-background text-foreground"
      style={{
        // Pattern de micropuntos sutil
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      {/* Capa de iluminación interactiva (Spotlight de bajo cálculo en GPU) */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(650px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.045), transparent 70%)',
        }}
      />

      {/* Franja Vertical Izquierda: Institución y Facultad (Sin esquinas saturadas) */}
      <aside className="hidden xl:flex w-12 shrink-0 border-r border-border/40 flex-col justify-center items-center py-12 z-10 font-mono text-[10px] tracking-[0.35em] uppercase text-muted-foreground/40 select-none">
        <span className="[writing-mode:vertical-lr] rotate-180 whitespace-nowrap">
          {thesisConfig.institution} &middot; {thesisConfig.faculty}
        </span>
      </aside>

      {/* Contenedor Principal Central */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-12 py-8 sm:py-10 flex flex-col justify-between">
        {/* 1. Encabezado de Portada (Limpio y sin redundancia con los laterales) */}
        <header className="border-b border-border/60 pb-4">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-foreground tracking-wider">
                MANUAL TÉCNICO &middot; SISTEMA UGD
              </span>
            </div>
            <span className="text-muted-foreground/70 font-mono">
              REF: DOC-UGD-2026
            </span>
          </div>
        </header>

        {/* 2. Hero Central (Titular + Sinopsis con Título de la Tesis) */}
        <section className="my-auto py-8 sm:py-12 flex flex-col">
          {/* Distintivo de modalidad académica */}
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-muted-foreground mb-5">
            <span className="px-2.5 py-0.5 rounded border border-border bg-card/60 text-[10px] font-semibold text-foreground">
              PROYECTO INTEGRADOR
            </span>
            <span className="text-muted-foreground/40">&bull;</span>
            <span className="text-[10px] text-muted-foreground">MANUAL DE INGENIERÍA</span>
          </div>

          {/* Gran Titular */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground uppercase leading-[1.0] mb-5">
            SISTEMA UGD <br />
            <span className="font-light text-muted-foreground text-3xl sm:text-5xl lg:text-6xl">
              Manual Técnico
            </span>
          </h1>

          {/* Sinopsis de portada con el tema formal de la tesis */}
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl leading-relaxed mb-4 font-normal">
            Plataforma web modular para la gestión integral de docentes becarios de doctorado de la Universidad Central del Ecuador. Referencia técnica exhaustiva de servicios REST en Express 5, esquemas relacionales con Prisma ORM en PostgreSQL, seguridad RBAC y streaming reactivo de citas presenciales en ventanilla.
          </p>

          {/* Acciones principales */}
          <nav className="flex flex-wrap items-center gap-4 mt-2 mb-8">
            <Link
              href="/docs/backend"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded text-sm font-semibold bg-foreground text-background hover:opacity-90 transition font-mono tracking-tight shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>CONSULTAR BACKEND API</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-5 py-3 rounded text-sm font-medium border border-border bg-card/60 hover:bg-accent transition text-foreground font-mono"
            >
              <span>ÍNDICE GENERAL</span>
            </Link>
          </nav>

          {/* Ficha Académica Oficial de Titulación (Créditos Formales) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg border border-border/50 bg-card/30 font-mono text-xs">
            <div className="flex items-start gap-2">
              <Award className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">AUTORES</span>
                <span className="text-foreground font-medium">Freddy Tapia Rea &middot; Dennis Trujillo Vistin</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <GraduationCap className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">TUTOR PROPUESTO</span>
                <span className="text-foreground font-medium">{thesisConfig.tutor}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <UserCheck className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">UNIDAD BENEFICIARIA</span>
                <span className="text-foreground font-medium">{thesisConfig.advisor}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Pie de Portada: Módulos y Firma Institucional */}
        <footer className="border-t border-border/60 pt-5 flex flex-col gap-4">
          {/* Módulos de Arquitectura */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link
              href="/docs/backend"
              className="group p-3.5 rounded border border-border/50 bg-card/25 hover:border-foreground/40 transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-foreground font-semibold">01 / BACKEND API</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  ACTIVO
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">
                Servicios Express 5, modelos Prisma ORM, JWT y bus reactivo SSE.
              </p>
            </Link>

            <Link
              href="/docs/frontend-admin"
              className="group p-3.5 rounded border border-border/50 bg-card/25 hover:border-foreground/40 transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-foreground font-semibold">02 / FRONTEND ADMIN</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-secondary text-muted-foreground border border-border font-mono">
                  ROADMAP
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">
                Monitor en tiempo real de citas en ventanilla y padrón 360°.
              </p>
            </Link>

            <Link
              href="/docs/frontend-user"
              className="group p-3.5 rounded border border-border/50 bg-card/25 hover:border-foreground/40 transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-foreground font-semibold">03 / FRONTEND USUARIOS</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-secondary text-muted-foreground border border-border font-mono">
                  ROADMAP
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">
                Portal de autoservicio para postulantes y agendamiento multislot.
              </p>
            </Link>
          </div>

          {/* Colofón Limpio */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] font-mono text-muted-foreground/70">
            <span>{thesisConfig.career} &middot; QUITO &middot; {thesisConfig.year}</span>
            <div className="flex items-center gap-3">
              <span className="tracking-[0.25em] text-[10px] opacity-60 select-none">
                ||| | |||| | ||| |||| | |
              </span>
              <span>DEPÓSITO ACADÉMICO</span>
            </div>
          </div>
        </footer>
      </main>

      {/* Franja Vertical Derecha: Carrera y Año (Sin esquinas saturadas) */}
      <aside className="hidden xl:flex w-12 shrink-0 border-l border-border/40 flex-col justify-center items-center py-12 z-10 font-mono text-[10px] tracking-[0.35em] uppercase text-muted-foreground/40 select-none">
        <span className="[writing-mode:vertical-rl] whitespace-nowrap">
          {thesisConfig.career} &middot; {thesisConfig.location}
        </span>
      </aside>
    </div>
  );
}
