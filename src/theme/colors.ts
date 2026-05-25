export const colors = {
  bg: '#0B0B0D',
  bgElevated: '#101014',
  surface: '#15151A',
  surfaceElevated: '#1E1E24',
  surfaceHover: '#23232B',

  border: '#2A2A33',
  borderSubtle: '#1F1F26',
  borderStrong: '#3A3A45',

  textPrimary: '#F4F1EA',
  textSecondary: '#A8A8B0',
  textMuted: '#6B6B75',
  textOnAccent: '#0B0B0D',

  accent: '#C9A961',
  accentBright: '#E0BE73',
  accentMuted: '#806743',
  accentSoft: '#3A2F1E',

  success: '#4ADE80',
  error: '#F87171',
  warning: '#FBBF24',
  info: '#60A5FA',

  overlay: 'rgba(0, 0, 0, 0.72)',
  shimmer: 'rgba(244, 241, 234, 0.06)',
};

export type ColorToken = keyof typeof colors;
