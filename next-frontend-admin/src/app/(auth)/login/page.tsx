import Image from "next/image";
import { GraduationCap } from "lucide-react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
            {/* Left Column: Form & Institutional Identity */}
            <div className="flex w-full flex-col justify-between overflow-y-auto px-6 py-8 md:w-1/2 md:px-12 lg:px-16 xl:px-24">
                {/* Institutional Header */}
                <header className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-xs shrink-0">
                        <GraduationCap className="w-5 h-5 text-gold" strokeWidth={2.2} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold tracking-tight text-foreground uppercase">
                            Universidad Central del Ecuador
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium">
                            Unidad de Gestión de Doctorados (UGD)
                        </span>
                    </div>
                </header>

                {/* Main Form Center */}
                <main className="my-auto py-8 w-full max-w-sm mx-auto">
                    <div className="mb-7 text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-1.5">
                            Iniciar Sesión
                        </h1>
                        <p className="text-sm text-foreground-muted">
                            Ingrese sus credenciales para continuar
                        </p>
                    </div>

                    <LoginForm />
                </main>

                {/* Footer Note */}
                <footer className="pt-4 border-t border-border/60 text-xs text-muted-subtle flex items-center justify-between">
                    <span>UGD · Gestión Institucional</span>
                    <span>&copy; {new Date().getFullYear()} UCE</span>
                </footer>
            </div>

            {/* Right Column: Editorial Visual Cover (Solid Base to avoid white borders) */}
            <div className="relative hidden w-1/2 md:flex flex-col justify-between p-12 lg:p-16 xl:p-20 overflow-hidden bg-primary-darkest text-white">
                <Image
                    src="/bg.webp"
                    alt="Campus e investigación - Universidad Central del Ecuador"
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover object-center"
                    priority
                />

                {/* Deep Institutional Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-darkest/95 via-primary-deep/85 to-primary-darkest/60 z-10" />

                {/* Top Badge: Research & Postgrad */}
                <div className="relative z-20 flex items-center gap-2.5 text-xs font-medium tracking-wide text-gold-light/90">
                    <span className="w-2 h-2 rounded-full bg-gold" />
                    <span>Vicerrectorado de Investigación, Doctorados e Innovación</span>
                </div>

                {/* Editorial Content */}
                <div className="relative z-20 max-w-lg my-auto py-8">
                    <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold leading-[1.15] text-white tracking-tight mb-5">
                        Gestión Integral del Posgrado y Doctorados
                    </h2>

                    <p className="text-base lg:text-lg text-white/80 leading-relaxed font-light">
                        Supervisión integral de programas doctorales, expedientes de investigadores, comités de evaluación y seguimiento institucional.
                    </p>
                </div>

                {/* Cover Bottom Meta */}
                <div className="relative z-20 pt-6 border-t border-white/15 flex items-center justify-between text-xs text-white/70">
                    <span>Universidad Central del Ecuador</span>
                    <span className="font-medium text-gold-light">Quito, Ecuador</span>
                </div>
            </div>
        </div>
    );
}
