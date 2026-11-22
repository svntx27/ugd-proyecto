# Guía de Datos Oficiales (Producción UGD)

> [!CAUTION]
> **AVISO DE SEGURIDAD Y PRIVACIDAD DE DATOS (PII):**  
> Este directorio contiene datos reales de doctorandos de la Universidad Central del Ecuador (cédulas de identidad, números de teléfono y datos contractuales protegidos por la Ley Orgánica de Protección de Datos Personales - LOPDP).  
> **ESTE DIRECTORIO Y SUS ARCHIVOS `.sql` ESTÁN EXCLUIDOS DE GIT Y NUNCA DEBEN PUBLICARSE EN REPOSITORIOS PÚBLICOS.**

---

## Garantía de Limpieza para Producción
En el modo oficial (`--official`), el sistema:
* **OMITE AL 100%** la creación de estudiantes y expedientes de prueba (Dennis, Freddy y María Elena no se crean).
* Limpia cualquier residuo de prueba previo en la base de datos.
* Solo registra la matriz RBAC, las cuentas del personal UGD y la nómina oficial auténtica del archivo SQL.

---

## Archivo Esperado
Colocar en esta carpeta el volcado oficial generado por la Unidad de Gestión de Doctorados:
* `import_neon_doctorandos.sql`

---

## ¿Qué comando ejecutar según el estado de tu Base de Datos?

### Escenario A: Base de datos en blanco (NO tienes tablas)
Cuando configures por primera vez la base de datos de producción definitiva de la UGD y no tenga tablas creadas:

```bash
bun run db:setup:official
```
* **¿Qué hace?** Crea todas las tablas desde `schema.prisma` y luego carga la matriz RBAC, las cuentas de funcionarios y los 544 doctorandos reales en un solo comando.

---

### Escenario B: Ya tienes las tablas creadas (Solo quieres cargar datos oficiales)
Si las tablas ya existen en la base de datos y solo deseas poblar los datos oficiales limpios:

```bash
bun run db:seed:all:official
```

---

### Escenario C: Quieres formatear la base de datos y empezar limpio (Reset total)
Si la base de datos oficial requiere un formateo completo para volver a cargarse desde cero:

```bash
# 1. Elimina todas las tablas y las recrea vacías
bunx prisma db push --force-reset

# 2. Carga todo el sistema oficial limpio (sin estudiantes de prueba)
bun run db:seed:all:official
```

---

### Escenario D: Actualizar únicamente la nómina oficial de doctorandos
Si ya existen los usuarios y roles y solo se desea actualizar la lista de doctorandos:

```bash
bun run db:seed:official
```

---

### Escenario E: Recibiste un nuevo corte de datos de la Unidad (Generar Demo)
Cuando la Unidad entregue un nuevo archivo `.sql` actualizado:

1. Reemplaza el archivo anterior colocando el nuevo archivo en:
   `prisma/data/official/import_neon_doctorandos.sql`
2. Ejecuta el script de anonimización:
   ```bash
   bun run db:anonymize
   ```
3. El script leerá el archivo oficial, adulterará todas las cédulas con números ficticios seguros y generará automáticamente:
   `prisma/data/demo/import_neon_doctorandos.demo.sql`
