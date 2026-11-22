import { prisma } from "./prisma";

let cachedStatus: string | null = null;
let lastCheckTime = 0;
const CACHE_TTL_MS = 2000; // 2 segundos de caché en memoria para no saturar la base de datos

/**
 * Consulta el estado operativo actual de la plataforma ("online", "offline", "lockdown").
 * Cuenta con un caché en memoria de 2 segundos de alta velocidad.
 */
export async function getSystemStatus(): Promise<string> {
  const now = Date.now();
  if (cachedStatus && now - lastCheckTime < CACHE_TTL_MS) {
    return cachedStatus;
  }

  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "system_status" },
    });
    cachedStatus = setting?.value || "online";
    lastCheckTime = now;
    return cachedStatus;
  } catch (error) {
    return cachedStatus || "online";
  }
}

/**
 * Invalida el caché en memoria para que los cambios en Ajustes tomen efecto de inmediato.
 */
export function invalidateSystemStatusCache(): void {
  cachedStatus = null;
  lastCheckTime = 0;
}
