/**
 * /llms.txt — a plain Markdown version of the CV for AI assistants and
 * answer engines (llmstxt.org). Generated from resume.json and the English
 * translations at build time, so it always matches the site.
 *
 * Phone and email stay out, as everywhere else in the published site.
 */
import resume from '../data/resume.json';
import {
  formatMonth,
  formatPeriod,
  useList,
  useTranslations,
} from '../i18n/index.js';
import { experienceInWords } from '../utils/experience.js';
import { SITE, metaDescription } from '../utils/seo.js';

const LANG = 'en';

export function GET() {
  const t = useTranslations(LANG);
  const c = useTranslations(LANG, 'content');
  const label = useTranslations(LANG, 'cv');
  const list = useList(LANG);
  const pdf = (lang) => `${resume.cv.release}${resume.cv.files[lang]}`;
  const profiles = resume.social.filter((n) => n.id !== 'whatsapp');

  const lines = [
    `# ${resume.name}`,
    '',
    `> ${metaDescription(LANG)}`,
    '',
    `Role: ${resume.role}. Based in ${resume.contact.city}, ${c('state')}, Mexico. Works in Spanish and English.`,
    '',
    c('bio', { years: experienceInWords(LANG) }),
    '',
    '## Links',
    '',
    `- [Website (English)](${SITE}/en/)`,
    `- [Sitio web (español)](${SITE}/)`,
    `- [Resume PDF (English)](${pdf('en')})`,
    `- [CV en PDF (español)](${pdf('es')})`,
    ...profiles.map((n) => `- [${n.label}](${n.url})`),
    '',
    `## ${label('highlights')}`,
    '',
    ...resume.scale.map(
      (item) =>
        `- ${c(`scale.${item.id}.value`)} ${c(`scale.${item.id}.label`)}`,
    ),
    '',
    ...resume.highlights.map(
      (item) =>
        `- **${c(`highlights.${item.id}.title`)}**: ${c(`highlights.${item.id}.description`)}`,
    ),
    '',
    `## ${label('work')}`,
    '',
    ...resume.work.flatMap((job) => [
      `### ${job.title}, ${job.company} (${formatPeriod(job.start, job.end, LANG, t('date.present'))})`,
      '',
      c(`work.${job.id}.summary`),
      ...list(`work.${job.id}.highlights`).map((bullet) => `- ${bullet}`),
      '',
    ]),
    `## ${label('skills')}`,
    '',
    `- ${label('languages')}: ${resume.skills.map((s) => s.name).join(', ')}`,
    `- ${label('tools')}: ${resume.tools.map((s) => s.name).join(', ')}`,
    `- ${label('spoken')}: ${resume.languages
      .map(
        (item) =>
          `${c(`languages.${item.id}.name`)} ${item.cefr} (${c(`languages.${item.id}.level`)})`,
      )
      .join(', ')}`,
    '',
    `## ${label('education')}`,
    '',
    ...resume.education.map(
      (item) =>
        `- ${c(`education.${item.id}.degree`)}, ${item.school} (${formatMonth(item.graduated, LANG)})${item.license ? `. ${label('license')}: ${item.license}` : ''}`,
    ),
    '',
    `## ${label('portfolio')}`,
    '',
    ...resume.portfolio.map((project) => {
      const caption = [
        c(`portfolio.${project.id}`),
        project.stack,
        project.retired && label('retired'),
      ]
        .filter(Boolean)
        .join(' · ');
      return project.url
        ? `- [${project.title}](${project.url}): ${caption}`
        : `- ${project.title}: ${caption}`;
    }),
    '',
    '## Contact',
    '',
    `Through [LinkedIn](${profiles.find((n) => n.id === 'linkedin')?.url}) or the contact section of the website.`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
