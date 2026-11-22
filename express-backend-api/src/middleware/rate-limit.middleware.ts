import rateLimit from "express-rate-limit";

/**
 * Limitador de tasa para mitigar ataques de fuerza bruta y credential stuffing
 * en las rutas de autenticación críticas (/login, /admin-login, /activar-cuenta, /verificar-doctorando).
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 15, // Máximo 15 intentos por ventana de 15 minutos por IP
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Demasiados intentos de autenticación desde esta dirección IP. Por favor espere 15 minutos antes de reintentar.",
  },
});

/**
 * Limitador general moderado para toda la API.
 * Protege contra scraping descontrolado, ataques de denegación de servicio (DoS)
 * y saturación de la base de datos Neon.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 500, // 500 peticiones por ventana de 15 min por IP (suficiente para navegación fluida en SPAs)
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: (req) => {
    // No limitar health check ni SSE stream
    return req.path === "/health" || req.path === "/" || req.path.includes("/stream");
  },
  message: {
    error: "Límite de solicitudes alcanzado. Por favor intente nuevamente en unos minutos.",
  },
});
