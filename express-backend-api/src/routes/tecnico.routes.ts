import { Router, type Response } from "express";
import {
  authenticateToken,
  checkPermission,
  type AuthenticatedRequest,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken);

/**
 * GET /api/tecnico/diagnostico
 * Solo accesible por: DESARROLLADOR, ANALISTA_TECNICO (que tienen TECNICO_ACCESO)
 * El DIRECTOR o ESTUDIANTE no tienen este permiso.
 */
router.get(
  "/diagnostico",
  checkPermission("TECNICO_ACCESO"),
  (req: AuthenticatedRequest, res: Response) => {
    res.json({
      message: "Acceso al módulo técnico concedido",
      solicitante: req.user?.email,
      rol: req.user?.role.code,
      status: "Sistemas operativos y servicios de base de datos Neon operando con normalidad",
    });
  }
);

export default router;
