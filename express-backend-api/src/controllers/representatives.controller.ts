import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

export const VALID_TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30"
];

function buildSlots(startStr: string, endStr: string, intervalMin: number): string[] {
  try {
    const [sh, sm] = startStr.split(":").map(Number);
    const [eh, em] = endStr.split(":").map(Number);

    let startTotal = (sh || 8) * 60 + (sm || 0);
    const endTotal = (eh || 16) * 60 + (em || 0);
    const step = intervalMin && intervalMin > 0 ? intervalMin : 30;

    const slots: string[] = [];
    while (startTotal < endTotal) {
      const h = Math.floor(startTotal / 60);
      const m = startTotal % 60;
      const slot = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      slots.push(slot);
      startTotal += step;
    }

    return slots.length > 0 ? slots : VALID_TIME_SLOTS;
  } catch {
    return VALID_TIME_SLOTS;
  }
}

export async function listRepresentatives(req: Request, res: Response): Promise<void> {
  try {
    const rawReps = await prisma.representative.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            role: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { id: "asc" },
    });

    const formatted = rawReps.map((r) => ({
      id: r.id,
      nombre: r.name,
      name: r.name,
      title: r.title || "Analista UGD",
      ubicacion: r.location || "Unidad de Gestión de Doctorados",
      location: r.location || "Unidad de Gestión de Doctorados",
      capacidad: r.capacity,
      capacity: r.capacity,
      estado: r.status || "activo",
      status: r.status || "activo",
      userId: r.userId,
      email: r.user?.email || null,
      role: r.user?.role?.name || null,
      roleCode: r.user?.role?.code || null,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error al listar representantes UGD:", error);
    res.status(500).json({ error: "Error interno al obtener representantes UGD" });
  }
}

export async function getAvailability(req: Request, res: Response): Promise<void> {
  const { fecha, representative_id, lab_id } = req.query;
  const repId = representative_id || lab_id;

  if (!fecha || !repId) {
    res.status(400).json({ error: "Se requieren los parámetros 'fecha' y 'representative_id'" });
    return;
  }

  try {
    const representativeIdNum = Number(repId);
    const dateStr = String(fecha);

    // Cargar configuraciones del sistema
    const settings = await prisma.systemSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => (settingsMap[s.key] = s.value));

    const startHourStr = settingsMap.start_hour || "08:00";
    const endHourStr = settingsMap.end_hour || "16:00";
    const intervalMin = parseInt(settingsMap.slot_interval || "30") || 30;

    const currentSlots = buildSlots(startHourStr, endHourStr, intervalMin);

    const activeAppointments = await prisma.appointment.findMany({
      where: {
        representativeId: representativeIdNum,
        date: dateStr,
        status: "activa",
      },
    });

    const nowStr = new Date().toLocaleString("en-US", { timeZone: "America/Guayaquil" });
    const now = new Date(nowStr);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayDateStr = `${year}-${month}-${day}`;

    const availability = currentSlots.map((slot) => {
      const parts = slot.split(":");
      const hourPart = parts[0] || "08";
      const minPart = parts[1] || "00";

      let isOccupied = activeAppointments.some((a) => {
        const apptSlot = a.startTime || `${String(a.startHour).padStart(2, "0")}:00`;
        return apptSlot === slot;
      });

      // Mark slot as occupied if it has already passed
      if (dateStr < todayDateStr) {
        isOccupied = true;
      } else if (dateStr === todayDateStr) {
        const slotTotalMin = parseInt(hourPart) * 60 + parseInt(minPart);
        const currentTotalMin = now.getHours() * 60 + now.getMinutes();
        if (slotTotalMin <= currentTotalMin) {
          isOccupied = true;
        }
      }

      const hourNumber = parseInt(hourPart);
      const minutesNumber = parseInt(minPart);
      const decimalHour = hourNumber + minutesNumber / 60;

      return {
        hora: slot,
        decimal_hour: decimalHour,
        time_slot: slot,
        start_time: slot,
        estado: isOccupied ? "ocupado" : "libre",
      };
    });

    res.json(availability);
  } catch (error) {
    console.error("Error al consultar disponibilidad UGD:", error);
    res.status(500).json({ error: "Error interno al obtener disponibilidad" });
  }
}

export async function createRepresentative(req: Request, res: Response): Promise<void> {
  const { nombre, title, ubicacion, capacidad, estado, email, password, roleCode } = req.body;

  if (!nombre || !nombre.trim()) {
    res.status(400).json({ error: "El nombre del representante es requerido" });
    return;
  }

  const trimmedNombre = nombre.trim();
  const trimmedTitle = title?.trim() || "Analista UGD";
  const trimmedUbicacion = ubicacion?.trim() || "Unidad de Gestión de Doctorados";
  const repCapacity = capacidad ? Number(capacidad) : 1;
  const repStatus = estado === "inactivo" ? "inactivo" : "activo";

  // Si se envían credenciales de acceso (email y password)
  if (email && email.trim()) {
    const normalizedEmail = email.trim().toLowerCase();

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({ error: "El formato del correo electrónico no es válido" });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({ error: "La contraseña debe contener al menos 6 caracteres" });
      return;
    }

    try {
      // Verificar si el correo ya existe
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        res.status(409).json({ error: `El correo '${normalizedEmail}' ya está registrado en el sistema` });
        return;
      }

      // Resolver rol
      const targetRoleCode = roleCode || "ANALISTA_PROCESOS";
      const roleRecord = await prisma.role.findUnique({
        where: { code: targetRoleCode },
      });

      if (!roleRecord) {
        res.status(400).json({ error: `El rol '${targetRoleCode}' no existe en el sistema` });
        return;
      }

      // Hashear contraseña con bcrypt (cost factor 10)
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear Usuario y Representante en una transacción atómica
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: trimmedNombre,
            email: normalizedEmail,
            password: hashedPassword,
            roleId: roleRecord.id,
            userType: "Personal UGD",
            isActive: repStatus === "activo",
          },
          include: {
            role: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        });

        const rep = await tx.representative.create({
          data: {
            name: trimmedNombre,
            title: trimmedTitle,
            location: trimmedUbicacion,
            capacity: repCapacity,
            status: repStatus,
            userId: user.id,
          },
        });

        return { user, rep };
      });

      res.status(201).json({
        id: result.rep.id,
        nombre: result.rep.name,
        name: result.rep.name,
        title: result.rep.title,
        ubicacion: result.rep.location,
        location: result.rep.location,
        capacidad: result.rep.capacity,
        capacity: result.rep.capacity,
        estado: result.rep.status,
        status: result.rep.status,
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role.name,
        roleCode: result.user.role.code,
      });
      return;
    } catch (error) {
      console.error("Error al crear representante y usuario:", error);
      res.status(500).json({ error: "Error interno al crear el representante con cuenta de usuario" });
      return;
    }
  }

  // Creación sin credenciales (compatibilidad)
  try {
    const newRep = await prisma.representative.create({
      data: {
        name: trimmedNombre,
        title: trimmedTitle,
        location: trimmedUbicacion,
        capacity: repCapacity,
        status: repStatus,
      },
    });

    res.status(201).json({
      id: newRep.id,
      nombre: newRep.name,
      name: newRep.name,
      title: newRep.title,
      ubicacion: newRep.location,
      location: newRep.location,
      capacidad: newRep.capacity,
      capacity: newRep.capacity,
      estado: newRep.status,
      status: newRep.status,
      userId: null,
      email: null,
      role: null,
      roleCode: null,
    });
  } catch (error) {
    console.error("Error al crear representante UGD:", error);
    res.status(500).json({ error: "Error interno al crear representante" });
  }
}

export async function updateRepresentative(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { nombre, title, ubicacion, capacidad, estado, email, password, roleCode } = req.body;

  try {
    const existingRep = await prisma.representative.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    });

    if (!existingRep) {
      res.status(404).json({ error: "Representante no encontrado" });
      return;
    }

    const trimmedNombre = nombre ? nombre.trim() : existingRep.name;
    const trimmedTitle = title !== undefined ? (title.trim() || "Analista UGD") : existingRep.title;
    const trimmedUbicacion = ubicacion !== undefined ? (ubicacion.trim() || "Unidad de Gestión de Doctorados") : existingRep.location;
    const repCapacity = capacidad !== undefined ? Number(capacidad) : existingRep.capacity;
    const repStatus = estado !== undefined ? estado : existingRep.status;

    // Actualización en transacción
    const updated = await prisma.$transaction(async (tx) => {
      let linkedUserId = existingRep.userId;

      // Si tiene usuario vinculado
      if (linkedUserId) {
        const userUpdateData: any = {};
        if (nombre) userUpdateData.name = trimmedNombre;
        if (estado) userUpdateData.isActive = repStatus === "activo";

        if (email && email.trim()) {
          const normalizedEmail = email.trim().toLowerCase();
          const emailOccupied = await tx.user.findFirst({
            where: {
              email: normalizedEmail,
              id: { not: linkedUserId },
            },
          });
          if (emailOccupied) {
            throw new Error(`El correo '${normalizedEmail}' ya está en uso por otro usuario`);
          }
          userUpdateData.email = normalizedEmail;
        }

        if (password && password.trim()) {
          if (password.length < 6) {
            throw new Error("La nueva contraseña debe tener al menos 6 caracteres");
          }
          userUpdateData.password = await bcrypt.hash(password, 10);
        }

        if (roleCode) {
          const roleRecord = await tx.role.findUnique({ where: { code: roleCode } });
          if (roleRecord) {
            userUpdateData.roleId = roleRecord.id;
          }
        }

        if (Object.keys(userUpdateData).length > 0) {
          await tx.user.update({
            where: { id: linkedUserId },
            data: userUpdateData,
          });
        }
      } else if (email && email.trim() && password && password.trim()) {
        // No tenía usuario vinculado pero ahora se le asigna uno
        const normalizedEmail = email.trim().toLowerCase();
        const emailOccupied = await tx.user.findUnique({
          where: { email: normalizedEmail },
        });
        if (emailOccupied) {
          throw new Error(`El correo '${normalizedEmail}' ya está en uso`);
        }
        if (password.length < 6) {
          throw new Error("La contraseña debe tener al menos 6 caracteres");
        }

        const targetRoleCode = roleCode || "ANALISTA_PROCESOS";
        const roleRecord = await tx.role.findUnique({ where: { code: targetRoleCode } });
        if (!roleRecord) {
          throw new Error(`El rol '${targetRoleCode}' no existe`);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await tx.user.create({
          data: {
            name: trimmedNombre,
            email: normalizedEmail,
            password: hashedPassword,
            roleId: roleRecord.id,
            userType: "Personal UGD",
            isActive: repStatus === "activo",
          },
        });
        linkedUserId = newUser.id;
      }

      const rep = await tx.representative.update({
        where: { id: Number(id) },
        data: {
          name: trimmedNombre,
          title: trimmedTitle,
          location: trimmedUbicacion,
          capacity: repCapacity,
          status: repStatus,
          userId: linkedUserId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return rep;
    });

    res.json({
      id: updated.id,
      nombre: updated.name,
      name: updated.name,
      title: updated.title,
      ubicacion: updated.location,
      location: updated.location,
      capacidad: updated.capacity,
      capacity: updated.capacity,
      estado: updated.status,
      status: updated.status,
      userId: updated.userId,
      email: updated.user?.email || null,
      role: updated.user?.role?.name || null,
      roleCode: updated.user?.role?.code || null,
    });
  } catch (error: any) {
    console.error("Error al actualizar representante UGD:", error);
    res.status(400).json({ error: error.message || "Error al actualizar representante" });
  }
}

export async function deleteRepresentative(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const rep = await prisma.representative.findUnique({
      where: { id: Number(id) },
      include: { _count: { select: { appointments: true } } },
    });

    if (!rep) {
      res.status(404).json({ error: "Representante no encontrado" });
      return;
    }

    if (rep._count.appointments > 0) {
      res.status(400).json({
        error: `No se puede eliminar el representante porque tiene ${rep._count.appointments} cita(s) asociadas. En su lugar, puede cambiar su estado a 'inactivo'.`,
      });
      return;
    }

    await prisma.$transaction(async (tx) => {
      if (rep.userId) {
        // Desactivar el usuario asociado
        await tx.user.update({
          where: { id: rep.userId },
          data: { isActive: false },
        });
      }

      await tx.representative.delete({
        where: { id: Number(id) },
      });
    });

    res.json({ success: true, message: "Representante UGD eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar representante UGD:", error);
    res.status(500).json({ error: "Error al eliminar representante UGD. Verifique que no tenga citas agendadas." });
  }
}
