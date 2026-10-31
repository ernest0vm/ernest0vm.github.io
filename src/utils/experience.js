/**
 * Years of professional experience, counted from the first job rather than
 * hard-coded in the copy, so the CV never quietly goes stale.
 */

// Grupo Avatecsys, September 2009 — see resume.work in the resume data.
export const EXPERIENCE_START = new Date(Date.UTC(2009, 8, 1));

/** Full years elapsed since EXPERIENCE_START (the anniversary must have passed). */
export function yearsOfExperience(reference = new Date()) {
  let years = reference.getUTCFullYear() - EXPERIENCE_START.getUTCFullYear();

  const anniversaryPassed =
    reference.getUTCMonth() > EXPERIENCE_START.getUTCMonth() ||
    (reference.getUTCMonth() === EXPERIENCE_START.getUTCMonth() &&
      reference.getUTCDate() >= EXPERIENCE_START.getUTCDate());

  if (!anniversaryPassed) years -= 1;
  return Math.max(years, 0);
}

const UNITS = [
  'cero',
  'uno',
  'dos',
  'tres',
  'cuatro',
  'cinco',
  'seis',
  'siete',
  'ocho',
  'nueve',
  'diez',
  'once',
  'doce',
  'trece',
  'catorce',
  'quince',
  'dieciséis',
  'diecisiete',
  'dieciocho',
  'diecinueve',
  'veinte',
  'veintiuno',
  'veintidós',
  'veintitrés',
  'veinticuatro',
  'veinticinco',
  'veintiséis',
  'veintisiete',
  'veintiocho',
  'veintinueve',
];

const TENS = [
  '',
  '',
  '',
  'treinta',
  'cuarenta',
  'cincuenta',
  'sesenta',
  'setenta',
  'ochenta',
  'noventa',
];

/**
 * Spells a number 0-99 in Spanish.
 *
 * `apocope` returns the form used before a masculine noun — "veintiún años",
 * not "veintiuno años".
 */
export function spellNumber(value, { apocope = false } = {}) {
  const n = Math.trunc(value);
  if (n < 0 || n > 99) return String(n);

  if (n < 30) {
    if (apocope && n === 1) return 'un';
    if (apocope && n === 21) return 'veintiún';
    return UNITS[n];
  }

  const tens = TENS[Math.floor(n / 10)];
  const unit = n % 10;
  if (unit === 0) return tens;
  if (apocope && unit === 1) return `${tens} y un`;
  return `${tens} y ${UNITS[unit]}`;
}

const EN_UNITS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
];

const EN_TENS = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
];

/** Spells a number 0-99 in English, hyphenating compounds ("twenty-one"). */
export function spellNumberEn(value) {
  const n = Math.trunc(value);
  if (n < 0 || n > 99) return String(n);
  if (n < 20) return EN_UNITS[n];
  const unit = n % 10;
  const tens = EN_TENS[Math.floor(n / 10)];
  return unit === 0 ? tens : `${tens}-${EN_UNITS[unit]}`;
}

/**
 * Years of experience spelled out for the given locale, ready to drop in front
 * of "años" / "years" — e.g. "diecisiete" or "seventeen".
 */
export function experienceInWords(locale = 'es', reference = new Date()) {
  const years = yearsOfExperience(reference);
  return locale === 'en'
    ? spellNumberEn(years)
    : spellNumber(years, { apocope: true });
}

/** Same, capitalised for the start of a sentence. */
export function experienceInWordsCapitalized(
  locale = 'es',
  reference = new Date(),
) {
  const words = experienceInWords(locale, reference);
  return words.charAt(0).toUpperCase() + words.slice(1);
}
