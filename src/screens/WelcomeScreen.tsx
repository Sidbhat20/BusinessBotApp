import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { BrandMark } from '../components/Brand';
import { Pill } from '../components/Pill';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <Screen scroll={false} padded={false}>
      <LinearGradient
        colors={[colors.bg, colors.bgElevated, colors.bg]}
        style={styles.gradient}
      >
        <View style={styles.top}>
          <BrandMark size="lg" />
          <Pill label="AI · Business" tone="accent" style={{ marginTop: spacing.lg }} />
          <Text style={styles.title}>Business Bot</Text>
          <Text style={styles.tagline}>
            Snap any business card. Get a polished, ready-to-send follow-up email in seconds.
          </Text>
        </View>

        <View style={styles.featureList}>
          <Feature label="Vision-powered card extraction" />
          <Feature label="Three tones: professional, casual, persuasive" />
          <Feature label="One tap to draft in Gmail" />
        </View>

        <View style={styles.cta}>
          <Button label="Get started" onPress={() => navigation.replace('ApiKeySetup')} />
          <Text style={styles.footer}>Your data stays on your device.</Text>
        </View>
      </LinearGradient>
    </Screen>
  );
}

function Feature({ label }: { label: string }) {
  return (
    <View style={styles.feature}>
      <View style={styles.dot} />
      <Text style={styles.featureText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1, paddingHorizontal: 28, paddingVertical: 32, justifyContent: 'space-between' },
  top: { marginTop: spacing.xxl },
  title: { ...typography.display, color: colors.textPrimary, marginTop: spacing.md },
  tagline: { ...typography.lead, color: colors.textSecondary, marginTop: spacing.sm, maxWidth: 320 },
  featureList: { marginVertical: spacing.xxl, gap: spacing.sm },
  feature: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, marginRight: spacing.sm },
  featureText: { ...typography.body, color: colors.textPrimary },
  cta: { paddingBottom: spacing.lg },
  footer: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
});
