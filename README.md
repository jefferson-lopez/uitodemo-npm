# `uitodemo` monorepo

Monorepo con `pnpm` + `Turborepo` para mantener:

- `packages/uitodemo`: el paquete npm
- `apps/www`: la web demo en `Next.js`

## Estructura

```text
apps/
  www/             # Demo site en Next.js
packages/
  uitodemo/        # Libreria React publicable a npm
```

## Flujo recomendado

1. Instala dependencias en la raiz con `pnpm install`.
2. Levanta todo con `pnpm dev`.
3. Publica el paquete desde `packages/uitodemo`.

## Notas

- No ejecuté `pnpx create-next-app@latest`, como pediste.
- El paquete compila a `dist/` con `tsup`.
- Los cursores viven dentro de la libreria; la web demo no necesita copiarlos a `public/`.
