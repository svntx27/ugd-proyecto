import Image from "next/image";
import { GraduationCap } from "lucide-react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen w-full bg-background text-foreground">
            {/* Left Column: Form & Institutional Identity */}
            <div className="flex w-full flex-col justify-center px-6 py-12 md:w-1/2 lg:px-16 xl:px-24">
                <div className="mx-auto w-full max-w-sm flex flex-col items-center">
                    {/* Emblem & Institutional Header */}
                    <div className="w-12 h-12 rounded-2xl bg-primary-deep flex items-center justify-center text-white shadow-xs mb-4">
                        <GraduationCap className="w-6 h-6 text-accent" />
                    </div>

                    <span className="text-[11px] font-semibold uppercase tracking-wider text-accent-text bg-accent/15 px-3 py-1 rounded-full border border-accent/30 mb-3">
                        Portal UGD • UCE
                    </span>

                    <div className="text-center mb-7">
                        <h1 className="text-3xl font-bold font-serif text-foreground tracking-tight mb-2">
                            Bienvenido
                        </h1>
                        <p className="text-sm text-foreground-muted leading-relaxed">
                            Acceso exclusivo para administradores y autoridades
                        </p>
                    </div>

                    <LoginForm />

                    <p className="mt-8 text-center text-xs text-muted-subtle">
                        Sistema de Reservas UCE &copy; 2026
                    </p>
                </div>
            </div>

            {/* Right Column: Editorial Visual Cover */}
            <div className="relative hidden w-1/2 md:block overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-darkest/95 via-primary-deep-hover/85 to-primary-hero-end/75 z-10" />
                <Image
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2000"
                    alt="Espacio institucional de investigación"
                    fill
                    sizes="50vw"
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 z-20 flex flex-col justify-center p-12 lg:p-24 text-white">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium tracking-wide text-accent bg-white/10 backdrop-blur-md border border-white/15 w-fit mb-6">
                        <span className="w-2 h-2 rounded-full bg-primary-glow" />
                        <span>Unidad de Gestión de Doctorados</span>
                    </div>

                    <h2 className="text-4xl lg:text-5xl font-serif font-bold leading-tight mb-4 text-background">
                        Tu potencial es <br />
                        <span className="text-border-strong italic font-serif">infinito.</span>
                    </h2>

                    <p className="max-w-md text-base lg:text-lg text-border leading-relaxed">
                        Gestiona las citas presenciales y supervisa la atención personalizada de la Unidad de Gestión de Doctorados (UGD).
                    </p>

                    <div className="mt-12 pt-6 border-t border-white/15 max-w-md flex items-center justify-between text-xs text-border-strong">
                        <span>Universidad Central del Ecuador</span>
                        <span>Gestión Institucional</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
