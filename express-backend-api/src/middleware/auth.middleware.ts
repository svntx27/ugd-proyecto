import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { consumeSseTicket } from "../lib/sse-tickets";
import { getSystemStatus } from "../lib/system-status";

export interface AuthenticatedUserPayload {
  id: string;
  name: string;
  email: string;
  userType: string;
  role: {
    id: string;
    code: string;
    name: string;
  };
  permissions: string[]; // List of permission codes
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUserPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? "" : "dev-only-secret-key-ugd-2026");

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET obligatorio en producción");
}

/**
 * Middleware para autenticar la petición con JWT
 */
export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers["authorization"];
  const queryToken = typeof req.query?.token === "string" ? req.query.token : undefined;
  const queryTicket = typeof req.query?.ticket === "string" ? req.query.ticket : undefined;

  let targetUserId: string | null = null;

  // 1. Si viene un ticket efímero de SSE (?ticket=...)
  if (queryTicket) {
    const ticketData = consumeSseTicket(queryTicket);
    if (!ticketData) {
      res.status(401).json({ error: "Ticket SSE inválido o expirado" });
      return;
    }
    targetUserId = ticketData.userId;
  } else {
    // 2. Si viene el Bearer header estándar o fallback de ?token=...
    const token = (authHeader && authHeader.split(" ")[1]) || queryToken;
    if (!token) {
      res.status(401).json({ error: "Acceso denegado: Token o ticket no proporcionado" });
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      targetUserId = decoded.userId;
    } catch (error) {
      res.status(401).json({ error: "Token inválido o expirado" });
      return;
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ error: "Usuario inactivo o no encontrado" });
      return;
    }

    const permissions = user.role.rolePermissions.map((rp) => rp.permission.code);

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      role: {
        id: user.role.id,
        code: user.role.code,
        name: user.role.name,
      },
      permissions,
    };

    // Bloqueo total por Mantenimiento Crítico: Expulsa a cualquier rol distinto a DESARROLLADOR
    if (req.user.role.code !== "DESARROLLADOR") {
      const status = await getSystemStatus();
      if (status === "lockdown") {
        res.status(503).json({
          code: "PLATFORM_LOCKDOWN",
          error: "PLATFORM_LOCKDOWN: La plataforma se encuentra en mantenimiento técnico. Su sesión ha sido finalizada.",
        });
        return;
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Error interno al verificar permisos de usuario" });
    return;
  }
}

/**
 * Middleware para validar si el rol del usuario está permitido
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    if (!allowedRoles.includes(req.user.role.code)) {
      res.status(403).json({
        error: `Acceso restringido: Se requiere uno de los siguientes roles [${allowedRoles.join(
          ", "
        )}]. Tu rol actual es '${req.user.role.code}'`,
      });
      return;
    }

    next();
  };
}

/**
 * Middleware para validar si el usuario posee un permiso específico (RBAC)
 */
export function checkPermission(requiredPermission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const hasPerm = req.user.permissions.includes(requiredPermission);

    if (!hasPerm) {
      res.status(403).json({
        error: `Permiso denegado: Se requiere el permiso '${requiredPermission}'`,
      });
      return;
    }

    next();
  };
}
