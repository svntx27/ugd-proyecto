import { Router } from "express";
import {
  createAppointment,
  getUserAppointments,
  cancelAppointment,
  getAllAppointmentsAdmin,
  adminCancelAppointment,
  adminRescheduleAppointment,
} from "../controllers/appointments.controller";
import { authenticateToken, requireRole, type AuthenticatedRequest } from "../middleware/auth.middleware";
import { sseManager } from "../lib/sse";
import type { Response } from "express";

const router = Router();

// Canal SSE en tiempo real para eventos de citas UGD
router.get("/stream", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const clientId = `${req.user?.id || "admin"}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  sseManager.addClient(clientId, res, req.user?.id, req.user?.role?.code);
});

// Citas Presenciales de usuario
router.post("/agendar", authenticateToken, createAppointment);
router.post("/reservar", authenticateToken, createAppointment); // alias
router.get("/mis-citas", authenticateToken, getUserAppointments);
router.get("/mis-reservas", authenticateToken, getUserAppointments); // alias
router.delete("/citas/:id", authenticateToken, cancelAppointment);
router.delete("/reservas/:id", authenticateToken, cancelAppointment); // alias

// Endpoints Administrativos para Citas Presenciales
router.get(
  "/admin",
  authenticateToken,
  requireRole("DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS", "ANALISTA_TECNICO"),
  getAllAppointmentsAdmin
);
router.get(
  "/admin/reservas",
  authenticateToken,
  requireRole("DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS", "ANALISTA_TECNICO"),
  getAllAppointmentsAdmin
);
router.delete(
  "/admin/:id",
  authenticateToken,
  requireRole("DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS", "ANALISTA_TECNICO"),
  adminCancelAppointment
);
router.delete(
  "/admin/reservas/:id",
  authenticateToken,
  requireRole("DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS", "ANALISTA_TECNICO"),
  adminCancelAppointment
);
router.patch(
  "/admin/:id/reschedule",
  authenticateToken,
  requireRole("DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS", "ANALISTA_TECNICO"),
  adminRescheduleAppointment
);
router.patch(
  "/admin/reservas/:id/reschedule",
  authenticateToken,
  requireRole("DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS", "ANALISTA_TECNICO"),
  adminRescheduleAppointment
);

export default router;
