import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isTokenValid(token?: string): boolean {
    if (!token) return false;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(payloadJson);
        if (payload.exp && Date.now() >= payload.exp * 1000) {
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("admin_token")?.value;
    const valid = isTokenValid(token);

    // Si tiene token pero es inválido o expiró, limpiamos cookies y redirigimos
    if (token && !valid) {
        if (pathname === "/login") {
            const res = NextResponse.next();
            res.cookies.delete("admin_token");
            res.cookies.delete("admin_role");
            return res;
        }
        const loginUrl = new URL("/login", request.url);
        const res = NextResponse.redirect(loginUrl);
        res.cookies.delete("admin_token");
        res.cookies.delete("admin_role");
        return res;
    }

    // 1. Redirección en la raíz "/"
    if (pathname === "/") {
        if (valid) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // 2. Si ya está autenticado e intenta entrar a "/login"
    if (pathname === "/login") {
        if (valid) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return NextResponse.next();
    }

    // 3. Proteger todas las rutas del "/dashboard/:path*"
    if (pathname.startsWith("/dashboard")) {
        if (!valid) {
            const loginUrl = new URL("/login", request.url);
            const res = NextResponse.redirect(loginUrl);
            res.cookies.delete("admin_token");
            res.cookies.delete("admin_role");
            return res;
        }

        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/", "/login", "/dashboard/:path*"],
};
