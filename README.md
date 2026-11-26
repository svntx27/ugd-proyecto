# Proyecto Integrador

Repositorio monorepo para el sistema de gestión de doctorandos de la Unidad de Gestión de Doctorados (UGD).

## Accesos Rápidos (Despliegues en Producción)

Enlaces de acceso rápido para desarrolladores y equipo de trabajo:

- **Panel Administrativo:** [https://admin-ugd.vercel.app](https://admin-ugd.vercel.app)
- **Panel de usuarios:** [https://ugd-usuarios.vercel.app](https://ugd-usuarios.vercel.app)
- **Documentacion Tecnica:** [https://ugd-doc-tecnica.vercel.app](https://ugd-doc-tecnica.vercel.app)

---

## Estructura del Proyecto

```text
/
├─ Plan-Proyecto-Integrador/   # Documentación principal en LaTeX
├─ express-backend-api/        # API REST Backend (Express, Prisma, PostgreSQL)
├─ next-frontend-admin/        # Panel Administrativo (Next.js)
├─ astro-frontend-users/       # Portal del Estudiante Doctoral (Astro SSR)
└─ fumadocs-documentation/     # Portal de Documentación Técnica (Fumadocs)
```

> La carpeta `Plan-Proyecto-Integrador/` contiene el material que normalmente se usara como base documental del proyecto.

## Que hay dentro de LaTeX

En `Plan-Proyecto-Integrador/` se centraliza el contenido academico y tecnico del proyecto. Actualmente incluye:

- portada, resumen, abstract y secciones preliminares
- analisis del problema, investigacion, justificacion y objetivos
- alcance, marco teorico, metodologia y cronograma
- recursos, presupuesto, referencias y anexos
- configuracion de estilos, paquetes y assets del documento

## Flujo de trabajo

1. La documentacion se mantiene en LaTeX dentro de `Plan-Proyecto-Integrador/`.
2. El backend se desarrollara en `server/`.
3. Los frontends se separaran en `frontend-1/` y `frontend-2/`.
4. Los cambios deben respetar las reglas de contribucion descritas en `CONTRIBUTE.md`.

## Convenciones generales

- Mantener cada cambio enfocado en una sola area.
- No mezclar documentacion, backend y frontends en el mismo commit si no es necesario.
- Evitar subir archivos generados, temporales o sensibles.
- Usar nombres claros para carpetas, ramas y commits.

## Estado actual

Por ahora el contenido principal disponible en el repositorio es la documentacion en LaTeX. Los directorios de servidor y frontends se agregaran conforme avance el monorepo.
