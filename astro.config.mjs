import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://ernest0vm.github.io',
  // A GitHub user site, served from the domain root. Spanish lives at /
  // (no prefix), English at /en/. The old /resume/ URLs redirect from
  // public/resume/.
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    icon(),
    // Lists both languages with hreflang alternates. The print-only CV routes
    // never exist in a normal build, but keep them out just in case.
    sitemap({
      i18n: { defaultLocale: 'es', locales: { es: 'es-MX', en: 'en-US' } },
      filter: (page) => !page.includes('/cv/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
