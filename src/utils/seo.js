/**
 * Search and AI-assistant metadata, built from the same data as the page so
 * it can never drift from what visitors read.
 *
 * Phone and email are deliberately absent: they must not appear in plain text
 * anywhere in the published HTML (see "Datos de contacto" in CLAUDE.md), and
 * JSON-LD is plain text to a harvester.
 */
import resume from '../data/resume.json';
import { useTranslations } from '../i18n/index.js';
import { experienceInWords } from './experience.js';

export const SITE = 'https://ernest0vm.github.io';

/** Open Graph locale codes for each page locale. */
export const OG_LOCALES = { es: 'es_MX', en: 'en_US' };

/** Topics an assistant should associate with the person, beyond tool names. */
const EXPERTISE = [
  'Mobile architecture',
  'React Native',
  'Expo',
  'Monorepos (Turborepo)',
  'Multi-tenant mobile platforms',
  'Hybrid apps (WebView checkout)',
  'Mobile CI/CD and release engineering',
  'OTA updates and staged rollouts',
  'Technical leadership',
  'Engineering mentoring',
  'AI-assisted software development',
  'E-commerce payments (3-D Secure)',
  'Full-stack development',
  'IoT and embedded firmware',
];

export function metaDescription(locale) {
  const t = useTranslations(locale);
  return t('meta.description', { years: experienceInWords(locale) });
}

/** schema.org ProfilePage + Person for one locale. */
export function profileJsonLd(locale, pageUrl) {
  const c = useTranslations(locale, 'content');
  const current = resume.work.find((job) => !job.end) ?? resume.work[0];
  const profiles = resume.social
    .filter((network) => network.id !== 'whatsapp')
    .map((network) => network.url);

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: pageUrl,
    inLanguage: locale,
    dateModified: new Date().toISOString().slice(0, 10),
    mainEntity: {
      '@type': 'Person',
      '@id': `${SITE}/#person`,
      name: resume.name,
      jobTitle: resume.role,
      description: metaDescription(locale),
      url: pageUrl,
      image: `${SITE}/images/${resume.photo}`,
      sameAs: profiles,
      worksFor: {
        '@type': 'Organization',
        name: current.company,
        ...(current.company === 'Reserhub' && { url: 'https://reserhub.com' }),
      },
      alumniOf: resume.education.map((item) => ({
        '@type': 'EducationalOrganization',
        name: item.school,
      })),
      address: {
        '@type': 'PostalAddress',
        addressLocality: resume.contact.city,
        addressRegion: c('state'),
        addressCountry: 'MX',
      },
      knowsLanguage: ['es', 'en'],
      knowsAbout: [
        ...EXPERTISE,
        ...resume.skills.map((item) => item.name),
        ...resume.tools.map((item) => item.name),
      ],
    },
  };
}
