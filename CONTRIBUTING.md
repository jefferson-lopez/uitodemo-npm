# Contributing

Gracias por contribuir a `uitodemo`.

## Requisitos

- Node.js 20+
- `pnpm` 10+

## Desarrollo local

1. Instala dependencias con `pnpm install`.
2. Inicia el workspace con `pnpm dev`.
3. Verifica cambios con `pnpm lint`, `pnpm typecheck` y, si aplica, las pruebas del paquete.

## Estructura

- `apps/www`: sitio demo en Next.js
- `packages/uitodemo`: paquete publicable

## Convenciones

- Mantén los cambios acotados al objetivo del PR.
- No mezcles refactors grandes con fixes funcionales.
- Usa nombres descriptivos en commits y pull requests.
- Si cambias APIs públicas, actualiza la documentación correspondiente.

## Pull requests

- Explica el problema y la solución.
- Incluye pasos de verificación manual o automática.
- Adjunta capturas si hay cambios visuales.
