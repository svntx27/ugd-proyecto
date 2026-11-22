# Guia de contribucion

Este documento define las reglas minimas para contribuir al repositorio privado de **Proyecto Integrador**. El objetivo es mantener un historial claro, revisable y consistente para el trabajo interno del monorepo.

## Alcance del repositorio

Este proyecto se organiza como un monorepo con estas areas principales:

- `Plan-Proyecto-Integrador/`: documentacion y material en LaTeX.
- `server/`: backend del proyecto.
- `frontend-1/`: primer frontend.
- `frontend-2/`: segundo frontend.

Si alguna carpeta todavia no existe, este archivo sirve como referencia para cuando se agregue.

## Antes de empezar

1. Leer el `README.md` y la documentacion relacionada en `Plan-Proyecto-Integrador/`.
2. Confirmar que el cambio pertenece a una sola area del monorepo.
3. Revisar si ya existe una rama o cambio previo sobre el mismo tema.
4. Para cambios grandes, coordinar primero con el equipo antes de mover codigo.

## Flujo general

1. Actualizar la rama local antes de comenzar a trabajar.
2. Crear una rama nueva para cada cambio o grupo de cambios relacionados.
3. Hacer commits pequenos, descriptivos y consistentes.
4. Abrir un Pull Request o solicitar revision interna con una descripcion clara del cambio.
5. Esperar revision antes de fusionar cambios importantes.

## Formato de commits

Todos los commits deben seguir este formato:

```text
tipo(alcance): descripcion breve
```

Ejemplo:

```text
docs(repo): actualizar guia de contribucion
```

La descripcion debe escribirse en minusculas, sin punto final, y de forma breve pero especifica.

### Tipos permitidos

- `docs`: cambios en documentacion, README, guias o archivos de texto.
- `feat`: nueva funcionalidad o mejora visible para el usuario.
- `fix`: correccion de errores.
- `refactor`: reorganizacion interna sin cambiar el comportamiento.
- `style`: cambios de formato, estilo o presentacion sin alterar la logica.
- `assets`: incorporacion, reemplazo o eliminacion de imagenes, audio, iconos u otros recursos.
- `chore`: tareas de mantenimiento, configuracion o limpieza general.
- `test`: pruebas, validaciones o archivos relacionados con verificacion.
- `ci`: ajustes en integraciones, automatizacion o flujos de trabajo.

### Alcances recomendados

Usar el alcance para indicar la zona afectada:

- `repo`
- `docs`
- `config`
- `server`
- `frontend-1`
- `frontend-2`
- `assets`
- `tests`
- `build`

Ejemplos validos:

```text
docs(repo): mejorar reglas de contribucion
chore(config): actualizar configuracion general
feat(server): agregar nuevo endpoint
fix(frontend-1): corregir error de renderizado
assets(docs): reemplazar imagen de referencia
```

## Reglas para escribir commits

- Evitar mensajes genericos como `Cambios`, `Actualizacion`, `Subida de archivo` o `Arreglos varios`.
- Cada commit debe representar una intencion clara.
- No mezclar cambios de codigo, documentacion y assets en un mismo commit si no dependen entre si.
- No incluir archivos temporales, builds generados o archivos personales.
- Si un cambio afecta documentacion y funcionalidad al mismo tiempo, separar en commits distintos cuando sea posible.
- Si el cambio afecta LaTeX, mantener el commit enfocado en `Plan-Proyecto-Integrador/` y no mezclarlo con frontend o servidor salvo que sea estrictamente necesario.

## Revisiones

Como el repositorio es privado, la revision se hara por el flujo interno acordado por el equipo. En general cada cambio debe incluir:

- Resumen breve de lo realizado.
- Archivos o areas afectadas.
- Motivo del cambio.
- Evidencia o capturas si el cambio es visual.
- Confirmacion de pruebas o validacion, cuando aplique.

Formato recomendado:

```markdown
## Resumen
- Describe los cambios principales.

## Archivos afectados
- Lista las carpetas o archivos mas importantes.

## Verificacion
- Indica como se reviso el cambio.
```

## Convenciones para ramas

Usar nombres breves y descriptivos:

```text
docs/contribution-guide
feat/server-api
fix/frontend-1-state
chore/repo-cleanup
docs/latex-update
```

## Buenas practicas para el proyecto

- Mantener un tono respetuoso y colaborativo en commits y revisiones.
- No subir secretos, credenciales ni datos sensibles.
- Evitar archivos innecesarios, binarios pesados o contenido generado que no deba versionarse.
- Acompanhar los cambios de documentacion cuando una modificacion lo requiera.
- Verificar ortografia y claridad antes de cerrar un cambio.

## Antes de entregar un cambio

- Revisar que el historial de commits sea claro.
- Confirmar que no existan archivos innecesarios en el commit.
- Verificar que los cambios funcionen o queden correctamente documentados.
- Comprobar que las referencias usadas existan en el repositorio.
- Mantener la rama actualizada con la rama principal del proyecto.
