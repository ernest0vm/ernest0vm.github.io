# CLAUDE.md

CV / portafolio personal de Ernesto Valdez. Sitio estático en Astro, desplegado
en GitHub Pages bajo `https://ernest0vm.github.io/resume/`.

**Idioma**: el texto visible al usuario va en español; el código, los comentarios
y los mensajes de commit en inglés.

## Comandos

```bash
corepack enable   # una vez: activa el yarn fijado en package.json
yarn install
yarn dev          # http://localhost:4321/resume/
yarn build        # -> dist/
yarn preview      # sirve dist/ (ver "Verificación" abajo)
yarn lint
yarn format
```

`.claude/launch.json` define `astro-dev` (4321) y `astro-preview` (4322) para las
herramientas del navegador.

## Estructura

| Ruta                       | Qué es                                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/pages/index.astro`    | Única página. Normaliza los datos y compone las secciones.                                                                                 |
| `src/layouts/Layout.astro` | Shell HTML + capa de fondo fija + init de partículas.                                                                                      |
| `src/components/`          | `Nav`, `Hero`, `About`, `Timeline` (reusado para educación y empleos), `Skills`, `Portfolio`, `Footer`, y `Section` como envoltorio común. |
| `src/data/resumeData.json` | Todo el contenido. Editarlo no requiere tocar código.                                                                                      |
| `src/styles/global.css`    | Tailwind + tokens `@theme` + utilidades `glass`.                                                                                           |
| `src/utils/experience.js`  | Años de experiencia calculados y deletreados.                                                                                              |

## Contenido

Se edita en `src/data/resumeData.json`:

- Los iconos son nombres de iconify (`simple-icons:docker`, `fa6-brands:github`),
  no URLs. Se inlinean como SVG en el build vía `astro-icon`. **No volver a
  enlazar logos remotos**: las URLs anteriores (Wikimedia, S3) se rompieron tres
  veces. Colecciones instaladas: `simple-icons`, `fa6-brands`, `fa6-solid`.
- El `bio` lleva el token `{{years}}`, que `About.astro` sustituye por los años
  de experiencia. No escribir el número a mano.
- Los logos de empleos y educación (`logo`) **sí** son URLs remotas, por
  decisión explícita del dueño del repo pese al riesgo de que caduquen. Usan
  `https://www.google.com/s2/favicons?domain=X&sz=128`. Si el dominio no tiene
  favicon propio, el servicio devuelve un globo genérico (mismo hash para
  cualquier dominio inexistente): en ese caso **no** poner `logo` y dejar que
  `Timeline.astro` muestre el monograma. Ese monograma va debajo de la imagen,
  así que también cubre el día que una URL deje de responder.
- No tomar logos de LinkedIn ni de redes sociales: sus CDN firman las URLs con
  tokens que expiran en horas y bloquean el hotlinking.
- Verificar que el dominio pertenezca de verdad a la empresa antes de usarlo;
  ya hubo dos casos (`cant.mx`, `smsolutions.com.mx`) que resultaron ser
  negocios ajenos con nombre parecido.

## Años de experiencia

`src/utils/experience.js` cuenta años completos desde el 1 de septiembre de 2009
y los deletrea en español, con la apócope correcta ante sustantivo masculino
("veintiún años"). Se usa en el perfil y en habilidades; **siempre con letra**.

Se calcula en el build, así que `deploy.yml` corre también el día 1 de cada mes
para que el aniversario cambie sin necesidad de un push. GitHub desactiva los
workflows programados tras 60 días sin actividad en el repo.

## Estilos

Tailwind v4 vía `@tailwindcss/vite`. **No hay archivo de configuración**: el tema
vive en el bloque `@theme` de `src/styles/global.css`. Ese archivo es el
`entryPoint` de ESLint y el `tailwindStylesheet` de Prettier — si se mueve, hay
que actualizar ambos.

El lenguaje visual es glass: `glass` y `glass-strong`, declaradas con `@utility`.

### Trampa: `backdrop-filter` y el minificador

**Nunca declarar `backdrop-filter` y `-webkit-backdrop-filter` en la misma
regla.** El minificador las trata como una sola propiedad y conserva solo la
última. Eso ya rompió producción una vez: se publicó únicamente la versión con
prefijo, y los navegadores que implementan solo la estándar (Chrome, Firefox,
Safari 18+) renderizaron las superficies sin desenfoque, con aspecto de overlay
de opacidad plano. En dev no se veía porque el servidor de desarrollo no minifica.

La variante con prefijo vive en su propio `@supports`. El fallback opaco está
anidado en dos `@supports` porque escrito como `not (A or B)` el minificador lo
reescribe a `not A`.

### Trampa: `isolation: isolate` y el backdrop root

La capa de partículas y gradientes es `fixed` en `Layout.astro`, detrás de todo
(`-z-10`), para que las superficies glass tengan algo vivo que dejar ver en toda
la página. Un ancestro con `isolation: isolate` se convierte en _backdrop root_ y
recorta lo que `backdrop-filter` puede muestrear. Por eso el hero no lleva
`isolate`. No añadirlo a ninguna sección que contenga superficies glass.

Las partículas van fuera de la capa refractada a propósito: `cloneNode` no copia
los píxeles de un `<canvas>`.

## Verificación

Para cambios de CSS, **verificar contra `yarn preview` (build de producción), no
solo `yarn dev`**: los bugs de minificación no aparecen en dev.

Si el navegador muestra CSS viejo, forzar recarga con un query param; el hash del
archivo cambia en cada build, así que basta comparar el nombre servido contra
`dist/_astro/*.css`.

## Tooling

- **Yarn 4.10.3**, fijado en `packageManager`. Corepack lo activa.
- **`npmMinimalAgeGate: 10080`** en `.yarnrc.yml`: rechaza cualquier versión
  publicada hace menos de 7 días. Al agregar dependencias puede fallar con
  `YN0082: No candidates found`; la solución es bajar el piso del rango
  (`^3.1.0` → `^3.0.1`), no desactivar el gate. Yarn instalará igualmente la
  versión más nueva que sí pase el filtro. Para excepciones puntuales existe
  `npmPreapprovedPackages`.
- **ESLint** con `eslint-plugin-astro` + `eslint-plugin-better-tailwindcss`
  (solo reglas de corrección: clases en conflicto, desconocidas, concatenadas).
  El orden de clases lo hace Prettier, para que no se peleen.
- **ESLint no parsea TypeScript dentro de bloques `<script>`** de `.astro`.
  Escribir esos scripts en JS plano; el frontmatter sí acepta TS.
- **husky + lint-staged** corren ESLint y Prettier sobre lo staged en cada commit.

## Deploy

`.github/workflows/deploy.yml`: instala con `yarn install --immutable`, hace lint,
build y publica con `upload-pages-artifact` / `deploy-pages`. El source de Pages
es "GitHub Actions" — **no existe rama `gh-pages`** y no debe recrearse.

Corepack debe habilitarse **después** de `setup-node` y **antes** de cualquier
llamada a yarn; si no, responde el yarn 1.x global del runner y rechaza el pin.
Por eso tampoco se usa el `cache: yarn` de `setup-node`.

Al agregar `main` u otra rama al environment `github-pages`, revisar sus
deployment branch policies: un deploy puede fallar sin log si la rama no está
permitida.

## Base path

`base: '/resume'`. Las URLs de `public/` deben incluirlo (`/resume/favicon.ico`).
En dev, la petición automática del navegador a `/favicon.ico` en la raíz devuelve
500; es un artefacto del `base` en Astro, no un bug del sitio.
