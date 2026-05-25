export function normalizeEmail(email: string): string {
  if (!email) return '';

  let value = String(email)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[;,]+$/g, '')
    .replace(/^mailto:/, '');

  const replacements: [RegExp, string][] = [
    [/\(at\)|\[at\]|\{at\}/g, '@'],
    [/\(dot\)|\[dot\]|\{dot\}/g, '.'],
    [/,+/g, '.'],
    [/\.commm+$/g, '.com'],
    [/\.coomm+$/g, '.com'],
    [/\.con$/g, '.com'],
    [/\.cmo$/g, '.com'],
    [/\.cm$/g, '.com'],
    [/\.ogr$/g, '.org'],
    [/\.co\.in\.in$/g, '.co.in'],
    [/@gmial\./g, '@gmail.'],
    [/@gmai\.com$/g, '@gmail.com'],
    [/@gnail\./g, '@gmail.'],
    [/@hotnail\./g, '@hotmail.'],
    [/@outlok\./g, '@outlook.'],
    [/@yaho\./g, '@yahoo.'],
    [/@icloud\.con$/g, '@icloud.com'],
  ];

  for (const [pattern, replacement] of replacements) {
    value = value.replace(pattern, replacement);
  }

  value = value.replace(/\.{2,}/g, '.');
  value = value.replace(/@{2,}/g, '@');
  return value;
}

export function normalizePhone(phone: string): string {
  if (!phone) return '';
  const raw = String(phone).trim().replace(/[^\d+]/g, '');
  if (!raw) return '';
  if (raw.startsWith('+')) return `+${raw.slice(1).replace(/\+/g, '')}`;
  return raw;
}
