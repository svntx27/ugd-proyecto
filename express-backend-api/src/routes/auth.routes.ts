import { Router } from "express";
import {
  login,
  adminLogin,
  register,
  getProfile,
  generateSseTicket,
  verifyDoctorando,
  activateDoctorandoAccount,
} from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { authRateLimiter } from "../middleware/rate-limit.middleware";

const router = Router();

// Endpoints principales de autenticación protegidos con Rate Limiting
router.post("/login", authRateLimiter, login);
router.post("/admin-login", authRateLimiter, adminLogin);
router.post("/register", authRateLimiter, register);
router.get("/me", authenticateToken, getProfile);

// Endpoint para obtener ticket efímero de conexión SSE (evita exponer JWT en URL)
router.post("/sse-ticket", authenticateToken, generateSseTicket);

// Endpoints de Verificación y Activación de Doctorandos UGD
router.post("/verificar-doctorando", authRateLimiter, verifyDoctorando);
router.post("/verify-doctorando", authRateLimiter, verifyDoctorando); // alias en inglés
router.post("/activar-cuenta", authRateLimiter, activateDoctorandoAccount);
router.post("/activate", authRateLimiter, activateDoctorandoAccount); // alias en inglés

export default router;
