# 🔐 02 - Matriz RBAC y Usuarios

Este documento describe el modelo de **Control de Acceso Basado en Roles (RBAC)** de la API Express, la definición de roles, la matriz de permisos relacionales y las cuentas de usuario sembradas en la base de datos.

---

## 🎯 Concepto RBAC en la Aplicación

El sistema evalúa **permisos relacionales en base de datos** para proteger endpoints dinámicos, complementándolos con middleware de restricción de roles (`requireRole`) para operaciones administrativas de alto impacto (como agendamiento masivo, gestión de representantes y respaldos).

```text
Usuario ──> posee un ──> Rol ──> tiene asignados ──> Permisos
```

### Arquitectura de Middleware
1. `authenticateToken`: Extrae y valida el JWT en la cabecera `Authorization: Bearer <token>`, inyectando `req.user`.
2. `checkPermission(code)`: Consulta en base de datos si el rol del usuario posee el permiso especificado en `role_permissions`.
3. `requireRole(...roles)`: Verifica que el código de rol de `req.user` pertenezca a la lista de roles autorizados.

---

## 👑 Definición de Roles y Niveles de Acceso

| Rol (`code`) | Nivel de Acceso | Descripción Funcional |
| ------------ | --------------- | --------------------- |
| **`DESARROLLADOR`** | 🔴 Completo Técnico | Acceso total en entorno local y de desarrollo. Administración de usuarios, citas, representantes, configuraciones técnicas y exportación de respaldos. |
| **`DIRECTOR`** | 🔴 Completo Funcional | Acceso administrativo completo a las operaciones funcionales de la Unidad (gestión de usuarios, monitoreo de citas presenciales, modificación de representantes y respaldos). |
| **`ANALISTA_PROCESOS`** | 🟠 Administrativo Limitado | Gestión funcional de citas, reasignaciones y representantes UGD. Sin administración técnica o creación de usuarios administradores. |
| **`ANALISTA_TECNICO`** | 🟠 Administrativo Técnico | Acceso a operaciones técnicas, consulta de disponibilidad, monitoreo de diagnósticos y gestión administrativa de citas. |
| **`ESTUDIANTE`** | 🟢 Usuario Estudiantil | Agendamiento autónomo de citas presenciales, consulta de disponibilidad, visualización de "mis citas" y cancelación de sus propias reservas. Activación mediante `/api/auth/activar-cuenta` o registro manual vía `/api/auth/register`. |

---

## 🔑 Catálogo de Permisos

| Categoría | Código de Permiso (`code`) | Nombre | Descripción |
| --------- | -------------------------- | ------ | ----------- |
| **Usuarios** | `USUARIOS_VER` | Visualizar usuarios | Permite listar y consultar datos de usuarios |
| **Usuarios** | `USUARIOS_CREAR` | Crear usuarios | Permite registrar nuevos usuarios |
| **Usuarios** | `USUARIOS_EDITAR` | Editar usuarios | Permite modificar la información y estado de usuarios |
| **Usuarios** | `USUARIOS_ELIMINAR` | Eliminar usuarios | Permite desactivar o eliminar usuarios |
| **Procesos** | `PROCESOS_VER` | Visualizar procesos | Permite consultar procesos universitarios |
| **Procesos** | `PROCESOS_CREAR` | Crear procesos | Permite registrar nuevos procesos |
| **Procesos** | `PROCESOS_EDITAR` | Editar procesos | Permite modificar procesos existentes |
| **Procesos** | `PROCESOS_ELIMINAR` | Eliminar procesos | Permite eliminar o archivar procesos |
| **Estudiantes** | `ESTUDIANTES_VER` | Visualizar estudiantes | Permite consultar información de estudiantes |
| **Estudiantes** | `ESTUDIANTES_CREAR` | Crear estudiantes | Permite registrar estudiantes |
| **Estudiantes** | `ESTUDIANTES_EDITAR` | Editar estudiantes | Permite actualizar datos de estudiantes |
| **Configuración** | `CONFIGURACION_VER` | Visualizar configuración | Permite consultar configuración funcional y del sistema |
| **Configuración** | `CONFIGURACION_EDITAR` | Editar configuración | Permite modificar parámetros y generar respaldos |
| **Técnico** | `TECNICO_ACCESO` | Acceso técnico | Diagnóstico y monitoreo técnico |
| **Técnico** | `TECNICO_GESTION` | Gestión técnica | Modificaciones de estructura y desarrollo |

---

## 📊 Matriz de Permisos por Rol

| Permiso (`code`) | DESARROLLADOR | DIRECTOR | ANALISTA_PROCESOS | ANALISTA_TECNICO | ESTUDIANTE |
| ---------------- | :-----------: | :------: | :---------------: | :--------------: | :--------: |
| `USUARIOS_VER` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `USUARIOS_CREAR` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `USUARIOS_EDITAR` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `USUARIOS_ELIMINAR` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `PROCESOS_VER` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PROCESOS_CREAR` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `PROCESOS_EDITAR` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `PROCESOS_ELIMINAR` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `ESTUDIANTE_VER` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `ESTUDIANTES_CREAR` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `ESTUDIANTES_EDITAR` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `CONFIGURACION_VER` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `CONFIGURACION_EDITAR` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `TECNICO_ACCESO` | ✅ | ❌ | ❌ | ✅ | ❌ |
| `TECNICO_GESTION` | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Total Permisos** | **15** | **13** | **6** | **4** | **2** |

---

## 🔐 Matriz de Acceso a Módulos Específicos (Citas, Representantes y Ajustes)

Para la gestión de citas presenciales, representantes y respaldos del sistema, la API aplica middleware de autenticación y verificación de roles administrativos:

| Módulo / Operación | Endpoints | Roles Autorizados |
| ------------------ | --------- | ----------------- |
| **Verificación de Doctorando** | `POST /api/auth/verificar-doctorando` (alias `/verify-doctorando`) | Público (Valida cédula y correo en nómina) |
| **Activación de Cuenta Doctorando** | `POST /api/auth/activar-cuenta` (alias `/activate`) | Público (Crea credenciales y vincula ficha) |
| **Registro de Estudiantes (Manual)** | `POST /api/auth/register` | Público |
| **Login General** | `POST /api/auth/login` | Público |
| **Login Administrativo** | `POST /api/auth/admin-login` | Público (Valida rol administrativo) |
| **Ver Representantes / Disponibilidad** | `GET /api/representatives/*` | Público / Autenticado |
| **Agendar Cita / Ver Mis Citas** | `POST /agendar`, `GET /mis-citas` | Cualquier usuario Autenticado (`ESTUDIANTE` y Admin) |
| **Cancelar Cita Propia** | `DELETE /citas/:id` | Usuario dueño de la cita |
| **Gestión Admin de Citas** | `GET /admin`, `DELETE /admin/:id`, `PATCH /admin/:id/reschedule` | `DESARROLLADOR`, `DIRECTOR`, `ANALISTA_PROCESOS`, `ANALISTA_TECNICO` |
| **Gestión de Representantes UGD** | `POST /`, `PUT /:id`, `DELETE /:id` | `DESARROLLADOR`, `DIRECTOR`, `ANALISTA_PROCESOS`, `ANALISTA_TECNICO` |
| **Ajustes y Respaldos DB** | `POST /settings/bulk`, `POST /settings/backup` | `DESARROLLADOR`, `DIRECTOR`, `ANALISTA_PROCESOS`, `ANALISTA_TECNICO` |

---

## 👥 Cuentas de Usuario Sembradas Inicialmente

Estas cuentas de prueba se encuentran generadas en Neon PostgreSQL mediante `bun run db:seed` con contraseñas encriptadas (`bcrypt`):

| # | Nombre Completo | Tipo de Usuario | Rol (`code`) | Correo Electrónico | Contraseña Plana | Ficha Académica Asociada |
| -: | --------------- | --------------- | ------------ | ------------------ | ---------------- | ------------------------- |
| 1 | Galo Javier González Hernandez | Personal UGD | `DIRECTOR` | `galo.gonzalez@uce.edu.ec` | `Galo123` | N/A (Personal Directivo UGD) |
| 2 | Abigail | Personal UGD | `ANALISTA_PROCESOS` | `abigail.analista@uce.edu.ec` | `Abi123` | N/A (Analista UGD) |
| 3 | Andrés | Personal UGD | `ANALISTA_TECNICO` | `andres.analista@uce.edu.ec` | `Andres123` | N/A (Analista UGD) |
| 4 | Dennis Adrian Trujillo Vistin | Estudiante | `ESTUDIANTE` | `dennis.trujillo@uce.edu.ec` | `Dennis123` | Cédula: `1724567890`, Ficha `EN_ESTUDIOS`, Beca UCE, Devengamiento PENDIENTE |
| 5 | Freddy Xavier Tapia Rea | Estudiante | `ESTUDIANTE` | `freddy.tapia@uce.edu.ec` | `Freddy123` | Cédula: `1729876543`, Ficha `EN_DEVENGAMIENTO`, Devengamiento EN_CURSO |
| 6 | Desarrollador | Personal técnico | `DESARROLLADOR` | `dev@dev.ugd.local` | `Dev123` | N/A (Cuenta técnica protegida) |

> 💡 **Nota para Pruebas de Frontend**: Dennis y Freddy cuentan con fichas académicas y expedientes doctorales simulados completos vinculados a sus cuentas (`user.doctorando`). Se pueden utilizar libremente para probar las vistas del estudiante sin alterar los más de 550 doctorandos oficiales de la nómina UGD.
