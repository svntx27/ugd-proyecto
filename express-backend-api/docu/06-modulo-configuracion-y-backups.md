# ⚙️ 06 - Módulo de Configuración del Sistema y Respaldos

Este documento detalla la arquitectura técnica del motor de **Configuraciones Dinámicas** (`system_settings`) y el sistema de **Respaldo de Base de Datos Protegido por Contraseña**.

---

## 🎯 Propósito del Módulo

El sistema requiere flexibilidad operativa sin necesidad de modificar variables de entorno ni reiniciar el servidor Express para cambiar parámetros como el horario de atención, el intervalo de citas o el estado del portal.

Asimismo, el módulo de administración incluye un mecanismo de **Exportación e Integridad de Datos** que permite generar copias de respaldo completas en formato JSON serializado directamente desde PostgreSQL en NeonTech, exigiendo una doble verificación de seguridad basada en contraseña.

---

## ⚙️ Parámetros del Sistema (`SystemSetting`)

La tabla `system_settings` almacena configuraciones `key`-`value` dinamizables.

### Esquema Prisma
```prisma
model SystemSetting {
  id          String   @id @default(uuid())
  key         String   @unique
  value       String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("system_settings")
}
```

### Catálogo de Parámetros Sembrados por Defecto

| Clave (`key`) | Valor por Defecto | Descripción Funcional |
| ------------- | ----------------- | --------------------- |
| `start_hour` | `"08:00"` | Hora de inicio de la jornada de atención presencial. |
| `end_hour` | `"16:00"` | Hora de finalización de la jornada de atención. |
| `slot_interval` | `"30"` | Duración en minutos de cada franja horaria. |
| `max_daily_reservations` | `"3"` | Número máximo de citas que un estudiante puede agendar por día. |
| `system_status` | `"online"` | Estado operacional global del sistema (`online` / `maintenance`). |

---

## 🔄 Actualización Masiva de Configuraciones (`bulkUpdateSettings`)

El endpoint `POST /api/settings/bulk` permite actualizar múltiples parámetros simultáneamente dentro de una transacción relacional:

```typescript
const keys = Object.keys(settings);
const updates = keys.map((key) =>
  prisma.systemSetting.upsert({
    where: { key },
    update: { value: String(settings[key]) },
    create: { key, value: String(settings[key]) },
  })
);

await prisma.$transaction(updates);
```

---

## 🛡️ Mecanismo de Respaldo Seguro (`exportDatabaseBackup`)

La exportación de la base de datos se realiza a través de `POST /api/settings/backup`. Este procedimiento implementa un esquema de **Autorización de Doble Factor por Contraseña**.

### Diagrama del Flujo de Respaldo

```text
  [Cliente Admin] ──> POST /api/settings/backup { password: "..." }
         │
         ▼
  ¿Token JWT válido? ──NO──> 401 Unauthorized
         │ SÍ
         ▼
  ¿Rol Administrativo? ──NO──> 403 Forbidden
         │ SÍ
         ▼
  Verificar bcrypt.compare(password, admin.password)
         │
         ├──> NO ──> 401 Unauthorized ("Contraseña incorrecta")
         │
         └──> SÍ ──> Extraer tablas en paralelo con Promise.all()
                       │
                       ▼
                 Construir Estructura JSON de Respaldo
                       │
                       ▼
                 Retornar descargas HTTP con cabecera
                 Content-Disposition: attachment
```

---

## 📦 Estructura del Archivo JSON de Respaldo

El archivo generado (ej. `UGD_Database_Backup_2026-08-16.json`) contiene la siguiente estructura estandarizada:

```json
{
  "system": "Sistema de Agendamiento Presencial - Unidad de Gestión de Doctorados (UGD)",
  "institution": "Universidad Central del Ecuador (UCE)",
  "exportedAt": "2026-08-16T21:35:00.000Z",
  "exportedBy": {
    "id": "e8a93a62-4217-48f8-a15d-bc93f21a8a25",
    "name": "Galo Javier González Hernandez",
    "email": "galo.gonzalez@uce.edu.ec"
  },
  "counts": {
    "users": 6,
    "roles": 5,
    "permissions": 15,
    "representatives": 2,
    "appointments": 12,
    "settings": 5
  },
  "data": {
    "users": [ ... ],
    "roles": [ ... ],
    "permissions": [ ... ],
    "rolePermissions": [ ... ],
    "representatives": [ ... ],
    "appointments": [ ... ],
    "settings": [ ... ]
  }
}
```

> 🔒 **Privacidad y Seguridad**: Las contraseñas encriptadas de los usuarios se excluyen del reporte serializado para proteger las credenciales almacenadas en la base de datos.
