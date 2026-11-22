# 📚 Documentación Técnica Backend API - Proyecto Integrador UGD

Bienvenido a la documentación oficial del backend para el **Proyecto Integrador UGD** (Sistema de Agendamiento de Citas Presenciales y Gestión de Doctorandos de la Unidad de Gestión de Doctorados - Universidad Central del Ecuador).

Este repositorio contiene la API REST desarrollada con **Express**, **TypeScript** y **Bun**, conectada a una base de datos relacional PostgreSQL alojada en **NeonTech** mediante el ORM **Prisma**.

---

## 🚀 Resumen del Sistema

El backend actúa como la capa central de negocio y comunicación para la gestión de citas presenciales de la Unidad de Gestión de Doctorados (UGD). Soporta interacciones tanto desde portales estudiantiles como desde la plataforma de administración.

Cuenta con:
- **Autenticación y Activación Segura**: JSON Web Tokens (JWT) con soporte para inicio de sesión, registro manual y un flujo institucional de **Activación de Cuentas** para los doctorandos de la nómina oficial.
- **Control de Acceso Basado en Roles (RBAC)**: Matriz dinámica almacenada en base de datos.
- **Gestión de Citas y Disponibilidad**: Algoritmo dinámico de franjas horarias configurables y cálculo de estados (`active`, `expired`, `cancelled`).
- **Nómina y Expedientes Doctorales**: Soporte integral para doctorandos, facultades, carreras, programas de doctorado, convenios y devengamientos.
- **Personal/Representantes UGD**: Administración de analistas y representantes de atención presencial.
- **Configuración del Sistema y Respaldos**: Gestión de parámetros llave-valor en tiempo real y exportación de respaldos JSON con autorización de contraseña.
- **Compatibilidad y Rutas Duales**: Soporte simultáneo para rutas con prefijo `/api/*` y rutas directas, además de alias de compatibilidad (`/personal-ugd`, `/citas`, `/reservas`, `/labs`).

### Tecnologías Clave

- **Runtime**: [Bun](https://bun.sh/) (compatible con Node.js)
- **Framework Web**: Express 5.x
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL en [NeonTech](https://neon.tech/) (Región `aws-sa-east-1`)
- **ORM**: Prisma 6.4.0
- **Autenticación**: JSON Web Tokens (`jsonwebtoken`)
- **Seguridad**: Hasheo de contraseñas con `bcryptjs`
- **CORS**: Habilitado mediante `cors` con orígenes dinámicos autorizados

---

## 📂 Estructura de la Documentación

Para facilitar la lectura y el mantenimiento por parte del equipo de desarrollo, la documentación se divide en los siguientes módulos:

| Archivo | Descripción |
| ------- | ----------- |
| [📁 01 - Arquitectura y Base de Datos](01-arquitectura-y-bd.md) | Configuración del servidor, variables de entorno, esquema relacional de Prisma (16 tablas), diagramas ER y rutas duales/alias. |
| [📁 02 - Matriz RBAC y Usuarios](02-matriz-rbac-y-usuarios.md) | Definición completa de roles (`DESARROLLADOR`, `DIRECTOR`, `ANALISTA_PROCESOS`, `ANALISTA_TECNICO`, `ESTUDIANTE`), matriz de permisos y catálogo de cuentas sembradas. |
| [📁 03 - Mapeo de Endpoints API](03-mapeo-endpoints-api.md) | Catálogo completo de rutas HTTP de Autenticación, Activación de Doctorandos, Usuarios, Representantes UGD, Citas, Ajustes y Respaldos. |
| [📁 04 - Guía de Pruebas](04-guia-de-pruebas.md) | Manual paso a paso para probar la API con `curl`, verificación de doctorandos, activación de cuentas y comandos de sembrado. |
| [📁 05 - Módulo de Citas y Representantes](05-modulo-citas-y-representantes.md) | Guía técnica detallada sobre generación de franjas horarias, disponibilidad, cálculo dinámico de estado de citas y agendamiento múltiple. |
| [📁 06 - Módulo de Configuración y Respaldos](06-modulo-configuracion-y-backups.md) | Documentación sobre parámetros dinámicos del sistema (`system_settings`) y exportación segura de respaldos en JSON. |

---

## 🛠️ Comandos Rápidos

### Instalación de dependencias
```bash
bun install
```

### Iniciar en modo desarrollo
```bash
bun run dev
```

### Sincronizar esquema con la Base de Datos (Neon)
```bash
bun run db:push
```

### Opciones de Sembrado de Datos
```bash
# 1. Sembrado del sistema base (roles, permisos, Dennis y Freddy con fichas de prueba, representantes y settings)
bun run db:seed

# 2. Carga masiva de la nómina oficial (más de 550 doctorandos, facultades y carreras)
bun run db:seed:doctorandos

# 3. Sembrado completo en secuencia
bun run db:seed:all
```

### Abrir la consola gráfica de Prisma (Prisma Studio)
```bash
bun run db:studio
```

---

## 📂 Estructura del Código Fuente (`src/`)

```text
express-backend-api/
├── .env                       # Variables de entorno (DATABASE_URL, JWT_SECRET, PORT, CORS_ORIGIN)
├── package.json               # Dependencias y scripts
├── tsconfig.json              # Configuración de TypeScript
├── prisma/
│   ├── schema.prisma          # Esquema relacional unificado (16 modelos: Sistema Base + Dominio Académico)
│   ├── seed.ts                # Sembrado del sistema base + usuarios de prueba Dennis y Freddy
│   ├── seed-doctorandos.ts    # Script de carga masiva de doctorandos reales en lotes concurrentes
│   └── data/
│       └── import_neon_doctorandos.sql # Script SQL oficial con más de 550 doctorandos y facultades
├── src/
│   ├── lib/
│   │   └── prisma.ts          # Singleton de Prisma Client
│   ├── middleware/
│   │   └── auth.middleware.ts # Middlewares de autenticación JWT y verificación RBAC
│   ├── controllers/
│   │   ├── auth.controller.ts            # Login, Admin Login, Activación de Cuentas, Verificación y Perfil
│   │   ├── appointments.controller.ts    # Agendamiento, consulta, cancelación y reagendamiento de citas
│   │   ├── representatives.controller.ts # Gestión y disponibilidad de representantes UGD
│   │   └── settings.controller.ts       # Parámetros del sistema y respaldos de la BD
│   ├── routes/
│   │   ├── auth.routes.ts             # Endpoints /auth y /api/auth (incluye /activar-cuenta y /verificar-doctorando)
│   │   ├── users.routes.ts            # Endpoints /users y /api/users
│   │   ├── appointments.routes.ts     # Endpoints /appointments, /citas, /reservas
│   │   ├── representatives.routes.ts  # Endpoints /representatives, /personal-ugd, /labs
│   │   ├── settings.routes.ts         # Endpoints /settings y /api/settings
│   │   ├── procesos.routes.ts         # Endpoints /api/procesos
│   │   └── tecnico.routes.ts          # Endpoints /api/tecnico
│   └── server.ts                      # Servidor Express, CORS, montaje de rutas y health check
└── docu/                              # Documentación técnica completa
```
