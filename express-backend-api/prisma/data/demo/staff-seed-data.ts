/**
 * Datos iniciales para configuración del sistema y cuentas de personal UGD.
 * 
 * NOTA PARA DESPLIEGUE FINAL / PRODUCCIÓN:
 * Para actualizar a la lista oficial de funcionarios entregada por la UGD,
 * simplemente actualice los objetos en `staffUsersToSeed` con los nombres,
 * correos institucionales y contraseñas definitivas asignadas.
 */

export interface PermissionSeed {
  code: string;
  name: string;
  category: string;
  description: string;
}

export interface RoleSeed {
  code: string;
  name: string;
  description: string;
}

export interface RolePermissionAssignment {
  roleCode: string;
  permCodes: string[];
}

export interface StaffUserSeed {
  name: string;
  userType: string;
  roleCode: string;
  email: string;
  plainPassword: string;
  // Campos para crear el perfil como Representante de citas UGD (opcional)
  representative?: {
    title: string;
    location: string;
    capacity: number;
    status: "activo" | "inactivo";
  };
}

export interface SystemSettingSeed {
  key: string;
  value: string;
  description: string;
}

export const permissionsData: PermissionSeed[] = [
  // Usuarios
  { code: "USUARIOS_VER", name: "Visualizar usuarios", category: "Usuarios", description: "Permite listar y ver detalles de usuarios" },
  { code: "USUARIOS_CREAR", name: "Crear usuarios", category: "Usuarios", description: "Permite registrar nuevos usuarios" },
  { code: "USUARIOS_EDITAR", name: "Editar usuarios", category: "Usuarios", description: "Permite modificar información de usuarios" },
  { code: "USUARIOS_ELIMINAR", name: "Eliminar usuarios", category: "Usuarios", description: "Permite desactivar o eliminar usuarios" },

  // Procesos
  { code: "PROCESOS_VER", name: "Visualizar procesos", category: "Procesos", description: "Permite consultar los procesos universitarios" },
  { code: "PROCESOS_CREAR", name: "Crear procesos", category: "Procesos", description: "Permite registrar nuevos procesos" },
  { code: "PROCESOS_EDITAR", name: "Editar procesos", category: "Procesos", description: "Permite modificar procesos existentes" },
  { code: "PROCESOS_ELIMINAR", name: "Eliminar procesos", category: "Procesos", description: "Permite eliminar o archivar procesos" },

  // Estudiantes
  { code: "ESTUDIANTES_VER", name: "Visualizar estudiantes", category: "Estudiantes", description: "Permite consultar información académica de estudiantes" },
  { code: "ESTUDIANTES_CREAR", name: "Crear estudiantes", category: "Estudiantes", description: "Permite registrar nuevos estudiantes" },
  { code: "ESTUDIANTES_EDITAR", name: "Editar estudiantes", category: "Estudiantes", description: "Permite actualizar datos de estudiantes" },

  // Configuración
  { code: "CONFIGURACION_VER", name: "Visualizar configuración", category: "Configuración", description: "Permite consultar la configuración del sistema" },
  { code: "CONFIGURACION_EDITAR", name: "Editar configuración", category: "Configuración", description: "Permite modificar parámetros del sistema" },

  // Técnico
  { code: "TECNICO_ACCESO", name: "Acceso técnico", category: "Técnico", description: "Acceso a utilidades de mantenimiento y diagnóstico" },
  { code: "TECNICO_GESTION", name: "Gestión técnica", category: "Técnico", description: "Permite aplicar cambios de desarrollo y configuración técnica" },
];

export const rolesData: RoleSeed[] = [
  {
    code: "DESARROLLADOR",
    name: "Desarrollador",
    description: "Acceso completo técnico y funcional en ambiente de desarrollo.",
  },
  {
    code: "DIRECTOR",
    name: "Director de Unidad",
    description: "Acceso completo funcional y administrativo a las operaciones de la Unidad.",
  },
  {
    code: "ANALISTA_PROCESOS",
    name: "Analista de Procesos",
    description: "Acceso limitado a la consulta y gestión de procesos universitarios.",
  },
  {
    code: "ANALISTA_TECNICO",
    name: "Analista Técnico",
    description: "Acceso limitado a funcionalidades y datos de carácter técnico.",
  },
  {
    code: "ESTUDIANTE",
    name: "Estudiante",
    description: "Acceso de solo lectura a la información pública o autorizada.",
  },
];

export const rolePermissionAssignments: RolePermissionAssignment[] = [
  {
    roleCode: "DESARROLLADOR",
    permCodes: permissionsData.map((p) => p.code),
  },
  {
    roleCode: "DIRECTOR",
    permCodes: [
      "USUARIOS_VER", "USUARIOS_CREAR", "USUARIOS_EDITAR", "USUARIOS_ELIMINAR",
      "PROCESOS_VER", "PROCESOS_CREAR", "PROCESOS_EDITAR", "PROCESOS_ELIMINAR",
      "ESTUDIANTES_VER", "ESTUDIANTES_CREAR", "ESTUDIANTES_EDITAR",
      "CONFIGURACION_VER", "CONFIGURACION_EDITAR",
    ],
  },
  {
    roleCode: "ANALISTA_PROCESOS",
    permCodes: [
      "USUARIOS_VER",
      "PROCESOS_VER", "PROCESOS_CREAR", "PROCESOS_EDITAR", "PROCESOS_ELIMINAR",
      "ESTUDIANTES_VER",
    ],
  },
  {
    roleCode: "ANALISTA_TECNICO",
    permCodes: [
      "USUARIOS_VER",
      "PROCESOS_VER", "PROCESOS_EDITAR",
      "TECNICO_ACCESO",
    ],
  },
  {
    roleCode: "ESTUDIANTE",
    permCodes: [
      "PROCESOS_VER",
      "ESTUDIANTES_VER",
    ],
  },
];

export const staffUsersToSeed: StaffUserSeed[] = [
  {
    name: "Galo Javier González Hernandez",
    userType: "Personal UGD",
    roleCode: "DIRECTOR",
    email: "galo.gonzalez@uce.edu.ec",
    plainPassword: "Galo123",
    representative: {
      title: "Director UGD",
      location: "Unidad de Gestión de Doctorados",
      capacity: 1,
      status: "activo",
    },
  },
  {
    name: "Abigail",
    userType: "Personal UGD",
    roleCode: "ANALISTA_PROCESOS",
    email: "abigail.analista@uce.edu.ec",
    plainPassword: "Abi123",
    representative: {
      title: "Analista de Procesos",
      location: "Unidad de Gestión de Doctorados",
      capacity: 1,
      status: "activo",
    },
  },
  {
    name: "Andrés",
    userType: "Personal UGD",
    roleCode: "ANALISTA_TECNICO",
    email: "andres.analista@uce.edu.ec",
    plainPassword: "Andres123",
    representative: {
      title: "Analista Técnico",
      location: "Unidad de Gestión de Doctorados",
      capacity: 1,
      status: "activo",
    },
  },
  {
    name: "Desarrollador",
    userType: "Personal técnico",
    roleCode: "DESARROLLADOR",
    email: "dev@dev.ugd.local",
    plainPassword: "Dev123",
  },
];

export const systemSettingsToSeed: SystemSettingSeed[] = [
  { key: "system_status", value: "online", description: "Estado global del servicio de reservas" },
  { key: "max_turns_per_day", value: "6", description: "Límite máximo de horas de reserva diarias por usuario" },
];
