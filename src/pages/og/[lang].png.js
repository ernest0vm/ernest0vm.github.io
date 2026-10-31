/**
 * Social preview image (Open Graph / Twitter card), one per locale, rendered
 * at build time: satori lays the card out as SVG and resvg rasterizes it,
 * since link previews do not accept SVG. Served at /og/es.png and /og/en.png.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import resume from '../../data/resume.json';
import { LOCALES, useTranslations } from '../../i18n/index.js';
import { experienceInWordsCapitalized } from '../../utils/experience.js';

export const WIDTH = 1200;
export const HEIGHT = 630;

export function getStaticPaths() {
  return LOCALES.map((lang) => ({ params: { lang } }));
}

const publicDir = join(process.cwd(), 'public');
const font = (file) => readFile(join(publicDir, 'fonts', file));

/** Plain-object element, the shape satori takes without JSX. */
const h = (type, style, children) => ({ type, props: { style, children } });

export async function GET({ params }) {
  const { lang } = params;
  const t = useTranslations(lang);
  const [regular, semibold, bold, photo] = await Promise.all([
    font('opensans-regular.woff'),
    font('opensans-semibold.woff'),
    font('opensans-bold.woff'),
    readFile(join(publicDir, 'images', resume.photo)),
  ]);

  // The source photo carries a round frame and a name caption from 84% of its
  // height down, so show only its top 80%, centred.
  const size = 300;
  const zoomed = Math.round(size / 0.8);

  const card = h(
    'div',
    {
      width: WIDTH,
      height: HEIGHT,
      display: 'flex',
      alignItems: 'center',
      gap: 64,
      padding: '0 88px',
      fontFamily: 'Open Sans',
      color: '#e6e9ef',
      backgroundColor: '#11151c',
      backgroundImage:
        'radial-gradient(circle at 85% 0%, rgba(167,139,250,0.35), transparent 55%), radial-gradient(circle at 0% 100%, rgba(94,234,212,0.22), transparent 50%)',
    },
    [
      // A fixed width: as a flex item the text would size to its longest
      // line and push the photo off the canvas.
      h('div', { display: 'flex', flexDirection: 'column', width: 700 }, [
        h(
          'div',
          { fontSize: 26, fontWeight: 600, color: '#7ee8ef' },
          'ernest0vm.github.io',
        ),
        h(
          'div',
          {
            marginTop: 18,
            fontSize: 78,
            fontWeight: 700,
            lineHeight: 1.05,
            color: '#ffffff',
          },
          resume.name,
        ),
        h(
          'div',
          {
            marginTop: 20,
            fontSize: 34,
            fontWeight: 600,
            lineHeight: 1.25,
            color: '#a5f0f4',
          },
          resume.role,
        ),
        h(
          'div',
          { marginTop: 22, fontSize: 28, lineHeight: 1.35, color: '#b4bccb' },
          t('meta.tagline', { years: experienceInWordsCapitalized(lang) }),
        ),
      ]),
      // satori ignores background-size, so the zoom is an <img> placed
      // larger than its round, clipping frame.
      h(
        'div',
        {
          display: 'flex',
          position: 'relative',
          flexShrink: 0,
          width: size,
          height: size,
          overflow: 'hidden',
          borderRadius: size,
          border: '4px solid rgba(255,255,255,0.35)',
        },
        {
          type: 'img',
          props: {
            src: `data:image/jpeg;base64,${photo.toString('base64')}`,
            width: zoomed,
            height: zoomed,
            style: {
              position: 'absolute',
              top: 0,
              left: -Math.round((zoomed - size) / 2),
              width: zoomed,
              height: zoomed,
            },
          },
        },
      ),
    ],
  );

  const svg = await satori(card, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: 'Open Sans', data: regular, weight: 400, style: 'normal' },
      { name: 'Open Sans', data: semibold, weight: 600, style: 'normal' },
      { name: 'Open Sans', data: bold, weight: 700, style: 'normal' },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } })
    .render()
    .asPng();

  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
}
