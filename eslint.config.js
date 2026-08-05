import js from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
import betterTailwind from 'eslint-plugin-better-tailwindcss';

export default [
  {
    ignores: ['dist/', 'node_modules/', 'public/', '.astro/'],
  },
  js.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    files: ['**/*.astro', '**/*.js', '**/*.mjs'],
    plugins: { 'better-tailwindcss': betterTailwind },
    // Only the correctness rules: conflicting, unknown, duplicate or
    // deprecated utilities. Class *ordering* and wrapping are left to
    // prettier-plugin-tailwindcss so the two never fight over the same lines.
    rules: betterTailwind.configs['correctness-error'].rules,
    settings: {
      'better-tailwindcss': {
        // Tailwind v4 has no config file; the theme lives in the CSS entry.
        entryPoint: 'src/styles/global.css',
      },
    },
  },
];
