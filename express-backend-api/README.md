# 🚀 Backend API - Proyecto Integrador UGD

Backend de API REST para el **Proyecto Integrador UGD**, desarrollado con **Express**, **TypeScript** y **Bun**, conectado a **Neon PostgreSQL** a través de **Prisma ORM**.

---

## 🛠️ Inicio Rápido

### 1. Instalar dependencias
```bash
bun install
```

### 2. Ejecutar servidor en modo desarrollo
```bash
bun run dev
```
El servidor se ejecutará en `http://localhost:3000`.

### 3. Sincronizar Base de Datos (Neon) y Sembrar Usuarios
```bash
bun run db:push
bun run db:seed
```

---

## 📚 Documentación Completa del Proyecto

Toda la guía técnica, arquitectura, matriz RBAC, mapeo de endpoints y manual de pruebas se encuentra organizada en la carpeta **[`docu/`](docu/README.md)**:

- 📖 [**`docu/README.md`**](docu/README.md): Índice principal.
- 🏛️ [**`docu/01-arquitectura-y-bd.md`**](docu/01-arquitectura-y-bd.md): Arquitectura, variables de entorno y esquema relacional Neon DB.
- 🔐 [**`docu/02-matriz-rbac-y-usuarios.md`**](docu/02-matriz-rbac-y-usuarios.md): Matriz de Roles, Permisos y cuentas sembradas con contraseñas.
- 🔌 [**`docu/03-mapeo-endpoints-api.md`**](docu/03-mapeo-endpoints-api.md): Especificación de endpoints HTTP, payloads JSON y códigos de error.
- 🧪 [**`docu/04-guia-de-pruebas.md`**](docu/04-guia-de-pruebas.md): Manual paso a paso para probar con `curl`, Postman y Thunder Client.
