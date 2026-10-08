# Tokens del sistema de diseño (copia local)

Copia de los módulos de `sistema-diseño-test/shared/foundations/tokens/`, baseline del 2026-06-24, copiada el 2026-10-08. El repositorio original no se modifica.

## Por qué es una copia

Vercel construye solo este repositorio. Importar los tokens desde la carpeta vecina funcionaría en local, pero fallaría al publicar.

## Reglas de uso en esta rama

- Los archivos `.css` de módulo no se editan. Para actualizarlos, se vuelven a copiar desde el original.
- `typography.css` no se incluye, porque declara `@font-face` de Nunito con rutas locales. La fuente sigue cargándose desde Google Fonts en `index.html`.
- La paleta `tt-*` de Tailwind (`tailwind.config.js`) **no** se reconecta a estos tokens, porque algunos valores difieren. Por ejemplo, `tt-ink-2` es `#666666` en Tailwind y `rgb(57, 61, 66)` en el sistema. Reconectarla cambiaría pantallas fuera del alcance.
- Los componentes nuevos y los que se modifican dentro del alcance usan `var(--tt-*)`. Si un componente modificado tenía un color escrito a mano, se reemplaza solo por un token de **valor idéntico**, para no generar controles equivalentes que se vean distintos.
- El tema oscuro está pendiente: el sistema no lo define.

## Equivalencias usadas (valor idéntico)

| Antes | Token |
|---|---|
| `#3200C1` | `--tt-indigo` |
| `#37FFDB` | `--tt-cian` |
| `#EAF2FC` | `--tt-indigo-50` |
| `#343A40` | `--tt-ink` |
| `#666666` | `--tt-ink-3` |
| `#E5E5E5` | `--tt-divider` |
| `#FFFFFF` | `--tt-white` |
