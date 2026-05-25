import { Linking } from 'react-native';

function encodeMailValue(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, '%20');
}

function buildQuery(params: Record<string, string>): string {
  return Object.entries(params)
    .filter(([, value]) => value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeMailValue(value)}`)
    .join('&');
}

export function buildGmailComposeUrl(to: string, subject: string, body: string): string {
  const query = buildQuery({
    view: 'cm',
    fs: '1',
    to,
    su: subject,
    body,
  });
  return `https://mail.google.com/mail/?${query}`;
}

export function buildMailtoUrl(to: string, subject: string, body: string): string {
  const query = buildQuery({ subject, body });
  return `mailto:${encodeMailValue(to)}?${query}`;
}

export async function openMailAppDraft(to: string, subject: string, body: string): Promise<void> {
  const mailto = buildMailtoUrl(to, subject, body);
  try {
    const canOpen = await Linking.canOpenURL(mailto);
    if (!canOpen) {
      throw new Error('No mail app available.');
    }
    await Linking.openURL(mailto);
  } catch (error) {
    throw error;
  }
}

export async function openGmailWebDraft(to: string, subject: string, body: string): Promise<void> {
  await Linking.openURL(buildGmailComposeUrl(to, subject, body));
}

export async function openEmailDraft(to: string, subject: string, body: string): Promise<void> {
  try {
    await openMailAppDraft(to, subject, body);
  } catch {
    await openGmailWebDraft(to, subject, body);
  }
}
