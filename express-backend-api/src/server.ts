import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/users.routes";
import procesosRoutes from "./routes/procesos.routes";
import tecnicoRoutes from "./routes/tecnico.routes";
import representativesRoutes from "./routes/representatives.routes";
import appointmentsRoutes from "./routes/appointments.routes";
import settingsRoutes from "./routes/settings.routes";
import { errorHandler } from "./middleware/error.middleware";
import { globalRateLimiter } from "./middleware/rate-limit.middleware";

dotenv.config();

// Validación preventiva de seguridad para JWT_SECRET
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    console.error("FATAL: JWT_SECRET no está definido en variables de entorno para producción.");
    process.exit(1);
  } else {
    console.warn("ADVERTENCIA DE SEGURIDAD: JWT_SECRET no está definido en .env, usando clave provisional de desarrollo.");
  }
}

const app = express();

// Configuración para proxies inversos (Render / Cloudflare / Load Balancers)
app.set("trust proxy", 1);

const PORT = process.env.PORT || 3000;

const defaultAllowedOrigins = [
  "http://localhost:4321",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:4321",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002",
  "http://127.0.0.1:3000",
];

const customOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...customOrigins]));

const customRegexStr = process.env.CORS_ORIGIN_REGEX;
const customRegex = customRegexStr ? new RegExp(customRegexStr) : null;
// Patrón seguro para subdominios y previews legítimas de Vercel para este proyecto
const defaultVercelRegex = /^https:\/\/(proyecto-integrador|next-frontend-admin|astro-frontend-users|ugd-[a-z0-9-]+)[a-zA-Z0-9.-]*\.vercel\.app$/;

app.use(
  cors({
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      // Permitir peticiones sin origen (como Postman, mobile o peticiones server-to-server de SSR)
      if (!origin) return callback(null, true);
      
      // Permitir dominios explícitos configurados
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }

      // Permitir dominios que cumplan con la expresión regular autorizada
      if ((customRegex && customRegex.test(origin)) || defaultVercelRegex.test(origin)) {
        return callback(null, true);
      }

      // Permitir cualquier puerto de localhost o 127.0.0.1 para desarrollo y pruebas locales
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      
      // Bloquear cualquier origen no autorizado
      return callback(new Error(`Acceso bloqueado por política CORS: origen '${origin}' no autorizado`), false);
    },
    credentials: true,
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(globalRateLimiter);
app.use(express.json());

// Endpoint de estado general
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "API Express - Sistema de Citas Presenciales UGD",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Rutas de Dominio (/representatives y /appointments)
app.use("/api/representatives", representativesRoutes);
app.use("/api/personal-ugd", representativesRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/citas", appointmentsRoutes);

app.use("/representatives", representativesRoutes);
app.use("/personal-ugd", representativesRoutes);
app.use("/appointments", appointmentsRoutes);
app.use("/citas", appointmentsRoutes);

// Alias de compatibilidad (/labs y /reservas)
app.use("/api/labs", representativesRoutes);
app.use("/labs", representativesRoutes);
app.use("/api/reservas", appointmentsRoutes);
app.use("/reservas", appointmentsRoutes);

// Rutas Complementarias
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/procesos", procesosRoutes);
app.use("/api/tecnico", tecnicoRoutes);
app.use("/api/settings", settingsRoutes);

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/settings", settingsRoutes);

// Middleware centralizado de manejo de errores (debe ir después de todas las rutas)
app.use(errorHandler);

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`🚀 API Express UGD ejecutándose en http://localhost:${PORT}`);
});
