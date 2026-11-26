"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthService } from "@/services/auth.service";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMaintenance, setIsMaintenance] = useState(() => {
        if (typeof window !== "undefined") {
            return new URLSearchParams(window.location.search).get("maintenance") === "true";
        }
        return false;
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Por favor complete correo y contraseña");
            return;
        }

        setIsLoading(true);
        try {
            await AuthService.login({
                correoElectronico: email,
                contrasena: password,
            });
            toast.success("Ingreso exitoso al Panel Administrativo");
            window.location.href = "/dashboard";
        } catch (err: unknown) {
            const errorMsg = (err as Error).message || "Error al iniciar sesión";
            if (errorMsg.includes("PLATFORM_LOCKDOWN") || errorMsg.includes("mantenimiento")) {
                setIsMaintenance(true);
            }
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-4">
            {isMaintenance && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 animate-fade-in shadow-2xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-amber-900 dark:text-amber-200">
                            Plataforma en Mantenimiento
                        </p>
                        <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                            El acceso al sistema se encuentra temporalmente suspendido por labores técnicas y de infraestructura. Por favor, intente más tarde.
                        </p>
                    </div>
                </div>
            )}
            <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-muted-foreground w-5 h-5 pointer-events-none" />
                <Input
                    type="email"
                    placeholder="correo@uce.edu.ec"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 bg-card border-border text-foreground placeholder:text-muted-subtle focus:border-primary-focus focus:ring-4 focus:ring-primary/15 rounded-xl transition-all shadow-2xs"
                    autoComplete="email"
                    disabled={isLoading}
                />
            </div>

            <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-muted-foreground w-5 h-5 pointer-events-none" />
                <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña institucional"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 bg-card border-border text-foreground placeholder:text-muted-subtle focus:border-primary-focus focus:ring-4 focus:ring-primary/15 rounded-xl transition-all shadow-2xs"
                    autoComplete="current-password"
                    disabled={isLoading}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1 rounded-md"
                    title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
            </div>

            <Button
                type="submit"
                className="w-full h-12 rounded-xl text-sm font-semibold tracking-wide bg-primary hover:bg-primary-hover text-primary-foreground transition-all shadow-xs hover:shadow active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin text-accent" />
                        <span>Autenticando...</span>
                    </>
                ) : (
                    <>
                        <span>Ingresar a la Plataforma</span>
                        <ArrowRight className="w-4 h-4 text-border-strong" />
                    </>
                )}
            </Button>
        </form>
    );
}
