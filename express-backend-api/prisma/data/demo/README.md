# Guía de Datos Demo (Tribunal de Grado y Pruebas)

Este directorio contiene los datos de prueba y la nómina oficial con **cédulas de identidad adulteradas / sintetizadas** (formato `1790000001` - `1790000544`).

> **FINALIDAD:** Permitir la sustentación y defensa de grado ante el tribunal y el desarrollo diario de forma 100% segura, cumpliendo con la Ley Orgánica de Protección de Datos Personales (LOPDP) de Ecuador.

---

## ¿Qué comando ejecutar según el estado de tu Base de Datos?

### Escenario A: Base de datos en blanco (NO tienes tablas)
Si tu compañero o tú acaban de clonar el repositorio o crearon una nueva base de datos en Neon que no tiene tablas:

```bash
bun run db:setup:demo
```
* **¿Qué hace?** Crea automáticamente todas las tablas desde `schema.prisma` y luego puebla el sistema con los datos demo en un solo paso.

---

### Escenario B: Ya tienes las tablas creadas (Solo quieres cargar datos)
Si las tablas ya existen en Neon y solo quieres sembrar el sistema base y los doctorandos demo:

```bash
bun run db:seed:all:demo
```

---

### Escenario C: Quieres dar de baja todo y empezar limpio (Reset total)
Si la base de datos tiene datos viejos, modificados o corruptos de pruebas anteriores y deseas formatearla a estado de fábrica:

```bash
# 1. Borra todas las tablas existentes y las recrea vacías
bunx prisma db push --force-reset

# 2. Siembra todo limpio con datos demo
bun run db:seed:all:demo
```

---

### Escenario D: Actualizar únicamente la nómina de doctorandos demo
Si las tablas, roles y usuarios ya existen y solo deseas sobreescribir o actualizar la lista de doctorandos:

```bash
bun run db:seed:demo
```

---

### Escenario E: Inspeccionar los datos en el navegador (Prisma Studio)
Para explorar visualmente todas las tablas y relaciones creadas:

```bash
bun run db:studio
```

---

## Cuentas y Credenciales de Prueba Disponibles

### Personal UGD (Cuentas activas de fábrica)
| Nombre | Rol | Correo Institucional | Contraseña |
| :--- | :--- | :--- | :--- |
| Galo Javier González | DIRECTOR | `galo.gonzalez@uce.edu.ec` | `Galo123` |
| Abigail | ANALISTA_PROCESOS | `abigail.analista@uce.edu.ec` | `Abi123` |
| Andrés | ANALISTA_TECNICO | `andres.analista@uce.edu.ec` | `Andres123` |
| Desarrollador | DESARROLLADOR | `dev@dev.ugd.local` | `Dev123` |

### Doctorandos de Prueba (Listos para probar la pantalla de "Activar Cuenta")
> **Nota:** Ninguno de estos estudiantes tiene contraseña previa. Deben ingresar a **"Activar Cuenta"** con su cédula y correo para asignarse su clave y generar su usuario en vivo ante el tribunal.

1. **Dra. María Elena Morales Castro (Ficha 100% Completa sin campos NULL)**
   * **Cédula:** `1718901234` | **Correo:** `maria.morales@uce.edu.ec`
   * *Incluye:* 2 adendas de contrato, convenio con la U. Autónoma de Madrid, informes semestrales 1-5, convalidación SENESCYT y devengamiento en curso.
2. **Dennis Adrian Trujillo Vistin**
   * **Cédula:** `1724567890` | **Correo:** `dennis.trujillo@uce.edu.ec`
3. **Freddy Xavier Tapia Rea**
   * **Cédula:** `1729876543` | **Correo:** `freddy.tapia@uce.edu.ec`
