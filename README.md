# Proyecto Integrador

Repositorio privado para organizar el trabajo de un monorepo con estas areas:

- documentacion en LaTeX
- backend del proyecto
- primer frontend
- segundo frontend

## Estructura prevista

```text
/
├─ Plan-Proyecto-Integrador/   # documentacion principal en LaTeX
├─ server/                     # backend
├─ frontend-1/                 # primer frontend
└─ frontend-2/                 # segundo frontend
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
