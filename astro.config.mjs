import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://ernest0vm.github.io',
  // A GitHub user site, served from the domain root. Spanish lives at /
  // (no prefix), English at /en/.
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [icon()],
  vite: {
    plugins: [tailwindcss()],
  },
});
