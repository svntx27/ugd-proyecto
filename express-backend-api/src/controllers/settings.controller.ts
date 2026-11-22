import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { invalidateSystemStatusCache } from "../lib/system-status";

export async function getSettings(req: Request, res: Response): Promise<void> {
  try {
    const settings = await prisma.systemSetting.findMany();
    res.json(settings);
  } catch (error) {
    console.error("Error al obtener configuraciones:", error);
    res.status(500).json({ error: "Error interno al obtener configuraciones del sistema" });
  }
}

export async function updateSetting(req: Request, res: Response): Promise<void> {
  const { key, value, description } = req.body;

  if (!key || value === undefined) {
    res.status(400).json({ error: "Se requieren 'key' y 'value'" });
    return;
  }

  // Restricción exclusiva: Solo el rol DESARROLLADOR puede activar/desactivar el modo lockdown
  if (key === "system_status" && value === "lockdown") {
    const userRole = (req as AuthenticatedRequest).user?.role.code;
    if (userRole !== "DESARROLLADOR") {
      res.status(403).json({ error: "Acceso denegado: El modo Mantenimiento Crítico es exclusivo del rol Desarrollador." });
      return;
    }
  }

  try {
    const setting = await prisma.systemSetting.upsert({
      where: { key: String(key) },
      update: {
        value: String(value),
        description: description ? String(description) : undefined,
      },
      create: {
        key: String(key),
        value: String(value),
        description: description ? String(description) : undefined,
      },
    });

    if (key === "system_status") {
      invalidateSystemStatusCache();
    }

    res.json(setting);
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    res.status(500).json({ error: "Error interno al actualizar configuración" });
  }
}

export async function bulkUpdateSettings(req: Request, res: Response): Promise<void> {
  const { settings } = req.body;

  if (!settings || typeof settings !== "object") {
    res.status(400).json({ error: "Se requiere un objeto 'settings'" });
    return;
  }

  // Restricción exclusiva: Solo el rol DESARROLLADOR puede activar/desactivar el modo lockdown
  if (settings.system_status === "lockdown") {
    const userRole = (req as AuthenticatedRequest).user?.role.code;
    if (userRole !== "DESARROLLADOR") {
      res.status(403).json({ error: "Acceso denegado: El modo Mantenimiento Crítico es exclusivo del rol Desarrollador." });
      return;
    }
  }

  try {
    const keys = Object.keys(settings);
    const updates = keys.map((key) =>
      prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(settings[key]) },
        create: { key, value: String(settings[key]) },
      })
    );

    await prisma.$transaction(updates);

    if ("system_status" in settings) {
      invalidateSystemStatusCache();
    }

    const allSettings = await prisma.systemSetting.findMany();
    res.json(allSettings);
  } catch (error) {
    console.error("Error al actualizar configuraciones masivamente:", error);
    res.status(500).json({ error: "Error interno al guardar configuraciones" });
  }
}

export async function exportDatabaseBackup(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { password } = req.body;

    if (!password) {
      res.status(400).json({ error: "Se requiere la contraseña para autorizar la descarga del respaldo." });
      return;
    }

    if (!req.user || !req.user.id) {
      res.status(401).json({ error: "Usuario no autenticado." });
      return;
    }

    // Buscar al administrador que realiza la solicitud
    const currentAdmin = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!currentAdmin) {
      res.status(404).json({ error: "Usuario administrador no encontrado." });
      return;
    }

    // Verificar la contraseña proporcionada
    const isPasswordValid = await bcrypt.compare(password, currentAdmin.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Contraseña incorrecta. Autorización de respaldo denegada." });
      return;
    }

    // Extraer todos los datos de la base de datos
    const [users, roles, permissions, rolePermissions, representatives, appointments, settings] = await Promise.all([
      prisma.user.findMany({ select: { id: true, name: true, email: true, userType: true, roleId: true, isActive: true, createdAt: true, updatedAt: true } }),
      prisma.role.findMany(),
      prisma.permission.findMany(),
      prisma.rolePermission.findMany(),
      prisma.representative.findMany(),
      prisma.appointment.findMany(),
      prisma.systemSetting.findMany(),
    ]);

    const backupData = {
      system: "Sistema de Agendamiento Presencial - Unidad de Gestión de Doctorados (UGD)",
      institution: "Universidad Central del Ecuador (UCE)",
      exportedAt: new Date().toISOString(),
      exportedBy: {
        id: currentAdmin.id,
        name: currentAdmin.name,
        email: currentAdmin.email,
      },
      counts: {
        users: users.length,
        roles: roles.length,
        permissions: permissions.length,
        representatives: representatives.length,
        appointments: appointments.length,
        settings: settings.length,
      },
      data: {
        users,
        roles,
        permissions,
        rolePermissions,
        representatives,
        appointments,
        settings,
      },
    };

    const dateStr = new Date().toISOString().split("T")[0];
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="UGD_Database_Backup_${dateStr}.json"`);
    res.send(JSON.stringify(backupData, null, 2));
  } catch (error) {
    console.error("Error al exportar respaldo de la DB:", error);
    res.status(500).json({ error: "Error interno al generar respaldo de la base de datos." });
  }
}
