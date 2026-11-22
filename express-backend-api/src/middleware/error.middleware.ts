import type { Request, Response, NextFunction } from "express";

/**
 * Middleware centralizado para captura y manejo de errores.
 * Asegura que todas las respuestas de error sean JSON consistentes
 * y oculta los detalles técnicos/stack traces en entornos de producción.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Manejo específico de bloqueo por política CORS
  if (err && typeof err.message === "string" && err.message.includes("CORS")) {
    res.status(403).json({
      error: err.message,
    });
    return;
  }

  // Manejo de errores de parseo JSON (cuerpo malformado en express.json())
  if (err instanceof SyntaxError && "body" in err && (err as any).status === 400) {
    res.status(400).json({
      error: "Sintaxis de solicitud JSON no válida en el cuerpo de la petición.",
    });
    return;
  }

  const isProduction = process.env.NODE_ENV === "production";
  const statusCode = typeof err.status === "number" ? err.status : 500;

  console.error(`[Error Handler] ${req.method} ${req.originalUrl}:`, err);

  res.status(statusCode).json({
    error: isProduction
      ? "Ocurrió un error interno en el servidor."
      : (err.message || "Error interno del servidor"),
    ...(isProduction ? {} : { stack: err.stack }),
  });
}
