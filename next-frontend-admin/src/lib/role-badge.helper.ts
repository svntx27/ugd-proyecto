export interface RoleMeta {
    code: string;
    label: string;
    shortLabel: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
    dotClass: string;
    description: string;
}

export const ROLE_CONFIGS: Record<string, RoleMeta> = {
    DIRECTOR: {
        code: "DIRECTOR",
        label: "Director de Unidad",
        shortLabel: "Director",
        bgClass: "bg-role-director-bg",
        borderClass: "border-role-director-border",
        textClass: "text-role-director",
        dotClass: "bg-role-director-dot",
        description: "Gestión ejecutiva y aprobación institucional UGD",
    },
    DESARROLLADOR: {
        code: "DESARROLLADOR",
        label: "Desarrollador de Sistemas",
        shortLabel: "Desarrollador",
        bgClass: "bg-role-dev-bg",
        borderClass: "border-role-dev-border",
        textClass: "text-role-dev",
        dotClass: "bg-role-dev-dot",
        description: "Control técnico integral y arquitectura",
    },
    ANALISTA_PROCESOS: {
        code: "ANALISTA_PROCESOS",
        label: "Analista de Procesos",
        shortLabel: "Procesos",
        bgClass: "bg-role-process-bg",
        borderClass: "border-role-process-border",
        textClass: "text-role-process",
        dotClass: "bg-role-process-dot",
        description: "Gestión operativa de citas y trámites doctorales",
    },
    ANALISTA_TECNICO: {
        code: "ANALISTA_TECNICO",
        label: "Analista Técnico",
        shortLabel: "Técnico",
        bgClass: "bg-role-tech-bg",
        borderClass: "border-role-tech-border",
        textClass: "text-role-tech",
        dotClass: "bg-role-tech-dot",
        description: "Soporte de infraestructura y diagnóstico operativo",
    },
    ESTUDIANTE: {
        code: "ESTUDIANTE",
        label: "Estudiante Doctorando",
        shortLabel: "Estudiante",
        bgClass: "bg-surface-subtle",
        borderClass: "border-border",
        textClass: "text-foreground-soft",
        dotClass: "bg-accent",
        description: "Estudiante del programa doctoral UCE",
    },
};

export function getRoleMeta(roleCode?: string): RoleMeta {
    if (!roleCode) {
        return {
            code: "ADMIN",
            label: "Administrador del Sistema",
            shortLabel: "Admin",
            bgClass: "bg-role-dev-bg",
            borderClass: "border-role-dev-border",
            textClass: "text-role-dev",
            dotClass: "bg-role-dev-dot",
            description: "Personal administrativo de la unidad",
        };
    }

    const normalized = roleCode.toUpperCase().trim();
    if (ROLE_CONFIGS[normalized]) {
        return ROLE_CONFIGS[normalized];
    }

    return {
        code: normalized,
        label: normalized.replace(/_/g, " "),
        shortLabel: normalized.replace(/_/g, " "),
        bgClass: "bg-surface-hover",
        borderClass: "border-border",
        textClass: "text-foreground-soft",
        dotClass: "bg-muted-foreground",
        description: "Usuario con privilegios administrativos",
    };
}
