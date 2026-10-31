# CLAUDE.md

CV / portafolio personal de Ernesto Valdez. Sitio estático en Astro, desplegado
en GitHub Pages como sitio de usuario: repo `ernest0vm/ernest0vm.github.io`,
servido en la raíz de `https://ernest0vm.github.io/`.

**Idioma**: el sitio es bilingüe — español en `/` (idioma por defecto,
sin prefijo) e inglés en `/en/`. El código, los comentarios y los
mensajes de commit van en inglés. En el texto visible en español, preferir el
término en español antes que el anglicismo cuando exista uno de uso corriente.

## Comandos

```bash
corepack enable   # una vez: activa el yarn fijado en package.json
yarn install
yarn dev          # http://localhost:4321/
yarn build        # -> dist/
yarn preview      # sirve dist/ (ver "Verificación" abajo)
yarn cv:pdf       # -> cv-pdf/*.pdf (ver "PDF del CV" abajo)
yarn lint
yarn format
```

`.claude/launch.json` define `astro-dev` (4321) y `astro-preview` (4322) para las
herramientas del navegador.

## Estructura

| Ruta                                                | Qué es                                                                                                                                     |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/pages/index.astro`, `src/pages/en/index.astro` | Rutas de cada idioma; solo montan `ResumePage` con su `locale`.                                                                            |
| `src/components/ResumePage.astro`                   | La página real: resuelve los textos del idioma y compone las secciones.                                                                    |
| `src/i18n/{es,en}/`                                 | Todo el texto visible, por idioma: `ui.json` (sitio), `content.json` (el CV), `cv.json` (etiquetas del PDF).                               |
| `src/i18n/index.js`                                 | `useTranslations(locale, namespace)` y los formateadores de fechas.                                                                        |
| `src/layouts/Layout.astro`                          | Shell HTML + capa de fondo fija + init de partículas.                                                                                      |
| `src/components/`                                   | `Nav`, `Hero`, `About`, `Timeline` (reusado para educación y empleos), `Skills`, `Portfolio`, `Footer`, y `Section` como envoltorio común. |
| `src/data/resume.json`                              | Los datos neutrales al idioma: nombres, fechas, URLs, logos, iconos, `id`s.                                                                |
| `src/styles/global.css`                             | Tailwind + tokens `@theme` + utilidades `glass`.                                                                                           |
| `src/utils/experience.js`                           | Años de experiencia calculados y deletreados.                                                                                              |
| `src/pages/cv/print-[lang].astro`                   | Maqueta imprimible del CV. Solo existe en el build del PDF; ver "PDF del CV".                                                              |
| `scripts/build-cv.mjs`                              | Construye esa maqueta y la imprime a PDF con Chrome.                                                                                       |
| `scripts/check-i18n.mjs`                            | Valida que los dos idiomas estén completos y en regla; corre en `yarn lint`.                                                               |

## Contenido

Se edita sin tocar código: los hechos en `src/data/resume.json` y el texto en
`src/i18n/{es,en}/content.json` (ver "Idiomas"):

- Los iconos son nombres de iconify (`simple-icons:docker`, `fa6-brands:github`),
  no URLs. Se inlinean como SVG en el build vía `astro-icon`. **No volver a
  enlazar logos remotos**: las URLs anteriores (Wikimedia, S3) se rompieron tres
  veces. Colecciones instaladas: `simple-icons`, `fa6-brands`, `fa6-solid`.
- El `bio` lleva la variable `{years}`, que se sustituye por los años de
  experiencia. No escribir el número a mano.
- Las fechas van en ISO (`"start": "2025-04"`, `"end": null` para el empleo
  actual) y se formatean por idioma con `Intl` («Abril 2025 - Actual»). No
  escribirlas como texto.
- `contact.phones` es una lista; el número con `"whatsapp": true` se muestra con
  ese icono y abre `wa.me`, los demás marcan con `tel:`. Van con lada
  internacional (`+52 …`), que es como se leen en el PDF en inglés.
- `quote`, `languages` y la `license` (cédula profesional) de cada entrada de
  educación salen tanto en el sitio como en el PDF.
- En `portfolio`, `stack` es la tecnología y `"retired": true` marca una app
  retirada de las tiendas (sin `url`); el texto «Retirada de las tiendas» sale
  de las traducciones, no se escribe en cada app.
- Los logos de empleos y educación (`logo`) **sí** son URLs remotas, por
  decisión explícita del dueño del repo. Hay tres orígenes válidos:
  1. `https://www.google.com/s2/favicons?domain=X&sz=128`. Si el dominio no
     tiene favicon propio, el servicio devuelve un globo genérico (mismo hash
     para cualquier dominio inexistente); en ese caso no usarlo.
  2. El `og:image` de una página **pública de empresa** en LinkedIn
     (`mx.linkedin.com/company/<slug>`). Estas URLs de `media.licdn.com` se
     emiten con `e=2147483647`, el centinela de no-caducidad, y cargan sin
     cookies ni referer. **Conservar el query completo**: sin la firma dan 403.
     Esto aplica solo a logos de empresa — las imágenes de perfil y de
     publicaciones sí llevan tokens que expiran en horas.

     **Ojo con el HTML pegado desde una sesión iniciada**: ahí LinkedIn sirve
     la variante `company-logo_100_100` con un `e=` de pocas semanas. Hay que
     volver a sacar la URL de la página pública, no reutilizar la pegada.

  3. `https://graph.facebook.com/<slug>/picture?type=large` para páginas
     públicas de Facebook. Devuelve 200 sin token y **no** es una URL firmada:
     Graph resuelve el CDN en cada petición, así que no caduca. Raspar
     `facebook.com/<slug>` directamente no sirve — responde 400 sin sesión y no
     expone `og:image`.
- **La fuente debe ser cuadrada.** `Timeline.astro` recorta el logo con
  `object-cover` y un radio interior (`calc(var(--radius-xl) - 0.375rem)`, el
  mismo esquema que la foto de perfil) para que las esquinas queden redondeadas.
  Con `object-contain` el radio recortaría una caja con márgenes transparentes y
  el redondeo no se vería; con `cover`, una fuente no cuadrada se recorta. Los
  tres orígenes de arriba ya lo son (favicons 128×128, `company-logo_200_200`,
  y la foto de página de Facebook).
- Si no hay ninguno de los tres, no poner `logo`: `Timeline.astro` dibuja un
  monograma. Va debajo de la imagen, así que también cubre el día que una URL
  deje de responder.
- Una misma empresa puede aparecer en varias entradas de `work` cuando son
  verticales de negocio distintas (hoy: Reserhub para B2B y Reservamos para
  B2C, cada una con el logo de su propio dominio). No fusionarlas.
- **No describir ninguna app como producto de marca blanca** (ni con el
  anglicismo equivalente), aunque así venga redactado en LinkedIn o en el CV
  original: es decisión explícita del dueño del repo. Ya se coló dos veces.
- Verificar que el dominio o la página pertenezca de verdad a la empresa antes
  de usarlo; ya hubo dos casos (`cant.mx`, `smsolutions.com.mx`) que resultaron
  ser negocios ajenos con nombre parecido.

## Idiomas

Los datos y el texto van separados. **Todo texto visible nuevo necesita su
versión en ambos idiomas.**

- **Datos** (`src/data/resume.json`): lo que no cambia entre idiomas —nombres
  de empresas, escuelas y apps, puestos, fechas ISO, URLs, logos, iconos— más
  un `id` estable por entrada de `work`, `education`, `portfolio` y
  `languages`.
- **Texto** (`src/i18n/<locale>/`), tres archivos por idioma:
  - `ui.json`: la plantilla del sitio (nav, encabezados, botones, `aria-label`).
  - `content.json`: el CV, indexado por esos `id` (`work.reserhub`,
    `education.utfv.degree`, `portfolio.vanda`…).
  - `cv.json`: las etiquetas de la maqueta del PDF.

  Se separan para que el workflow del PDF sepa qué le afecta: `ui.json` no
  está en sus `paths`.

`useTranslations(locale, namespace)` de `src/i18n/index.js` devuelve
`t(clave, variables)` con claves por puntos y variables `{nombre}`; si falta
una clave en inglés cae al español. Para que eso no pase en silencio,
**`scripts/check-i18n.mjs` corre dentro de `yarn lint`** (y por tanto en CI) y
falla si:

- los idiomas no tienen exactamente las mismas claves o las mismas variables;
- una entrada de `resume.json` no tiene su texto, o queda texto huérfano;
- el `bio` pierde `{years}`;
- aparece «marca blanca» / «white label» en cualquier archivo.

Para añadir un empleo: una entrada en `resume.work` con su `id`, y
`work.<id>` en los dos `content.json`. No se usa ninguna librería de i18n: en un
sitio estático no aportan nada que este helper no haga.

Cada componente recibe `locale` como prop desde `ResumePage`. Los años de
experiencia se deletrean por idioma (`diecisiete` / `seventeen`). El `<html
lang>`, los `hreflang` alternos y el selector ES/EN de la nav salen del mismo
`locale`; el selector conserva la sección actual al cambiar de idioma.

Las reglas de contenido de arriba —nada de «marca blanca», verificar dominios—
aplican igual en inglés.

Para verificar que no se cuele un idioma en el otro, buscar en `dist/index.html`
y `dist/en/index.html` palabras de interfaz del idioma contrario (p. ej.
«Empleos», «Ver correo» en la versión en inglés; «Experience», «Show email» en
la española).

## Datos de contacto

`phone` y `email` **no deben aparecer en claro en el HTML**. `About.astro` los
emite en base64 y los arma como enlaces `tel:`/`mailto:` al hacer clic en «Ver
teléfono» / «Ver correo» («Show phone» / «Show email» en inglés). No es cifrado —quien quiera puede decodificarlo—, pero
mantiene los valores fuera del alcance de los recolectores de direcciones, que
leen el HTML plano. Al tocar esa sección, verificar con `grep` sobre
`dist/index.html` **y** `dist/en/index.html` que los valores siguen sin aparecer.
(El enlace de WhatsApp en `main.social` ya expone ese número como
`wa.me/52…`; es anterior a esta regla y se dejó así.)

El PDF **sí** los lleva en claro, por decisión explícita del dueño del repo: es
para lo que sirve un CV descargable. Por eso la maqueta imprimible nunca se
publica como HTML (ver abajo).

## PDF del CV

Un PDF por idioma, generado a partir de `resume.json` y las traducciones,
publicado como archivos del release `cv` de GitHub. Los botones «Descargar
currículum» apuntan a `resume.cv.release` + `resume.cv.files[locale]`, así que
la URL nunca cambia y no queda ningún PDF en el historial de git. El script
toma los nombres de archivo de ese mismo lugar.

- **Workflow propio** (`.github/workflows/cv-pdf.yml`), separado del deploy:
  corre solo cuando cambian `resume.json`, `content.json` o `cv.json`, la
  maqueta del PDF, `src/i18n/index.js`, `experience.js`, las imágenes de
  `public/` o el propio script. Un cambio de estilo del sitio no lo
  dispara. También corre el 1 de septiembre, cuando cambian los años de
  experiencia, y a mano con `workflow_dispatch`.
- **Estilos desacoplados**: `src/pages/cv/print-[lang].astro` tiene su propio CSS y
  sus propias etiquetas (`cv.json`); no usa Tailwind, `global.css` ni `ui.json`. Así nada del
  sitio afecta al PDF sin regenerarlo. Por eso tiene una excepción a
  `better-tailwindcss/no-unknown-classes` en `eslint.config.js`. Si se le añade
  una dependencia nueva, agregarla también a los `paths` del workflow.
- **La ruta no existe en el build normal**: su `getStaticPaths` devuelve `[]`
  salvo con `CV_PDF=1`, que solo pone `scripts/build-cv.mjs`. Ese script
  construye en `dist-cv/` (no pisa `dist/`), lo sirve con `astro preview` en el
  puerto 4330 e imprime con `playwright-core` usando el Chrome instalado (el
  runner de GitHub ya trae uno; `CHROME_PATH` para otro binario). No descarga
  navegadores.
- Para iterar sobre la maqueta: `CV_PDF=1 yarn dev` y abrir
  `http://localhost:4321/cv/print-es/` (no `/cv/es/`: el enrutado de idiomas toma un segmento `/es/` como prefijo del idioma por defecto y responde 404). Para revisar el resultado final,
  `yarn cv:pdf` y abrir `cv-pdf/`.
- Al verificar el sitio, comprobar que `dist/` no tenga carpeta `cv/`.
- **La cita va abajo a la derecha de la última página** (decisión del dueño).
  CSS no puede apuntar a «la última página», así que el script imprime dos
  veces: la primera cuenta páginas y la segunda añade la clase `pinned`, que
  estira el contenido hasta el final de la última página y saca la cita del
  flujo a esa esquina. Si la segunda pasada da otro número de páginas, el
  script falla en vez de publicar un PDF descuadrado.
- La foto de `public/images/` trae marco circular y un pie con el nombre; la
  maqueta la recorta con `object-view-box`. Si se cambia la foto, revisar ese
  recorte.

## Años de experiencia

`src/utils/experience.js` cuenta años completos desde el día 1 del mes en que
empieza el empleo más antiguo de `resume.json` (hoy, septiembre de 2009)
y los deletrea en el idioma de la página: en español con la apócope correcta
ante sustantivo masculino ("veintiún años"), en inglés con guion en los
compuestos ("twenty-one years"). Se usa en el perfil, en habilidades y en la
meta description; **siempre con letra**.

Se calcula en el build, así que `deploy.yml` corre también el día 1 de cada mes
para que el aniversario cambie sin necesidad de un push. GitHub desactiva los
workflows programados tras 60 días sin actividad en el repo.

## Estilos

Tailwind v4 vía `@tailwindcss/vite`. **No hay archivo de configuración**: el tema
vive en el bloque `@theme` de `src/styles/global.css`. Ese archivo es el
`entryPoint` de ESLint y el `tailwindStylesheet` de Prettier — si se mueve, hay
que actualizar ambos.

El lenguaje visual es glass: `glass` y `glass-strong`, declaradas con `@utility`.
Cada superficie lleva un tinte, un brillo superior y un reflejo radial en
`background-image`, y un **anillo especular** en `::after`: un borde degradado
de 1 px, más brillante arriba, recortado con `mask-composite: exclude`. La
técnica está adaptada de [Glassy UI](https://github.com/alexburlis/glassyui)
(MIT); no se adoptó la librería porque todos sus componentes son React con
`"use client"` y el lente se calcula en el navegador, lo que obligaría a
hidratar React en cada superficie de un sitio que hoy no envía JS de framework.
También vive ahí `fade-end`, que desvanece la lista de la nav antes del selector
de idioma para que los enlaces que desbordan se lean como deslizables.

**Una clase propia que se use en el markup va como `@utility` en `global.css`,
no en el `<style>` del componente.** El plugin de Tailwind para ESLint solo
conoce lo que ve a través del `entryPoint`, así que una clase definida en un
`<style>` local falla con `no-unknown-classes` aunque el sitio se vea bien.
(`scrollbar-none` no es excepción: es una utilidad nativa de Tailwind v4. El
`<style>` de `Nav.astro` solo le añade `::-webkit-scrollbar` para Safari < 18.2.)

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

Desde Astro 7.4 (Vite 8.3) el minificador además **reescribe cualquier prueba de
`backdrop-filter` dentro de `@supports`** a `(-webkit-backdrop-filter: …) or
(backdrop-filter: …)`. Por eso el bloque de Safari < 18 se condiciona solo a la
variante con prefijo: la guarda anterior, «con prefijo y sin estándar», quedó
convertida en una condición imposible y Safari 17 se habría quedado sin
desenfoque. Tras actualizar Astro o Vite, revisar los `@supports` del CSS
publicado (`grep -o '@supports[^{]*backdrop[^{]*{' dist/_astro/*.css`).

### Guardas de accesibilidad

Al final de `global.css`, **sin capa a propósito**: una regla sin capa le gana
a cualquier utilidad de la capa `utilities`, así que ninguna clase en el markup
puede devolver la transparencia.

- `prefers-reduced-transparency: reduce` → superficie opaca (`ink-900`), sin
  desenfoque ni brillo.
- `prefers-contrast: more` → vidrio oscuro al 88 %, anillo sólido en el color
  del texto y todo `text-white/*` a blanco pleno.
- `forced-colors: active` → contorno en `CanvasText`, sin anillo, el foco por
  encima de ese contorno y el enlace activo de la nav marcado con `Highlight`
  (su única señal era un fondo, que el modo de alto contraste elimina).

Para probarlas sin cambiar el sistema operativo, reescribir por CSSOM la
condición de la `@media` a `all` (`rule.media.mediaText = 'all'`) y leer el
estilo computado. **Esperar a que terminen las transiciones** antes de leer:
la utilidad `transition` anima `background-color` y `backdrop-filter`, así que
una lectura inmediata devuelve el valor viejo y parece que la guarda falla.
`:focus-visible` no se activa con `element.focus()` desde JS; hay que usar un
Tab real.

### Trampa: `isolation: isolate` y el backdrop root

La capa de partículas y gradientes es `fixed` en `Layout.astro`, detrás de todo
(`-z-10`), para que las superficies glass tengan algo vivo que dejar ver en toda
la página. Un ancestro con `isolation: isolate` se convierte en _backdrop root_ y
recorta lo que `backdrop-filter` puede muestrear. Por eso el hero no lleva
`isolate`. No añadirlo a ninguna sección que contenga superficies glass. Lo
mismo vale para `opacity < 1`, `filter`, `mask` o `mix-blend-mode` en un
**ancestro** de la superficie: por eso el `mask` del anillo vive en el propio
`::after` y `fade-end` se aplica a un hijo de la nav, no a la nav.

El minificador expande el atajo `mask` en propiedades largas (`mask-image`,
`mask-clip`, `mask-composite`…) y añade por su cuenta el `-webkit-mask-composite`
equivalente. Para verificar el CSS publicado, buscar las propiedades largas, no
el atajo.

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
- **Node ≥ 22.23.4**: lo exige Astro 7.4. CI usa el último 22.x de `setup-node`.
- **Dependabot**: alertas y actualizaciones de seguridad activadas en la
  configuración del repo (llegan de inmediato). `.github/dependabot.yml` añade
  actualizaciones mensuales de versión, un PR agrupado por ecosistema (npm y
  GitHub Actions) para minor y patch, con la misma espera de 7 días que el
  filtro de Yarn. Antes de fusionar uno que toque Astro o Vite, revisar la
  trampa del minificador de arriba contra `yarn preview`.

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

**Un deploy fallido no se arregla con «Re-run jobs».** `actions/deploy-pages`
usa el SHA del commit como `pages_build_version`, así que el ID del despliegue
es el SHA. Si ese SHA ya quedó en `failure`, cualquier reintento —re-run o
`workflow_dispatch`— choca con él y muere en segundos con `Deployment
cancelled`. La salida es empujar un commit nuevo. Antes de asumir cuota,
comprobar: el límite de Pages son 10 despliegues por hora y se consulta con
`gh api repos/<owner>/<repo>/deployments`.

## URLs y la mudanza desde `/resume/`

El sitio vivió hasta octubre de 2026 en el repo `ernest0vm/resume`, como página
de proyecto bajo `/resume/`. Se mudó aquí, con su historial, para servirse en la
raíz; ya no hay `base` en `astro.config.mjs`.

Durante la mudanza hubo redirecciones de `/resume/` y `/resume/en/` hacia la
raíz (en `public/resume/`). Se quitaron por decisión del dueño del repo, así
que las URLs viejas responden 404. Si se quisieran recuperar, son dos
`index.html` con `location.replace('/' + location.hash)`, y solo funcionan si
el repo `ernest0vm/resume` sigue sin Pages: una página de proyecto le gana a la
ruta del sitio de usuario con el mismo nombre.

Los PDFs se publican en el release `cv` de **este** repo. El del repo viejo
quedó congelado con la última versión anterior a la mudanza.

Si algún día se vuelve a usar un `base`, las rutas fijas a revisar son las
fuentes en `global.css` y en la maqueta del PDF, y la URL que abre
`scripts/build-cv.mjs`.
