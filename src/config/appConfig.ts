export const APP_CONFIG = {
  // Safe zero-setup mode requires a hosted backend proxy.
  // Example: https://your-businessbot-api.onrender.com
  proxyBaseUrl: '',
};

export function hasHostedProxy(): boolean {
  return Boolean(APP_CONFIG.proxyBaseUrl.trim());
}

export function getProxyBaseUrl(): string {
  return APP_CONFIG.proxyBaseUrl.replace(/\/+$/, '');
}
