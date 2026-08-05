# My resume webapp

CV / portafolio personal construido con [Astro](https://astro.build), publicado en GitHub Pages mediante GitHub Actions.

## Desarrollo

El gestor de paquetes es **Yarn 4.10.3**, fijado en `packageManager` dentro de [package.json](package.json). Corepack (incluido en Node 22) lo activa solo:

```bash
corepack enable
yarn install
yarn dev
```

El sitio corre en `http://localhost:4321/resume/`. El contenido (educación, empleos, habilidades, portafolio) se edita en [src/data/resumeData.json](src/data/resumeData.json) sin tocar código.

## Estilos

Todo el CSS es **Tailwind v4**, cargado con `@tailwindcss/vite`. No hay hojas de estilo propias en `public/`: los tokens (tipografía, paleta, radios) viven en el bloque `@theme` de [src/styles/global.css](src/styles/global.css).

El lenguaje visual es _glass_: superficies translúcidas con `backdrop-filter`. Está encapsulado en dos utilidades declaradas con `@utility` en ese mismo archivo:

- `glass` — superficie estándar (nav, tarjetas, chips, botones).
- `glass-strong` — variante más densa para superficies sobre contenido cargado.

Ambas incluyen un `@supports not (backdrop-filter: ...)` que cae a un relleno opaco, para que el texto siga siendo legible donde no haya soporte.

Los iconos son SVG inline vía [astro-icon](https://www.astroicon.dev) (colecciones `fa6-brands` y `fa6-solid`), así que no hay fuentes de iconos que descargar.

## Protección de dependencias

[.yarnrc.yml](.yarnrc.yml) define `npmMinimalAgeGate: 10080` (minutos = 7 días): Yarn rechaza cualquier versión publicada hace menos de una semana. Es la ventana en la que suelen detectarse publicaciones comprometidas o secuestros de cuentas, así que esperar 7 días mantiene esa clase de ataque fuera de las instalaciones.

Si una actualización es urgente y confías en ella, agrégala a `npmPreapprovedPackages` en `.yarnrc.yml` para exceptuarla del gate.

## Calidad de código

- **Prettier** formatea y **ESLint** valida (`yarn format` / `yarn lint`).
- **husky + lint-staged** corren ambos automáticamente sobre los archivos staged en cada commit.

Ambos entienden Tailwind, con los roles separados para que no se peleen por las mismas líneas:

- `prettier-plugin-tailwindcss` ordena las clases. Lee el tema desde `tailwindStylesheet`, apuntado a `src/styles/global.css`.
- `eslint-plugin-better-tailwindcss` aporta solo las reglas de corrección — clases en conflicto (`flex` + `block`), desconocidas y concatenadas — vía su `entryPoint`, que en Tailwind v4 es esa misma hoja. Las utilidades propias (`glass`, `glass-strong`) se reconocen sin configuración extra.

## Build y deploy

```bash
yarn build    # genera dist/
```

El deploy es automático: cada push a `main` dispara el workflow [deploy.yml](.github/workflows/deploy.yml), que instala con `yarn install --immutable`, hace lint, build y publica a GitHub Pages (source: GitHub Actions, sin rama `gh-pages`).
