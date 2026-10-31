/**
 * Interface strings and helpers for the two locales.
 *
 * Content lives in src/data/resumeData.json; this file only holds the copy that
 * belongs to the template itself (nav, section headings, button labels).
 */

export const LOCALES = ['es', 'en'];
export const DEFAULT_LOCALE = 'es';

const ui = {
  es: {
    'meta.lang': 'es',
    skip: 'Saltar al contenido',
    'nav.label': 'Principal',
    'nav.home': 'Inicio',
    'nav.about': 'Acerca de',
    'nav.work': 'Empleos',
    'nav.education': 'Educación',
    'nav.skills': 'Habilidades',
    'nav.portfolio': 'Portafolio',
    'lang.switch': 'View in English',
    'hero.next': 'Ir a la siguiente sección',
    'about.eyebrow': 'Acerca de mí',
    'about.title': 'Perfil',
    'about.photo': 'Foto de {name}',
    'about.showPhone': 'Ver teléfono',
    'about.showWhatsapp': 'Ver WhatsApp',
    'about.showEmail': 'Ver correo',
    'about.download': 'Descargar currículum',
    'work.eyebrow': 'Trayectoria',
    'work.title': 'Empleos',
    'education.eyebrow': 'Formación',
    'education.title': 'Educación',
    'education.license': 'Cédula profesional {number}',
    'skills.eyebrow': 'Habilidades',
    'skills.title': 'Con qué construyo',
    'skills.lead':
      '{years} años de experiencia repartidos entre móvil, backend, nube y electrónica.',
    'skills.languages': 'Lenguajes y frameworks',
    'skills.tools': 'Herramientas',
    'portfolio.eyebrow': 'Portafolio',
    'portfolio.title': 'Apps que he construido',
    'portfolio.lead':
      'Aplicaciones publicadas en Google Play y App Store, construidas con Expo, Flutter, React Native y Xamarin.',
    'footer.top': 'Volver arriba',
  },
  en: {
    'meta.lang': 'en',
    skip: 'Skip to content',
    'nav.label': 'Main',
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.work': 'Experience',
    'nav.education': 'Education',
    'nav.skills': 'Skills',
    'nav.portfolio': 'Portfolio',
    'lang.switch': 'Ver en español',
    'hero.next': 'Go to next section',
    'about.eyebrow': 'About me',
    'about.title': 'Profile',
    'about.photo': 'Photo of {name}',
    'about.showPhone': 'Show phone',
    'about.showWhatsapp': 'Show WhatsApp',
    'about.showEmail': 'Show email',
    'about.download': 'Download resume',
    'work.eyebrow': 'Career',
    'work.title': 'Experience',
    'education.eyebrow': 'Background',
    'education.title': 'Education',
    'education.license': 'Professional license {number}',
    'skills.eyebrow': 'Skills',
    'skills.title': 'What I build with',
    'skills.lead':
      '{years} years of experience across mobile, backend, cloud and electronics.',
    'skills.languages': 'Languages & frameworks',
    'skills.tools': 'Tools',
    'portfolio.eyebrow': 'Portfolio',
    'portfolio.title': "Apps I've built",
    'portfolio.lead':
      'Apps published on Google Play and the App Store, built with Expo, Flutter, React Native and Xamarin.',
    'footer.top': 'Back to top',
  },
};

/** Returns a `t(key, vars)` bound to a locale, falling back to Spanish. */
export function useTranslations(locale = DEFAULT_LOCALE) {
  return (key, vars = {}) => {
    const template = ui[locale]?.[key] ?? ui[DEFAULT_LOCALE][key] ?? key;
    return template.replace(
      /\{(\w+)\}/g,
      (_, name) => vars[name] ?? `{${name}}`,
    );
  };
}

/**
 * Resolves a content field from resumeData.json. Translatable fields are
 * `{ es, en }` objects; everything else (company and app names, URLs, logos)
 * stays a plain value and is returned untouched.
 */
export function localized(value, locale = DEFAULT_LOCALE) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[locale] ?? value[DEFAULT_LOCALE];
  }
  return value;
}

/** The other locale, for the language switcher. */
export const otherLocale = (locale) => (locale === 'en' ? 'es' : 'en');
