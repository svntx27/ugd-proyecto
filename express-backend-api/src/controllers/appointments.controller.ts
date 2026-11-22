import { sseManager } from "../lib/sse";
import type { Response } from "express";
import { prisma } from "../lib/prisma";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { VALID_TIME_SLOTS } from "./representatives.controller";

export async function createAppointment(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const { representative_id, lab_id, fecha, horas, materia } = req.body;
    const repId = representative_id || lab_id;

    if (!repId || !fecha || !horas || !Array.isArray(horas) || horas.length === 0 || !materia) {
      res.status(400).json({ error: "Todos los campos (representative_id, fecha, horas, materia) son requeridos" });
      return;
    }

    const slotsToBook: string[] = horas.map((h: any) => {
      if (typeof h === "string") return h;
      const hourNum = Number(h);
      return `${String(hourNum).padStart(2, "0")}:00`;
    });

    const invalidSlots = slotsToBook.filter((s) => !VALID_TIME_SLOTS.includes(s));
    if (invalidSlots.length > 0) {
      res.status(400).json({ error: `Horarios no válidos: ${invalidSlots.join(", ")}` });
      return;
    }

    const nowStr = new Date().toLocaleString("en-US", { timeZone: "America/Guayaquil" });
    const now = new Date(nowStr);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayDateStr = `${year}-${month}-${day}`;

    if (String(fecha) < todayDateStr) {
      res.status(400).json({ error: "No se pueden agendar citas en fechas pasadas." });
      return;
    }

    if (String(fecha) === todayDateStr) {
      const currentTotalMin = now.getHours() * 60 + now.getMinutes();
      const pastSlots = slotsToBook.filter((s) => {
        const [sh, sm] = s.split(":").map(Number);
        const slotTotalMin = (sh || 0) * 60 + (sm || 0);
        return slotTotalMin <= currentTotalMin;
      });

      if (pastSlots.length > 0) {
        res.status(400).json({ error: `No se pueden agendar citas en horarios pasados: ${pastSlots.join(", ")}` });
        return;
      }
    }

    const repIdNum = Number(repId);

    const existing = await prisma.appointment.findMany({
      where: {
        representativeId: repIdNum,
        date: String(fecha),
        startTime: { in: slotsToBook },
        status: "activa",
      },
    });

    if (existing.length > 0) {
      res.status(409).json({ error: "Uno o varios de los horarios seleccionados ya están ocupados para este representante UGD." });
      return;
    }

    const createdAppointments = await prisma.$transaction(
      slotsToBook.map((slot: string) => {
        const hourPart = slot.split(":")[0] || "08";
        const startHourInt = parseInt(hourPart);
        return prisma.appointment.create({
          data: {
            representativeId: repIdNum,
            userId,
            date: String(fecha),
            startTime: slot,
            startHour: startHourInt,
            subject: String(materia),
            status: "activa",
          },
          include: {
            representative: true,
            user: true,
          },
        });
      })
    );

    const formatted = createdAppointments.map((a: any) => ({
      id: a.id,
      user_id: a.userId,
      user_nombre: a.user?.name || req.user?.name,
      user_email: a.user?.email || req.user?.email,
      usuario_nombre: a.user?.name || req.user?.name,
      usuario_email: a.user?.email || req.user?.email,
      representative_id: a.representativeId,
      lab_id: a.representativeId,
      representative_nombre: a.representative.name,
      lab_nombre: a.representative.name,
      fecha: a.date,
      hora_inicio: a.startTime,
      start_time: a.startTime,
      materia: a.subject,
      estado: a.status,
      created_at: a.createdAt,
    }));

    // Broadcast instantáneo a todos los clientes administrativos vía SSE
    sseManager.broadcast("appointment:created", formatted);

    res.status(201).json(formatted);
  } catch (error: any) {
    console.error("Error al crear cita UGD:", error);
    if (error.code === "P2002") {
      res.status(409).json({ error: "Uno o varios horarios seleccionados ya se encuentran ocupados para este representante UGD." });
      return;
    }
    res.status(500).json({ error: "Error interno del servidor al procesar la cita" });
  }
}

export async function getUserAppointments(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const rawAppointments = await prisma.appointment.findMany({
      where: { userId },
      include: { representative: true },
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
    });

    const nowStr = new Date().toLocaleString("en-US", { timeZone: "America/Guayaquil" });
    const now = new Date(nowStr);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const formatted = rawAppointments.map((a) => {
      let status = "expired";
      const startTimeStr = String(a.startTime || `${a.startHour}:00`);

      try {
        const parts = a.date.split("-");
        const yearPart = Number(parts[0] || "2026");
        const monthPart = Number(parts[1] || "1");
        const dayPart = Number(parts[2] || "1");
        const resDate = new Date(yearPart, monthPart - 1, dayPart);

        if (resDate.getTime() > today.getTime()) {
          status = "active";
        } else if (resDate.getTime() === today.getTime()) {
          const slotParts = startTimeStr.split(":");
          const slotHour = parseInt(slotParts[0] || "8");
          const slotMin = parseInt(slotParts[1] || "0");
          const slotTotalMin = slotHour * 60 + slotMin;
          const currentTotalMin = now.getHours() * 60 + now.getMinutes();

          if (slotTotalMin >= currentTotalMin) {
            status = "active";
          }
        }
      } catch (e) {
        console.error("Error parsing date:", e);
      }

      if (a.status === "cancelada") {
        status = "cancelled";
      }

      return {
        id: a.id,
        representative_id: a.representativeId,
        lab_id: a.representativeId,
        representative_nombre: a.representative.name,
        lab_nombre: a.representative.name,
        fecha: a.date,
        hora_inicio: startTimeStr,
        start_time: startTimeStr,
        materia: a.subject,
        estado: status,
        created_at: a.createdAt,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Error al obtener citas UGD del usuario:", error);
    res.status(500).json({ error: "Error interno al obtener citas" });
  }
}

export async function cancelAppointment(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const apptId = Number(id);
    const appointment = await prisma.appointment.findUnique({
      where: { id: apptId },
    });

    if (!appointment || appointment.userId !== userId) {
      res.status(404).json({ error: "Cita no encontrada o no autorizada" });
      return;
    }

    await prisma.appointment.delete({
      where: { id: apptId },
    });

    sseManager.broadcast("appointment:cancelled", { id: apptId });

    res.json({ message: "Cita cancelada correctamente" });
  } catch (error) {
    console.error("Error al cancelar cita:", error);
    res.status(500).json({ error: "Error interno al cancelar la cita" });
  }
}

export async function getAllAppointmentsAdmin(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const rawAppointments = await prisma.appointment.findMany({
      include: {
        representative: true,
        user: true,
      },
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
    });

    const nowStr = new Date().toLocaleString("en-US", { timeZone: "America/Guayaquil" });
    const now = new Date(nowStr);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const formatted = rawAppointments.map((a) => {
      let status = "expired";
      const startTimeStr = String(a.startTime || `${a.startHour}:00`);

      try {
        const parts = a.date.split("-");
        const yearPart = Number(parts[0] || "2026");
        const monthPart = Number(parts[1] || "1");
        const dayPart = Number(parts[2] || "1");
        const resDate = new Date(yearPart, monthPart - 1, dayPart);

        if (resDate.getTime() > today.getTime()) {
          status = "active";
        } else if (resDate.getTime() === today.getTime()) {
          const slotParts = startTimeStr.split(":");
          const slotHour = parseInt(slotParts[0] || "8");
          const slotMin = parseInt(slotParts[1] || "0");
          const slotTotalMin = slotHour * 60 + slotMin;
          const currentTotalMin = now.getHours() * 60 + now.getMinutes();

          if (slotTotalMin >= currentTotalMin) {
            status = "active";
          }
        }
      } catch (e) {
        console.error("Error parsing date:", e);
      }

      if (a.status === "cancelada") {
        status = "cancelled";
      }

      return {
        id: a.id,
        representative_id: a.representativeId,
        lab_id: a.representativeId,
        representative_nombre: a.representative.name,
        lab_nombre: a.representative.name,
        user_id: a.userId,
        usuario_nombre: a.user.name,
        usuario_email: a.user.email,
        fecha: a.date,
        hora_inicio: startTimeStr,
        start_time: startTimeStr,
        materia: a.subject,
        estado: status,
        created_at: a.createdAt,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Error al obtener todas las citas (admin):", error);
    res.status(500).json({ error: "Error interno al obtener citas" });
  }
}

export async function adminCancelAppointment(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const apptId = Number(id);

    const existing = await prisma.appointment.findUnique({
      where: { id: apptId },
    });

    if (!existing) {
      res.status(404).json({ error: "Cita no encontrada" });
      return;
    }

    const nowStr = new Date().toLocaleString("en-US", { timeZone: "America/Guayaquil" });
    const now = new Date(nowStr);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const parts = existing.date.split("-");
    const resDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const startTimeStr = String(existing.startTime || `${existing.startHour}:00`);
    const [slotHour, slotMin] = startTimeStr.split(":").map(Number);
    const slotTotalMin = (slotHour || 8) * 60 + (slotMin || 0);
    const currentTotalMin = now.getHours() * 60 + now.getMinutes();

    if (resDate.getTime() < today.getTime() || (resDate.getTime() === today.getTime() && slotTotalMin < currentTotalMin)) {
      res.status(400).json({ error: "No es posible cancelar una cita que ya ha expirado o finalizado." });
      return;
    }

    await prisma.appointment.delete({
      where: { id: apptId },
    });

    sseManager.broadcast("appointment:cancelled", { id: apptId });

    res.json({ message: "Cita eliminada por administración correctamente" });
  } catch (error) {
    console.error("Error al cancelar cita (admin):", error);
    res.status(404).json({ error: "Cita no encontrada" });
  }
}

export async function adminRescheduleAppointment(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { fecha, hora_inicio } = req.body;

    if (!fecha || hora_inicio === undefined) {
      res.status(400).json({ error: "Faltan parámetros 'fecha' o 'hora_inicio'" });
      return;
    }

    const apptId = Number(id);

    const existing = await prisma.appointment.findUnique({
      where: { id: apptId },
    });

    if (!existing) {
      res.status(404).json({ error: "Cita no encontrada" });
      return;
    }

    if (existing.status === "cancelada") {
      res.status(400).json({ error: "No es posible reagendar una cita que ha sido cancelada." });
      return;
    }

    const nowStr = new Date().toLocaleString("en-US", { timeZone: "America/Guayaquil" });
    const now = new Date(nowStr);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const parts = existing.date.split("-");
    const resDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const startTimeStr = String(existing.startTime || `${existing.startHour}:00`);
    const [slotHour, slotMin] = startTimeStr.split(":").map(Number);
    const slotTotalMin = (slotHour || 8) * 60 + (slotMin || 0);
    const currentTotalMin = now.getHours() * 60 + now.getMinutes();

    if (resDate.getTime() < today.getTime() || (resDate.getTime() === today.getTime() && slotTotalMin < currentTotalMin)) {
      res.status(400).json({ error: "No es posible reagendar una cita que ya ha expirado o finalizado." });
      return;
    }

    const slotStr = typeof hora_inicio === "string" ? hora_inicio : `${String(hora_inicio).padStart(2, "0")}:00`;
    const hourPart = slotStr.split(":")[0] || "08";
    const startHourInt = parseInt(hourPart);

    const updated = await prisma.appointment.update({
      where: { id: apptId },
      data: {
        date: String(fecha),
        startTime: String(slotStr),
        startHour: startHourInt,
      },
      include: {
        representative: true,
        user: true,
      },
    });

    sseManager.broadcast("appointment:rescheduled", { id: apptId, fecha, hora_inicio, appointment: updated });

    res.json({ message: "Cita UGD reagendada con éxito", appointment: updated });
  } catch (error: any) {
    console.error("Error al reagendar cita UGD:", error);
    if (error.code === "P2002") {
      res.status(409).json({ error: "El horario solicitado ya se encuentra ocupado para este representante UGD." });
      return;
    }
    res.status(500).json({ error: "Error interno al reagendar cita" });
  }
}
