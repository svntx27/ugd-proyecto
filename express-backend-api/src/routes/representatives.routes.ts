import { Router } from "express";
import {
  listRepresentatives,
  getAvailability,
  createRepresentative,
  updateRepresentative,
  deleteRepresentative,
} from "../controllers/representatives.controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router = Router();

// Representantes UGD (Públicos / Autenticados)
router.get("/", listRepresentatives);
router.get("/disponibilidad", getAvailability);

// Gestión Administrativa de Representantes UGD
router.post(
  "/",
  authenticateToken,
  requireRole("DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS", "ANALISTA_TECNICO"),
  createRepresentative
);
router.put(
  "/:id",
  authenticateToken,
  requireRole("DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS", "ANALISTA_TECNICO"),
  updateRepresentative
);
router.delete(
  "/:id",
  authenticateToken,
  requireRole("DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS", "ANALISTA_TECNICO"),
  deleteRepresentative
);

export default router;
