import { Router } from "express";
import {
  authenticateToken,
  checkPermission,
} from "../middleware/auth.middleware";
import {
  getUsers,
  getUserRoles,
  createStudent,
  getUserById,
  updateUser,
} from "../controllers/users.controller";

const router = Router();

// Todas las rutas de usuarios requieren autenticación previa
router.use(authenticateToken);

/**
 * GET /api/users
 * Lista usuarios con credenciales y doctorandos pre-registrados
 */
router.get("/", checkPermission("USUARIOS_VER"), getUsers);

/**
 * GET /api/users/roles
 * Consulta el catálogo de roles y sus permisos del sistema
 */
router.get("/roles", checkPermission("USUARIOS_VER"), getUserRoles);

/**
 * POST /api/users/estudiantes
 * Registra un nuevo estudiante doctorando en el padrón UGD
 */
router.post("/estudiantes", createStudent);

/**
 * GET /api/users/:id
 * Retorna información completa, expediente doctoral y citas de un usuario o doctorando
 */
router.get("/:id", checkPermission("USUARIOS_VER"), getUserById);

/**
 * PUT /api/users/:id
 * Actualiza estado de cuenta, información demográfica, académica o expediente
 */
router.put("/:id", checkPermission("USUARIOS_EDITAR"), updateUser);

export default router;
