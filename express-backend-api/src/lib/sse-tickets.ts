import crypto from "crypto";

interface SseTicket {
  userId: string;
  role: string;
  expiresAt: number;
}

// Almacén en memoria para tickets de un solo uso de SSE
const ticketStore = new Map<string, SseTicket>();

// Limpieza automática cada 5 minutos para tickets huérfanos no consumidos
setInterval(() => {
  const now = Date.now();
  for (const [ticket, data] of ticketStore.entries()) {
    if (data.expiresAt <= now) {
      ticketStore.delete(ticket);
    }
  }
}, 5 * 60 * 1000).unref();

/**
 * Genera un ticket criptográfico efímero de un solo uso (TTL: 60 segundos por defecto)
 */
export function createSseTicket(userId: string, role: string, ttlSeconds = 60): string {
  const ticket = crypto.randomBytes(24).toString("hex");
  ticketStore.set(ticket, {
    userId,
    role,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
  return ticket;
}

/**
 * Consume un ticket efímero de SSE.
 * Es de un solo uso (se borra inmediatamente al consumirse) y valida expiración.
 */
export function consumeSseTicket(ticket: string): SseTicket | null {
  const data = ticketStore.get(ticket);
  if (!data) return null;

  // Single-use: invalidar inmediatamente para prevenir replay attacks
  ticketStore.delete(ticket);

  if (Date.now() > data.expiresAt) {
    return null;
  }
  return data;
}
