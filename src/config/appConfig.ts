export const APP_CONFIG = {
  supabaseUrl: 'https://pxqxbgsivzhguaghyhax.supabase.co',
  supabaseAnonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cXhiZ3NpdnpoZ3VhZ2h5aGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2OTcwMzIsImV4cCI6MjA5NTI3MzAzMn0.KhbZLXuN2b0ROtKxGz_FlanTqHOQ8PFTKSFQaKLfHe8',
  supabaseFunctionName: 'mobile-responses',
};

export function hasHostedProxy(): boolean {
  return Boolean(APP_CONFIG.supabaseUrl.trim() && APP_CONFIG.supabaseAnonKey.trim() && APP_CONFIG.supabaseFunctionName.trim());
}

export function getHostedResponsesUrl(): string {
  return `${APP_CONFIG.supabaseUrl.replace(/\/+$/, '')}/functions/v1/${APP_CONFIG.supabaseFunctionName}`;
}

export function getHostedHeaders(): Record<string, string> {
  return {
    apikey: APP_CONFIG.supabaseAnonKey,
    Authorization: `Bearer ${APP_CONFIG.supabaseAnonKey}`,
  };
}
