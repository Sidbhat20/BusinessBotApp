import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radii, spacing, typography } from '../theme';

type Tone = 'default' | 'accent' | 'warning' | 'success';

export function Pill({ label, tone = 'default', style }: { label: string; tone?: Tone; style?: ViewStyle }) {
  const palette = {
    default: { bg: colors.surfaceElevated, fg: colors.textSecondary, border: colors.border },
    accent: { bg: colors.accentSoft, fg: colors.accentBright, border: colors.accent },
    warning: { bg: 'rgba(251, 191, 36, 0.12)', fg: colors.warning, border: 'rgba(251, 191, 36, 0.4)' },
    success: { bg: 'rgba(74, 222, 128, 0.12)', fg: colors.success, border: 'rgba(74, 222, 128, 0.4)' },
  }[tone];

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: palette.bg, borderColor: palette.border },
        style,
      ]}
    >
      <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: { ...typography.micro, textTransform: 'uppercase' },
});
