import { Linking } from 'react-native';

function encodeMailValue(value: string): string {
  return encodeURIComponent(value);
}

function buildQuery(params: Record<string, string>): string {
  return Object.entries(params)
    .filter(([, value]) => value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeMailValue(value)}`)
    .join('&');
}

export function buildMailtoUrl(to: string, subject: string, body: string): string {
  const query = buildQuery({ subject, body });
  return `mailto:${encodeMailValue(to)}?${query}`;
}

export function buildZohoWorkspaceUrl(to: string, subject: string, body: string): string {
  const composeUrl = `https://mail.zoho.com/zm/#mail/compose?${buildQuery({ to, subject, body })}`;
  return composeUrl;
}

export async function openMailAppDraft(to: string, subject: string, body: string): Promise<void> {
  const mailto = buildMailtoUrl(to, subject, body);
  const canOpen = await Linking.canOpenURL(mailto);
  if (!canOpen) {
    throw new Error('No mail app available.');
  }
  await Linking.openURL(mailto);
}

export async function openZohoWorkspace(to: string, subject: string, body: string): Promise<void> {
  const composeUrl = buildZohoWorkspaceUrl(to, subject, body);
  try {
    await Linking.openURL(composeUrl);
  } catch {
    await Linking.openURL('https://www.zoho.com/workplace/');
  }
}

export async function openEmailDraft(to: string, subject: string, body: string): Promise<void> {
  await openMailAppDraft(to, subject, body);
}
