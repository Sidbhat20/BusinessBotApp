const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
const vagueValues = new Set([
  'na', 'n/a', 'none', 'nothing', 'idk', 'dont know', "don't know",
  'not sure', 'test', 'abc',
]);

export type ProfileFieldKey = 'name' | 'email' | 'company' | 'designation' | 'roleDescription';

export const profileFields: { key: ProfileFieldKey; label: string; prompt: string; subtitle: string }[] = [
  { key: 'name', label: 'Full name', prompt: 'What is your full name?', subtitle: 'How you sign off in every email.' },
  { key: 'email', label: 'Work email', prompt: 'What is your work email?', subtitle: 'Used in the signature of every draft.' },
  { key: 'company', label: 'Company', prompt: 'What company do you represent?', subtitle: 'Helps frame why you are reaching out.' },
  { key: 'designation', label: 'Designation', prompt: 'What is your title?', subtitle: 'For example: Founder, Sales Lead.' },
  { key: 'roleDescription', label: 'What you do', prompt: 'In one or two lines, what do you do?', subtitle: 'A short, clear description of your work.' },
];

export function normalizeInput(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function isVagueAnswer(value: string): boolean {
  const lower = normalizeInput(value).toLowerCase();
  return !lower || vagueValues.has(lower);
}

function hasSuspiciousEmailTypos(value: string): boolean {
  return /(commm|coomm|gmial|gmai\.|gnail|hotnail|outlok|yaho\.|\.con$|\.cmo$|\.cm$|\.comm$)/i.test(value);
}

export type ValidationResult = { ok: true; value: string } | { ok: false; message: string };

export function validateProfileAnswer(fieldKey: ProfileFieldKey, value: string): ValidationResult {
  const cleaned = normalizeInput(value);
  const lower = cleaned.toLowerCase();

  if (isVagueAnswer(cleaned)) {
    return { ok: false, message: 'That looks too vague. Please answer clearly.' };
  }

  if (fieldKey === 'name') {
    const words = cleaned.split(' ').filter(Boolean);
    if (words.length < 2) {
      return { ok: false, message: 'Please enter your full name, for example: Siddh Bhat.' };
    }
  }

  if (fieldKey === 'email') {
    if (!emailRegex.test(lower) || hasSuspiciousEmailTypos(lower) || lower.includes('..')) {
      return { ok: false, message: 'That does not look like a valid work email.' };
    }
  }

  if (fieldKey === 'company') {
    if (cleaned.length < 2 || ['my company', 'company', 'self'].includes(lower)) {
      return { ok: false, message: 'Please enter your actual company name.' };
    }
  }

  if (fieldKey === 'designation') {
    if (cleaned.length < 2 || ['designation', 'employee', 'worker', 'staff'].includes(lower)) {
      return { ok: false, message: 'Please enter your exact designation, for example: Founder.' };
    }
  }

  if (fieldKey === 'roleDescription') {
    if (cleaned.length < 12 || cleaned.split(' ').length < 4) {
      return { ok: false, message: 'Please describe what you do in one or two clear lines.' };
    }
  }

  return { ok: true, value: cleaned };
}

export function validateConversation(value: string): ValidationResult {
  const cleaned = normalizeInput(value);
  const lower = cleaned.toLowerCase();

  if (isVagueAnswer(cleaned) || cleaned.length < 12 || cleaned.split(' ').length < 4) {
    return {
      ok: false,
      message: 'That feels too short. Tell me where you met, what you discussed, and your intent.',
    };
  }

  if (['met him', 'met her', 'business', 'talked', 'conversation', 'meeting'].includes(lower)) {
    return {
      ok: false,
      message: 'A bit more specific please, so I can personalize the email properly.',
    };
  }

  return { ok: true, value: cleaned };
}

export function validateContactEmail(email: string): boolean {
  if (!email) return false;
  return /^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/.test(email);
}
