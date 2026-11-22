# 📅 05 - Módulo de Citas Presenciales y Representantes UGD

Este documento explica en detalle la lógica funcional y técnica del motor de **Agendamiento de Citas Presenciales** y la gestión de **Representantes UGD** en la API Express.

---

## 🎯 Propósito del Módulo

El módulo de citas presenciales permite a los estudiantes de doctorado programar espacio de atención personalizada con analistas y representantes de la Unidad de Gestión de Doctorados (UGD). 

El motor asegura que:
1. No existan traslapes de horario para un mismo representante UGD mediante restricciones relacionales de unicidad (`@@unique([representativeId, date, startTime])`).
2. Las franjas horarias se generen dinámicamente según la configuración de jornada laboral del sistema.
3. Las citas compuestas de múltiples horarios contiguos se procesen de forma atómica en una única transacción de base de datos.
4. El estado de la cita se calcule dinámicamente en tiempo de ejecución de acuerdo a la zona horaria oficial de Ecuador (`America/Guayaquil`).

---

## 🏛️ Entidades Principales

```text
  [Representative] 1 ──── N [Appointment] N ──── 1 [User]
```

- **`Representative`**: Analista o personal de atención UGD. Define su nombre, cargo, ubicación y estado.
- **`Appointment`**: Registro individual de un turno agendado en una fecha (`YYYY-MM-DD`) y hora (`HH:mm`).

---

## ⏰ Algoritmo de Generación de Franjas Horarias (`buildSlots`)

La disponibilidad no utiliza bloques estáticos rígidos en código. En su lugar, el controlador de representantes (`representatives.controller.ts`) lee dinámicamente las configuraciones del sistema desde la tabla `system_settings`:

- `start_hour`: Hora de inicio de la jornada (ej. `"08:00"`).
- `end_hour`: Hora de cierre de la jornada (ej. `"16:00"`).
- `slot_interval`: Intervalo en minutos entre citas (ej. `"30"`).

### Lógica de Construcción de Slots:

```typescript
function buildSlots(startStr: string, endStr: string, intervalMin: number): string[] {
  const [sh, sm] = startStr.split(":").map(Number);
  const [eh, em] = endStr.split(":").map(Number);

  let startTotal = (sh || 8) * 60 + (sm || 0);
  const endTotal = (eh || 16) * 60 + (em || 0);
  const step = intervalMin > 0 ? intervalMin : 30;

  const slots: string[] = [];
  while (startTotal < endTotal) {
    const h = Math.floor(startTotal / 60);
    const m = startTotal % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    startTotal += step;
  }
  return slots;
}
```

Si no hay configuraciones personalizadas, el sistema utiliza por defecto los intervalos estándar de 30 minutos desde las 08:00 hasta las 16:00.

---

## 📊 Consulta de Disponibilidad (`getAvailability`)

Al consultar `GET /api/representatives/disponibilidad?fecha=YYYY-MM-DD&representative_id=X`:

1. Se genera la lista de slots habilitados para el día.
2. Se consultan en la base de datos las citas en estado `"activa"` asociadas a dicho representante y fecha.
3. Se realiza un cruce en memoria para retornar el estado de cada franja:

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

## 🔄 Transacciones de Agendamiento Múltiple (`createAppointment`)

Cuando un estudiante agenda una cita que abarca varios bloques de tiempo (ej. 09:00 a 10:00 = 2 franjas: `["09:00", "09:30"]`), la API procesa la solicitud mediante una **Transacción Atómica de Prisma**:

```typescript
const createdAppointments = await prisma.$transaction(
  slotsToBook.map((slot: string) => {
    const hourPart = slot.split(":")[0] || "08";
    return prisma.appointment.create({
      data: {
        representativeId: repIdNum,
        userId,
        date: String(fecha),
        startTime: slot,
        startHour: parseInt(hourPart),
        subject: String(materia),
        status: "activa",
      },
    });
  })
);
```

Si alguna de las franjas horarias seleccionadas ya fue reservada por otro usuario, la base de datos dispara la violación de unicidad `P2002` o la verificación previa rechaza la solicitud, revirtiendo el agendamiento completo y respondiendo con un error HTTP `409 Conflict`.

---

## ⏳ Cálculo Dinámico del Estado de Citas (`active`, `expired`, `cancelled`)

Para evitar la necesidad de tareas cron secundarias que actualicen la base de datos a medianoche, los controladores `getUserAppointments` y `getAllAppointmentsAdmin` calculan el estado en tiempo real al ser consultados:

```text
                 ┌─────────────────────────────┐
                 │ Cita almacenada en BD       │
                 └──────────────┬──────────────┘
                                │
                  ¿status === "cancelada"?
                 ┌──────────────┴──────────────┐
              SÍ │                             │ NO
                 ▼                             ▼
        ┌────────────────┐            ¿Fecha/Hora futura o igual?
        │  "cancelled"   │            ┌────────┴────────┐
        └────────────────┘         SÍ │                 │ NO
                                      ▼                 ▼
                             ┌────────────────┐ ┌────────────────┐
                             │    "active"    │ │   "expired"    │
                             └────────────────┘ └────────────────┘
```

1. **`cancelled`**: La cita posee `status === "cancelada"` en base de datos.
2. **`active`**: La fecha de la cita es posterior al día de hoy en hora de Ecuador (`America/Guayaquil`), o bien es el día de hoy y la hora agendada aún no ha transcurrido.
3. **`expired`**: La fecha u hora agendada ya pertenece al pasado.

---

## 🛠️ Reagendamiento Administrativo (`adminRescheduleAppointment`)

Los usuarios con rol administrativo (`DESARROLLADOR`, `DIRECTOR`, `ANALISTA_PROCESOS`, `ANALISTA_TECNICO`) pueden reagendar citas presenciales mediante `PATCH /api/appointments/admin/:id/reschedule`. 

El endpoint recibe `fecha` y `hora_inicio`, recalcula `startHour` y actualiza la cita. Si el nuevo turno seleccionado choca con otra cita activa, Prisma responde con `409 Conflict`.
