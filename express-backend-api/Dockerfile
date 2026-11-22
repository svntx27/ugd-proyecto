# ===================================================================
# Dockerfile para Render - express-backend-api (Bun + Prisma)
# ===================================================================

FROM oven/bun:1-alpine AS runner
WORKDIR /app

# Instalar OpenSSL y bibliotecas de compatibilidad de libc para Prisma
RUN apk add --no-cache openssl libc6-compat

# Copiar archivos de dependencias y esquema de base de datos
COPY package.json bun.lock ./
COPY prisma ./prisma/

# Instalar dependencias de producción
RUN bun install

# Generar el cliente Prisma optimizado para el entorno contenedor
RUN bunx prisma generate

# Copiar el código fuente del backend
COPY tsconfig.json ./
COPY src ./src/

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Exponer el puerto
EXPOSE 3000

# Iniciar la API con Bun
CMD ["bun", "src/server.ts"]
