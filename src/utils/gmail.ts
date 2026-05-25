import { Linking } from 'react-native';

export function buildGmailComposeUrl(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to,
    su: subject,
    body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function buildMailtoUrl(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({ subject, body });
  return `mailto:${to}?${params.toString()}`;
}

export async function openEmailDraft(to: string, subject: string, body: string): Promise<void> {
  const mailto = buildMailtoUrl(to, subject, body);
  try {
    const canOpen = await Linking.canOpenURL(mailto);
    if (canOpen) {
      await Linking.openURL(mailto);
      return;
    }
  } catch {
    // fall through to web
  }
  await Linking.openURL(buildGmailComposeUrl(to, subject, body));
}
