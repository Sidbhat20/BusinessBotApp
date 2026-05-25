import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../theme';

type Props = {
  label: string;
  description?: string;
  selected?: boolean;
  onPress?: () => void;
};

export function ToneChip({ label, description, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.base, selected ? styles.selected : styles.unselected]}
    >
      <View style={styles.row}>
        <View style={[styles.dot, selected && styles.dotSelected]} />
        <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      </View>
      {description ? (
        <Text style={[styles.desc, selected && styles.descSelected]}>{description}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  unselected: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
  },
  selected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    marginRight: spacing.xs,
  },
  dotSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  label: { ...typography.h3, color: colors.textPrimary, textTransform: 'capitalize' },
  labelSelected: { color: colors.accentBright },
  desc: { ...typography.caption, color: colors.textSecondary, marginLeft: 22 },
  descSelected: { color: colors.textPrimary },
});
