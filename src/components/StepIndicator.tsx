import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii } from '../theme';

type Props = { total: number; current: number };

export function StepIndicator({ total, current }: Props) {
  return (
    <View style={styles.wrap}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i <= current ? styles.dotActive : styles.dotInactive,
            i === current && styles.dotCurrent,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 },
  dot: { height: 4, borderRadius: radii.pill, flex: 1 },
  dotInactive: { backgroundColor: colors.surfaceElevated },
  dotActive: { backgroundColor: colors.accent },
  dotCurrent: { backgroundColor: colors.accentBright },
});
