import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://ernest0vm.github.io',
  base: '/resume',
  // Spanish stays at /resume/ (no prefix) so the existing URL keeps working;
  // English lives at /resume/en/.
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
