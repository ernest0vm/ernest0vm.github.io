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

/** e.g. "dieciséis" — ready to drop in front of "años". */
export function experienceInWords(reference = new Date()) {
  return spellNumber(yearsOfExperience(reference), { apocope: true });
}

/** Same, capitalised for the start of a sentence. */
export function experienceInWordsCapitalized(reference = new Date()) {
  const words = experienceInWords(reference);
  return words.charAt(0).toUpperCase() + words.slice(1);
}
