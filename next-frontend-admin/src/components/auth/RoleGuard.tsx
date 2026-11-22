"use client";

import { useEffect, useState } from "react";
import { AuthService } from "@/services/auth.service";
import { AccessDenied } from "./AccessDenied";

interface RoleGuardProps {
    allowedRoles?: string[];
    requiredPermission?: string;
    moduleName?: string;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

export function RoleGuard({
    allowedRoles = [],
    requiredPermission,
    moduleName,
    fallback,
    children,
}: RoleGuardProps) {
    const [mounted, setMounted] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        setMounted(true);
        const user = AuthService.getCurrentUser();
        if (!user) {
            setIsAuthorized(false);
            return;
        }

        let authorized = true;
        if (allowedRoles.length > 0) {
            authorized = authorized && allowedRoles.includes(user.role_code);
        }
        if (requiredPermission) {
            authorized = authorized && AuthService.hasPermission(requiredPermission);
        }
        setIsAuthorized(authorized);
    }, [allowedRoles, requiredPermission]);

    if (!mounted || isAuthorized === null) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center text-zinc-500 font-serif text-sm animate-pulse">
                Comprobando permisos de acceso...
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            fallback || (
                <AccessDenied
                    requiredRoles={allowedRoles}
                    requiredPermission={requiredPermission}
                    moduleName={moduleName}
                />
            )
        );
    }

    return <>{children}</>;
}
