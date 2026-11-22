import { Router } from "express";
import { getSettings, updateSetting, bulkUpdateSettings, exportDatabaseBackup } from "../controllers/settings.controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getSettings);

router.post(
  "/",
  authenticateToken,
  requireRole("DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS", "ANALISTA_TECNICO"),
  updateSetting
);

router.put(
  "/",
  authenticateToken,
  requireRole("DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS", "ANALISTA_TECNICO"),
  updateSetting
);

router.post(
  "/bulk",
  authenticateToken,
  requireRole("DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS", "ANALISTA_TECNICO"),
  bulkUpdateSettings
);

router.post(
  "/backup",
  authenticateToken,
  requireRole("DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS", "ANALISTA_TECNICO"),
  exportDatabaseBackup
);

export default router;
