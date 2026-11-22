import { cookies } from "next/headers";
import type { Metadata } from "next";
import { UsuarioDetalleClient } from "./UsuarioDetalleClient";
import type { UserDetail } from "@/services/user.service";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    return {
        title: `Ficha de Integrante #${id} - UGD Portal`,
        description: `Información y expediente doctoral de integrante en la Unidad de Gestión de Doctorados (UGD).`,
    };
}

export default async function UsuarioDetallePage({ params }: PageProps) {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    let initialUser: UserDetail | null = null;

    if (token) {
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
            const response = await fetch(`${apiBaseUrl}/users/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
                signal: AbortSignal.timeout(2000), // Máximo 2 segundos de espera en SSR
            });

            if (response.ok) {
                initialUser = await response.json();
            }
        } catch (error) {
            console.error("Error en SSR fetch del detalle de usuario:", error);
            // El componente cliente tiene fallback automático para reintentar en el navegador
        }
    }

    return <UsuarioDetalleClient initialUser={initialUser} />;
}
