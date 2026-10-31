/**
 * Translations for the two locales.
 *
 * Language-neutral facts live in src/data/resume.json; every visible string
 * lives here, one folder per locale:
 *   ui.json       site template (nav, headings, buttons, aria-labels)
 *   content.json  the CV text, keyed by the ids in resume.json
 *   cv.json       labels of the PDF layout
 * scripts/check-i18n.mjs (part of `yarn lint`) keeps both locales in step.
 */
import esUi from './es/ui.json';
import esContent from './es/content.json';
import esCv from './es/cv.json';
import enUi from './en/ui.json';
import enContent from './en/content.json';
import enCv from './en/cv.json';

export const LOCALES = ['es', 'en'];
export const DEFAULT_LOCALE = 'es';

const messages = {
  es: { ui: esUi, content: esContent, cv: esCv },
  en: { ui: enUi, content: enContent, cv: enCv },
};

const lookup = (tree, key) =>
  key.split('.').reduce((node, part) => node?.[part], tree);

/**
 * Returns `t(key, vars)` for one namespace ('ui', 'content' or 'cv') of a
 * locale. Keys are dotted paths ('nav.home', 'work.reserhub'); `{name}`
 * placeholders are filled from `vars`. Falls back to Spanish, then to the key.
 */
export function useTranslations(locale = DEFAULT_LOCALE, namespace = 'ui') {
  return (key, vars = {}) => {
    const template =
      lookup(messages[locale]?.[namespace], key) ??
      lookup(messages[DEFAULT_LOCALE][namespace], key) ??
      key;
    return template.replace(
      /\{(\w+)\}/g,
      (_, name) => vars[name] ?? `{${name}}`,
    );
  };
}

/**
 * Returns `list(key)` for one namespace: the array stored at that key (e.g. a
 * job's highlights), falling back to Spanish, or an empty array.
 */
export function useList(locale = DEFAULT_LOCALE, namespace = 'content') {
  return (key) => {
    const value =
      lookup(messages[locale]?.[namespace], key) ??
      lookup(messages[DEFAULT_LOCALE][namespace], key);
    return Array.isArray(value) ? value : [];
  };
}

/** "2025-04" -> "Abril 2025" / "April 2025". */
export function formatMonth(isoMonth, locale = DEFAULT_LOCALE) {
  const [year, month] = isoMonth.split('-').map(Number);
  const name = new Intl.DateTimeFormat(locale, {
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
  return `${name[0].toLocaleUpperCase(locale)}${name.slice(1)} ${year}`;
}

/** A job's span; an open end reads as the locale's "present". */
export function formatPeriod(start, end, locale, present) {
  return `${formatMonth(start, locale)} - ${end ? formatMonth(end, locale) : present}`;
}

/** The other locale, for the language switcher. */
export const otherLocale = (locale) => (locale === 'en' ? 'es' : 'en');
