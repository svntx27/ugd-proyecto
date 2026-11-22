import type { Response } from "express";

interface SSEClient {
  id: string;
  res: Response;
  userId?: string;
  roleCode?: string;
}

class SSEManager {
  private clients: Map<string, SSEClient> = new Map();

  addClient(id: string, res: Response, userId?: string, roleCode?: string): void {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const flushable = res as Response & { flushHeaders?: () => void };
    if (typeof flushable.flushHeaders === "function") {
      flushable.flushHeaders();
    }

    const pingInterval = setInterval(() => {
      try {
        res.write(": ping\n\n");
      } catch {
        clearInterval(pingInterval);
        this.clients.delete(id);
      }
    }, 25000);

    const client: SSEClient = { id, res, userId, roleCode };
    this.clients.set(id, client);

    // Mensaje de confirmación de conexión
    res.write(
      `event: connected\ndata: ${JSON.stringify({
        status: "connected",
        timestamp: new Date().toISOString(),
      })}\n\n`
    );

    res.on("close", () => {
      clearInterval(pingInterval);
      this.clients.delete(id);
    });
  }

  broadcast(event: string, payload: unknown): void {
    const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const [id, client] of this.clients.entries()) {
      try {
        client.res.write(data);
      } catch {
        this.clients.delete(id);
      }
    }
  }

  getClientCount(): number {
    return this.clients.size;
  }
}

export const sseManager = new SSEManager();
