import { Platform, TextStyle } from 'react-native';

const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });
const sans = Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' });
const sansMedium = Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' });

export const typography = {
  display: {
    fontFamily: serif,
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -0.5,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  h1: {
    fontFamily: serif,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.3,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  h2: {
    fontFamily: serif,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.2,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  h3: {
    fontFamily: sansMedium,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  lead: {
    fontFamily: sans,
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  body: {
    fontFamily: sans,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  bodyMedium: {
    fontFamily: sansMedium,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  caption: {
    fontFamily: sans,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  micro: {
    fontFamily: sansMedium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.4,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  button: {
    fontFamily: sansMedium,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.2,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
};

export type TypographyToken = keyof typeof typography;
