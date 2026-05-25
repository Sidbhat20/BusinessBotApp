import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

export function BrandMark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 56 : size === 'md' ? 40 : 28;
  const text = size === 'lg' ? 28 : size === 'md' ? 20 : 14;
  return (
    <View style={[styles.mark, { width: dim, height: dim, borderRadius: dim / 2 }]}>
      <Text style={[styles.markText, { fontSize: text }]}>B</Text>
    </View>
  );
}

export function BrandRow() {
  return (
    <View style={styles.row}>
      <BrandMark size="sm" />
      <View style={{ marginLeft: spacing.sm }}>
        <Text style={styles.brandName}>Business Bot</Text>
        <Text style={styles.brandTag}>Card to email, in seconds.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    ...typography.h2,
    color: colors.textOnAccent,
    fontWeight: '700',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  brandName: { ...typography.h3, color: colors.textPrimary },
  brandTag: { ...typography.caption, color: colors.textSecondary },
});
