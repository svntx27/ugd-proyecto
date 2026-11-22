import { Router, type Response } from "express";
import {
  authenticateToken,
  checkPermission,
  type AuthenticatedRequest,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken);

/**
 * GET /api/procesos
 * Accesible por: DESARROLLADOR, DIRECTOR, ANALISTA_PROCESOS, ANALISTA_TECNICO, ESTUDIANTE (poseen PROCESOS_VER)
 */
router.get("/", checkPermission("PROCESOS_VER"), (req: AuthenticatedRequest, res: Response) => {
  res.json({
    message: "Consulta de procesos autorizada",
    userRole: req.user?.role.code,
    data: [
      { id: "PROC-001", nombre: "Gestión de Matrículas UGD", estado: "Activo" },
      { id: "PROC-002", nombre: "Validación de Horarios Docentes", estado: "En Revisión" },
    ],
  });
});

/**
 * POST /api/procesos
 * Requiere: PROCESOS_CREAR (DESARROLLADOR, DIRECTOR, ANALISTA_PROCESOS)
 */
router.post("/", checkPermission("PROCESOS_CREAR"), (req: AuthenticatedRequest, res: Response) => {
  res.json({
    message: "Proceso creado exitosamente",
    creadoPor: req.user?.name,
  });
});

export default router;
