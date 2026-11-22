# 🔌 03 - Mapeo de Endpoints API

Este documento especifica el catálogo completo de rutas HTTP de la API Express UGD, incluyendo requerimientos de autenticación, estructuras de Request Body, respuestas JSON, códigos de estado HTTP y alias de compatibilidad.

---

## 🌐 Información General

- **Base URL (Local)**: `http://localhost:3000`
- **Soporte de Prefijo Dual**: Los endpoints están disponibles tanto con prefijo `/api` (ej. `/api/auth/login`) como directo (ej. `/auth/login`).
- **Formato de datos**: `application/json`
- **Cabecera de Autenticación**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```

---

## 🗺️ Tabla Resumen de Endpoints

### 🔑 1. Autenticación y Activación de Cuentas (`/api/auth` o `/auth`)

| Método | Endpoint | Acceso / Permiso | Descripción |
| ------ | -------- | ---------------- | ----------- |
| `POST` | `/verificar-doctorando` | Público | Valida si la cédula y correo coinciden con la nómina UGD y si la cuenta ya está activada. *(Alias: `/verify-doctorando`)* |
| `POST` | `/activar-cuenta` | Público | Activa la cuenta del doctorando creando su usuario/contraseña y vinculando su ficha académica. *(Alias: `/activate`)* |
| `POST` | `/login` | Público | Autentica a cualquier usuario (estudiante o personal UGD) y retorna JWT + ficha de doctorando si existe. |
| `POST` | `/admin-login` | Público | Autentica exclusivamente a usuarios con rol administrativo (`DESARROLLADOR`, `DIRECTOR`, etc.). |
| `POST` | `/register` | Público | Registro autónomo general para estudiantes (`ESTUDIANTE`). |
| `GET` | `/me` | Autenticado | Retorna el perfil, permisos y ficha doctoral en tiempo real del usuario actual. |

### 👥 2. Gestión de Usuarios (`/api/users` o `/users`)

| Método | Endpoint | Acceso / Permiso | Descripción |
| ------ | -------- | ---------------- | ----------- |
| `GET` | `/` | `USUARIOS_VER` | Lista todos los usuarios ordenados por fecha de creación decreciente. |
| `PUT` | `/:id` | `USUARIOS_EDITAR` | Actualiza nombre o estado activo/inactivo de un usuario. Protege cuenta de desarrollador. |
| `GET` | `/roles` | `USUARIOS_VER` | Lista los roles y sus permisos asignados en la matriz RBAC. |

### 👔 3. Representantes UGD (`/api/representatives` o `/representatives` \| Alias: `/personal-ugd`, `/labs`)

| Método | Endpoint | Acceso / Permiso | Descripción |
| ------ | -------- | ---------------- | ----------- |
| `GET` | `/` | Público / Autenticado | Lista todos los representantes / analistas UGD activos e inactivos. |
| `GET` | `/disponibilidad` | Público / Autenticado | Consulta la disponibilidad de franjas horarias para una fecha y representante. |
| `POST` | `/` | Admin (`requireRole`) | Registra un nuevo representante UGD. |
| `PUT` | `/:id` | Admin (`requireRole`) | Modifica datos o estado de un representante UGD. |
| `DELETE` | `/:id` | Admin (`requireRole`) | Elimina un representante UGD si no tiene citas asociadas. |

### 📅 4. Citas Presenciales / Reservas (`/api/appointments` o `/appointments` \| Alias: `/citas`, `/reservas`)

| Método | Endpoint | Acceso / Permiso | Descripción |
| ------ | -------- | ---------------- | ----------- |
| `POST` | `/agendar` (o `/reservar`) | Autenticado | Agenda una o varias franjas horarias para una cita presencial. |
| `GET` | `/mis-citas` (o `/mis-reservas`) | Autenticado | Obtiene las citas del usuario con estado dinámico (`active`, `expired`, `cancelled`). |
| `DELETE` | `/citas/:id` (o `/reservas/:id`) | Autenticado (Dueño) | Cancela la cita propia de un estudiante. |
| `GET` | `/admin` (o `/admin/reservas`) | Admin (`requireRole`) | Obtiene todas las citas del sistema con datos del representante y usuario. |
| `DELETE` | `/admin/:id` (o `/admin/reservas/:id`) | Admin (`requireRole`) | Cancela/elimina cualquier cita presencial como administrador. |
| `PATCH` | `/admin/:id/reschedule` | Admin (`requireRole`) | Reagenda fecha u hora de una cita como administrador. |

### ⚙️ 5. Configuración y Respaldos (`/api/settings` o `/settings`)

| Método | Endpoint | Acceso / Permiso | Descripción |
| ------ | -------- | ---------------- | ----------- |
| `GET` | `/` | Público / Autenticado | Obtiene todos los parámetros dinámicos del sistema (`system_settings`). |
| `POST` / `PUT` | `/` | Admin (`requireRole`) | Crea o actualiza un parámetro `key`-`value`. |
| `POST` | `/bulk` | Admin (`requireRole`) | Actualización masiva en transacción de múltiples configuraciones. |
| `POST` | `/backup` | Admin (`requireRole`) | Genera y descarga un respaldo completo JSON de la BD tras verificar contraseña. |

---

## 📄 Especificación Detallada de Endpoints

### 1. Verificación de Doctorando (`POST /api/auth/verificar-doctorando`)

Permite a la interfaz de usuario verificar de forma no destructiva si el estudiante consta en la nómina de la UGD antes de solicitarle que defina su contraseña.

- **Ruta**: `/api/auth/verificar-doctorando` (Alias: `/api/auth/verify-doctorando`)
- **Acceso**: Público

#### Request Body
```json
{
  "cedula": "1713386140",
  "correo": "flugmania@uce.edu.ec"
}
```

#### Respuesta Exitosa (`200 OK`)
```json
{
  "valid": true,
  "alreadyActivated": false,
  "message": "Estudiante doctorando verificado exitosamente y listo para activación.",
  "doctorando": {
    "id": "doc_1",
    "cedula": "1713386140",
    "nombres": "Fabio Luis",
    "apellidos": "Lugmania Egas",
    "nombreCompleto": "Fabio Luis Lugmania Egas",
    "correoInstitucional": "flugmania@uce.edu.ec",
    "facultad": "Ciencias Administrativas",
    "carrera": "Ingeniería Comercial",
    "programa": "Doctorado en Administración de Empresas",
    "estadoAcademico": "EN_ESTUDIOS"
  }
}
```

#### Respuesta Si ya fue activado (`409 Conflict`)
```json
{
  "valid": false,
  "alreadyActivated": true,
  "error": "Esta cuenta de doctorando ya ha sido activada previamente. Puede iniciar sesión directamente con su correo y contraseña.",
  "nombres": "Fabio Luis",
  "apellidos": "Lugmania Egas"
}
```

---

### 2. Activación de Cuenta Doctorando (`POST /api/auth/activar-cuenta`)

Crea la cuenta de usuario en `users`, hashea la contraseña y vincula formalmente el `userId` con el expediente en `doctorandos`. Emite sesión inmediata.

- **Ruta**: `/api/auth/activar-cuenta` (Alias: `/api/auth/activate`)
- **Acceso**: Público

#### Request Body
```json
{
  "cedula": "1713386140",
  "correo": "flugmania@uce.edu.ec",
  "password": "MiPasswordSeguro123"
}
```

#### Respuesta Exitosa (`201 Created`)
```json
{
  "message": "¡Cuenta activada exitosamente! Bienvenido al Sistema de Citas y Gestión Doctoral UGD.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "student",
  "role_code": "ESTUDIANTE",
  "full_name": "Fabio Luis Lugmania Egas",
  "user": {
    "id": "d98124b1-e234-4bc1-9012-ac548171bf81",
    "name": "Fabio Luis Lugmania Egas",
    "email": "flugmania@uce.edu.ec",
    "userType": "Estudiante",
    "role": {
      "id": "2e796078-43d9-4ab7-b892-0bcaed67eb21",
      "code": "ESTUDIANTE",
      "name": "Estudiante",
      "description": "Acceso de solo lectura a la información pública o autorizada."
    },
    "permissions": ["PROCESOS_VER", "ESTUDIANTES_VER"],
    "doctorando": {
      "id": "doc_1",
      "cedula": "1713386140",
      "nombres": "Fabio Luis",
      "apellidos": "Lugmania Egas",
      "correoInstitucional": "flugmania@uce.edu.ec",
      "facultad": "Ciencias Administrativas",
      "carrera": "Ingeniería Comercial",
      "expedientes": [
        {
          "id": "exp_1",
          "estado": "EN_ESTUDIOS",
          "programa": "Doctorado en Administración de Empresas",
          "tituloInvestigacion": "Modelo de Gestión Estratégica para PYMES"
        }
      ]
    }
  }
}
```

---

### 3. Inicio de Sesión (`POST /api/auth/login`)

- **Ruta**: `/api/auth/login` (o `/auth/login`)
- **Acceso**: Público

#### Request Body
```json
{
  "email": "dennis.trujillo@uce.edu.ec",
  "password": "Dennis123"
}
```

#### Respuesta Exitosa (`200 OK`)
Retorna el token JWT, los roles, permisos y la propiedad `doctorando` con la ficha académica del estudiante (o `null` para funcionarios que no son estudiantes):
```json
{
  "message": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "student",
  "role_code": "ESTUDIANTE",
  "full_name": "Dennis Adrian Trujillo Vistin",
  "user": {
    "id": "c1a93a62-4217-48f8-a15d-bc93f21a8b99",
    "name": "Dennis Adrian Trujillo Vistin",
    "email": "dennis.trujillo@uce.edu.ec",
    "userType": "Estudiante",
    "role": {
      "id": "2e796078-43d9-4ab7-b892-0bcaed67eb21",
      "code": "ESTUDIANTE",
      "name": "Estudiante"
    },
    "permissions": ["PROCESOS_VER", "ESTUDIANTES_VER"],
    "doctorando": {
      "id": "doc_test_dennis",
      "cedula": "1724567890",
      "nombres": "Dennis Adrian",
      "apellidos": "Trujillo Vistin",
      "correoInstitucional": "dennis.trujillo@uce.edu.ec",
      "facultad": "Ingeniería y Ciencias Aplicadas",
      "carrera": "Sistemas de Información",
      "expedientes": [
        {
          "id": "exp_test_dennis",
          "estado": "EN_ESTUDIOS",
          "programa": "Doctorado en Informática y Ciencias de la Computación",
          "tituloInvestigacion": "Optimización de Algoritmos Distribuidos y Agentes Autónomos para Plataformas Universitarias"
        }
      ]
    }
  }
}
```

---

### 4. Consultar Disponibilidad de Franjas (`GET /api/representatives/disponibilidad`)

- **Ruta**: `/api/representatives/disponibilidad` (o `/personal-ugd/disponibilidad`)
- **Query Params**: `fecha` (YYYY-MM-DD), `representative_id` (o `lab_id`)
- **Ejemplo**: `GET /api/representatives/disponibilidad?fecha=2026-08-20&representative_id=1`

#### Respuesta Exitosa (`200 OK`)
```json
[
  {
    "hora": "08:00",
    "decimal_hour": 8.0,
    "time_slot": "08:00",
    "start_time": "08:00",
    "estado": "libre"
  },
  {
    "hora": "08:30",
    "decimal_hour": 8.5,
    "time_slot": "08:30",
    "start_time": "08:30",
    "estado": "ocupado"
  }
]
```

---

### 5. Agendar Cita Presencial (`POST /api/appointments/agendar`)

- **Ruta**: `/api/appointments/agendar` (o `/citas/agendar`, `/reservas/reservar`)
- **Acceso**: Autenticado JWT

#### Request Body
```json
{
  "representative_id": 1,
  "fecha": "2026-08-20",
  "horas": ["09:00", "09:30"],
  "materia": "Tutoría de Tesis Doctoral"
}
```

#### Respuesta Exitosa (`201 Created`)
```json
[
  {
    "id": 15,
    "representative_id": 1,
    "fecha": "2026-08-20",
    "hora_inicio": "09:00",
    "materia": "Tutoría de Tesis Doctoral",
    "estado": "activa"
  }
]
```

---

### 6. Exportar Respaldo de la Base de Datos (`POST /api/settings/backup`)

- **Ruta**: `/api/settings/backup`
- **Acceso**: Autenticado JWT + Rol Administrativo

#### Request Body
```json
{
  "password": "Galo123"
}
```

#### Respuesta Exitosa (`200 OK`)
Descarga directa del archivo JSON `UGD_Database_Backup_2026-08-16.json` con conteos y la totalidad de tablas serializadas.

---

## ⚠️ Respuestas de Error Estándar

### `400 Bad Request`
```json
{ "error": "Se requieren los campos 'cedula', 'correo' (o email) y 'password'" }
```

### `401 Unauthorized`
```json
{ "error": "Credenciales inválidas o usuario inactivo" }
```

### `403 Forbidden`
```json
{ "error": "Acceso denegado. Se requiere uno de los siguientes roles [DIRECTOR, DESARROLLADOR]." }
```

### `404 Not Found`
```json
{ "error": "No se encontró ningún estudiante doctorando registrado con los datos proporcionados." }
```

### `409 Conflict` (Cuenta ya activada u horario ocupado)
```json
{ "error": "Esta cuenta de doctorando ya se encuentra activada. Puede iniciar sesión directamente con su correo y contraseña." }
```
