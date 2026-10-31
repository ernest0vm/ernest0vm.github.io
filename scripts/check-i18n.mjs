/**
 * Keeps the two locales in step. Runs as part of `yarn lint`, so CI fails on:
 * - a key present in one locale and missing in the other (ui, content, cv);
 * - a translation whose {placeholders} differ from its counterpart's;
 * - an entry in resume.json with no text in content.json, or text whose entry
 *   is gone (a job's optional `highlights` bullets are allowed);
 * - a bio without its {years} placeholder;
 * - "marca blanca" / "white label" anywhere (see CLAUDE.md, "Contenido").
 */
import console from 'node:console';
import { readFile } from 'node:fs/promises';
import process from 'node:process';
import { URL } from 'node:url';

const LOCALES = ['es', 'en'];
const NAMESPACES = ['ui', 'content', 'cv'];

const load = async (path) =>
  JSON.parse(await readFile(new URL(`../src/${path}`, import.meta.url)));

/** { a: { b: 'x' } } -> Map { 'a.b' => 'x' } */
const flatten = (node, prefix = '', out = new Map()) => {
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object') flatten(value, path, out);
    else out.set(path, value);
  }
  return out;
};

const placeholders = (text) =>
  [...String(text).matchAll(/\{(\w+)\}/g)]
    .map((m) => m[1])
    .sort()
    .join(',');

const errors = [];
const resume = await load('data/resume.json');
const messages = {};
for (const locale of LOCALES) {
  messages[locale] = {};
  for (const ns of NAMESPACES) {
    messages[locale][ns] = flatten(await load(`i18n/${locale}/${ns}.json`));
  }
}

// Same keys and the same placeholders in every locale.
for (const ns of NAMESPACES) {
  const [base, ...others] = LOCALES;
  for (const other of others) {
    const a = messages[base][ns];
    const b = messages[other][ns];
    for (const key of a.keys()) {
      if (!b.has(key)) errors.push(`${other}/${ns}.json is missing "${key}"`);
      else if (placeholders(a.get(key)) !== placeholders(b.get(key))) {
        errors.push(
          `${ns}.json "${key}": placeholders differ between ${base} and ${other}`,
        );
      }
    }
    for (const key of b.keys()) {
      if (!a.has(key)) errors.push(`${base}/${ns}.json is missing "${key}"`);
    }
  }
}

// Every entry in resume.json has its text, and no text is left orphaned.
const expected = new Set([
  'bio',
  'quote',
  'state',
  'skillsLead',
  'toolsLead',
  ...resume.work.map((job) => `work.${job.id}.summary`),
  ...resume.scale.flatMap((item) => [
    `scale.${item.id}.value`,
    `scale.${item.id}.label`,
  ]),
  ...resume.highlights.flatMap((item) => [
    `highlights.${item.id}.title`,
    `highlights.${item.id}.description`,
  ]),
  ...resume.education.flatMap((item) => [
    `education.${item.id}.degree`,
    `education.${item.id}.description`,
  ]),
  ...resume.portfolio.map((project) => `portfolio.${project.id}`),
  ...resume.languages.flatMap((item) => [
    `languages.${item.id}.name`,
    `languages.${item.id}.level`,
  ]),
]);
for (const locale of LOCALES) {
  const content = messages[locale].content;
  for (const key of expected) {
    if (!content.has(key))
      errors.push(`${locale}/content.json has no text for "${key}"`);
  }
  for (const key of content.keys()) {
    // A job's bullet list is optional; its items flatten to work.<id>.highlights.N.
    const bullet = /^work\.([\w-]+)\.highlights\.\d+$/.exec(key);
    if (bullet && resume.work.some((job) => job.id === bullet[1])) continue;
    if (!expected.has(key))
      errors.push(
        `${locale}/content.json "${key}" matches no entry in resume.json`,
      );
  }
  if (!String(content.get('bio')).includes('{years}')) {
    errors.push(`${locale}/content.json "bio" lost its {years} placeholder`);
  }
}

// Wording the repo owner ruled out, in any file and either language.
const banned = /marca\s+blanca|white[\s-]*label/i;
const sources = [['data/resume.json', flatten(resume)]];
for (const locale of LOCALES) {
  for (const ns of NAMESPACES)
    sources.push([`i18n/${locale}/${ns}.json`, messages[locale][ns]]);
}
for (const [file, entries] of sources) {
  for (const [key, value] of entries) {
    if (banned.test(String(value)))
      errors.push(`${file} "${key}" uses banned wording`);
  }
}

if (errors.length) {
  console.error(`i18n check failed:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log('i18n check passed');
