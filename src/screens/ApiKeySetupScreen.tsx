import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { DEFAULT_AZURE_ENDPOINT, DEFAULT_AZURE_MODEL, useSettings } from '../stores/settingsStore';
import { useProfile } from '../stores/profileStore';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ApiKeySetup'>;

export function ApiKeySetupScreen({ navigation }: Props) {
  const azure = useSettings((s) => s.azure);
  const setAzure = useSettings((s) => s.setAzure);
  const hasProfile = useProfile((s) => Boolean(s.profile));

  const [apiKey, setApiKey] = useState(azure.apiKey);
  const [error, setError] = useState<string | null>(null);

  const onContinue = () => {
    if (!apiKey.trim()) {
      setError('Add the Azure OpenAI API key.');
      return;
    }
    setAzure({ apiKey: apiKey.trim() });
    setError(null);
    navigation.replace(hasProfile ? 'Home' : 'ProfileSetup');
  };

  return (
    <Screen>
      <Header
        eyebrow="Step 1 of 2"
        title="Connect Azure OpenAI"
        onBack={() => navigation.goBack()}
      />
      <Text style={styles.intro}>
        This build already has the Azure endpoint and deployment name preconfigured. You only need to enter your Azure OpenAI API key on this device.
      </Text>

      <View style={{ marginTop: spacing.lg }}>
        <TextField
          label="API key"
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="Paste your Azure OpenAI key"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.metaLabel}>Configured endpoint</Text>
        <Text style={styles.metaValue}>{azure.endpoint || DEFAULT_AZURE_ENDPOINT}</Text>
        <Text style={[styles.metaLabel, { marginTop: spacing.md }]}>Configured deployment model</Text>
        <Text style={styles.metaValue}>{azure.model || DEFAULT_AZURE_MODEL}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.cta}>
        <Button label="Continue" onPress={onContinue} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { ...typography.body, color: colors.textSecondary },
  error: { ...typography.caption, color: colors.error, marginTop: spacing.xs },
  metaLabel: {
    ...typography.micro,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },
  metaValue: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: 4,
  },
  cta: { marginTop: spacing.xl },
});
