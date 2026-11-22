# 🧪 04 - Guía de Pruebas

Esta guía detalla el procedimiento para ejecutar pruebas manuales y flujos con `curl`, Postman, Thunder Client o scripts TypeScript sobre la API Express UGD.

---

## ⚡ Preparación del Entorno

1. **Sincronizar el esquema con Neon PostgreSQL**:
   ```bash
   bun run db:push
   ```

2. **Opciones de Sembrado de Datos**:
   * **Sembrado del Sistema Base** (Roles, Permisos, Usuarios de prueba Dennis y Freddy con expedientes simulados, Representantes y Ajustes):
     ```bash
     bun run db:seed
     ```
   * **Carga Masiva de la Nómina Real UGD** (Más de 550 doctorandos, facultades, carreras y expedientes oficiales):
     ```bash
     bun run db:seed:doctorandos
     ```
   * **Sembrado Completo en Secuencia**:
     ```bash
     bun run db:seed:all
     ```

3. **Iniciar el servidor en modo desarrollo**:
   ```bash
   bun run dev
   ```
   El servidor estará escuchando en `http://localhost:3000`.

---

## 🧪 Flujos de Prueba con `curl`

### 1. Verificación Previa de Doctorando (`POST /api/auth/verificar-doctorando`)

Permite comprobar que un estudiante de la nómina existe y está disponible para activación:

```bash
curl -X POST http://localhost:3000/api/auth/verificar-doctorando \
  -H "Content-Type: application/json" \
  -d "{\"cedula\":\"1713386140\", \"correo\":\"flugmania@uce.edu.ec\"}"
```

**Respuesta Esperada (`200 OK`)**:
```json
{
  "valid": true,
  "alreadyActivated": false,
  "message": "Estudiante doctorando verificado exitosamente y listo para activación.",
  "doctorando": {
    "cedula": "1713386140",
    "nombreCompleto": "Fabio Luis Lugmania Egas",
    "correoInstitucional": "flugmania@uce.edu.ec",
    "facultad": "Ciencias Administrativas"
  }
}
```

---

### 2. Activación de Cuenta de Doctorando (`POST /api/auth/activar-cuenta`)

Crea la contraseña, el usuario en `User` y devuelve el JWT de sesión inmediata:

```bash
curl -X POST http://localhost:3000/api/auth/activar-cuenta \
  -H "Content-Type: application/json" \
  -d "{\"cedula\":\"1713386140\", \"correo\":\"flugmania@uce.edu.ec\", \"password\":\"Fabio12345\"}"
```

**Respuesta Esperada (`201 Created`)**: Devuelve el `token` de sesión, datos del usuario y su ficha doctoral vinculada.

---

### 3. Inicio de Sesión de Estudiante de Pruebas (`POST /api/auth/login`)

Inicio de sesión con los usuarios de prueba sembrados (Dennis o Freddy):

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"dennis.trujillo@uce.edu.ec\", \"password\":\"Dennis123\"}"
```

**Respuesta Esperada (`200 OK`)**: Devuelve el `token` JWT y la ficha académica en `user.doctorando` (Estado: `EN_ESTUDIOS`, Beca activa).

---

### 4. Inicio de Sesión Administrativo (`POST /api/auth/admin-login`)

```bash
curl -X POST http://localhost:3000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"galo.gonzalez@uce.edu.ec\", \"password\":\"Galo123\"}"
```

**Respuesta Esperada (`200 OK`)**: Copia la propiedad `"token"` devuelta para los endpoints administrativos.

---

### 5. Consultar Representantes UGD y Disponibilidad

#### A. Listar Representantes UGD
```bash
curl -X GET http://localhost:3000/api/representatives
```

#### B. Consultar Franjas Horarias Disponibles
```bash
curl -X GET "http://localhost:3000/api/representatives/disponibilidad?fecha=2026-08-25&representative_id=1"
```

---

### 6. Agendar Cita Presencial como Estudiante

```bash
curl -X POST http://localhost:3000/api/appointments/agendar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_ESTUDIANTE>" \
  -d "{\"representative_id\":1, \"fecha\":\"2026-08-25\", \"horas\":[\"09:00\", \"09:30\"], \"materia\":\"Revision de Tesis\"}"
```

---

### 7. Consultar "Mis Citas" con Estado Calculado

```bash
curl -X GET http://localhost:3000/api/appointments/mis-citas \
  -H "Authorization: Bearer <TOKEN_ESTUDIANTE>"
```

---

### 8. Reagendar Cita Presencial como Administrador (`PATCH /api/appointments/admin/:id/reschedule`)

```bash
curl -X PATCH http://localhost:3000/api/appointments/admin/1/reschedule \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -d "{\"fecha\":\"2026-08-26\", \"hora_inicio\":\"10:00\"}"
```

---

### 9. Exportar Respaldo Completo de la Base de Datos (`POST /api/settings/backup`)

```bash
curl -X POST http://localhost:3000/api/settings/backup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -d "{\"password\":\"Galo123\"}" \
  --output respaldo_ugd.json
```

---

## 📜 Script Automatizado de Verificación de Integridad

Puedes verificar la integridad y conteos de la base de datos en Neon ejecutando:

```bash
bun -e "
import { prisma } from './src/lib/prisma';
async function runTests() {
  const users = await prisma.user.count();
  const docs = await prisma.doctorando.count();
  const facs = await prisma.facultad.count();
  const reps = await prisma.representative.count();
  const appts = await prisma.appointment.count();
  console.log('📊 Resumen Base de Datos Neon:');
  console.log('   - Usuarios en sistema (users):', users);
  console.log('   - Doctorandos registrados (doctorandos):', docs);
  console.log('   - Facultades oficiales:', facs);
  console.log('   - Representantes UGD:', reps);
  console.log('   - Citas registradas:', appts);
}
runTests().finally(() => prisma.\$disconnect());
"
```
