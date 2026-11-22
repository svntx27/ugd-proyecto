# Módulo de Base de Datos y Sembrado (Prisma ORM)

Este directorio gestiona el esquema de la base de datos PostgreSQL (Neon) y los procesos de sembrado (*seeding*) de datos para el sistema de la Unidad de Gestión de Doctorados (UGD).

---

## Estructura del Directorio (Aislamiento por Entornos)

```text
prisma/
├── schema.prisma              # Definición de modelos de datos, relaciones y tablas
├── seed.ts                    # Orquestador principal (limpieza, roles, staff y pruebas)
├── seed-doctorandos.ts        # Importador transaccional optimizado de nóminas SQL
│
├── data/
│   ├── demo/                  # [PÚBLICO EN GIT] Entorno completo para tribunal y desarrollo
│   │   ├── README.md          # Guía detallada de comandos demo
│   │   ├── import_neon_doctorandos.demo.sql  # Nómina con cédulas adulteradas
│   │   ├── staff-seed-data.ts # Personal simulado (Galo123, Abi123, etc.)
│   │   ├── test-students-data.ts # Fichas de prueba (Dennis, Freddy, María Elena)
│   │   └── anonymize-sql.mjs  # Generador de datos demo desde el oficial
│   │
│   └── official/              # [PROTEGIDO EN LOCAL / .GITIGNORE] Entorno de producción UGD
│       ├── README.md          # Guía detallada para producción UGD
│       ├── import_neon_doctorandos.sql       # Nómina oficial auténtica de la UGD
│       └── staff-seed-data.ts # Personal y credenciales REALES de la UGD
```

---

## ¿Qué comando debo ejecutar? (Guía de Decisión Rápida)

### 1. Si tu base de datos está VIRGEN / EN BLANCO (No tiene tablas)
> **Escenario:** Tu compañero o tú recién clonaron el proyecto, crearon una nueva base de datos en Neon y no existe ninguna tabla.
* **Modo Demostración (Tribunal / Desarrollo):**
  ```bash
  bun run db:setup:demo
  ```
* **Modo Oficial (Producción UGD):**
  ```bash
  bun run db:setup:official
  ```
*(Crea todas las tablas desde `schema.prisma` y luego puebla todo automáticamente).*

---

### 2. Si YA TIENES las tablas creadas (Y solo quieres sembrar/recargar datos)
> **Escenario:** Las tablas ya fueron creadas previamente con `prisma db push` y solo quieres poblar o repoblar usuarios, roles y nómina.
* **Modo Demostración (Incluye las 3 fichas de prueba):**
  ```bash
  bun run db:seed:all:demo
  ```
* **Modo Oficial (EXCLUYE estudiantes de prueba; 100% datos reales):**
  ```bash
  bun run db:seed:all:official
  ```

---

### 3. Si quieres DAR DE BAJA todo lo existente y empezar desde cero (Reset Total)
> **Escenario:** Hiciste pruebas, cambiaste registros, hay datos inconsistentes y quieres formatear la base de datos a estado de fábrica.
* **Reset a Modo Demostración:**
  ```bash
  bunx prisma db push --force-reset && bun run db:seed:all:demo
  ```
* **Reset a Modo Oficial:**
  ```bash
  bunx prisma db push --force-reset && bun run db:seed:all:official
  ```

---

## Diferencias Clave entre Modos

| Característica | Modo DEMO (`--demo`) | Modo OFICIAL (`--official`) |
| :--- | :--- | :--- |
| **Nómina de Doctorandos** | Cédulas adulteradas (`1790000001`...) | Cédulas y datos reales de la UGD |
| **Estudiantes de Prueba** | **SÍ se crean** (Dennis, Freddy, María Elena) | **SE OMITEN AL 100%** (Cero datos ficticios) |
| **Cuentas de Personal** | Leídas desde `prisma/data/demo/staff-seed-data.ts` | Leídas desde `prisma/data/official/staff-seed-data.ts` |
| **Seguridad Git** | Archivos públicos en Git | Todo `official/` protegido en `.gitignore` |
