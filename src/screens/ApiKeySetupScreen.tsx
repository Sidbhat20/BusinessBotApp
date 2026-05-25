import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { hasHostedProxy } from '../config/appConfig';
import { useSettings } from '../stores/settingsStore';
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
  const zeroSetup = hasHostedProxy();

  const onContinue = () => {
    if (!zeroSetup && !apiKey.trim()) {
      setError('Add the Azure OpenAI API key.');
      return;
    }
    setAzure({ apiKey: zeroSetup ? '' : apiKey.trim() });
    setError(null);
    navigation.replace(hasProfile ? 'Home' : 'ProfileSetup');
  };

  return (
    <Screen>
      <Header
        eyebrow="Setup"
        title={zeroSetup ? 'Backend connected' : 'Connect your AI backend'}
        onBack={() => navigation.goBack()}
      />
      <Text style={styles.intro}>
        {zeroSetup
          ? 'This build is connected to a hosted Business Bot backend, so there is no API setup required on the device.'
          : 'This build already has the Azure endpoint and deployment name preconfigured. You only need to enter your Azure OpenAI API key on this device.'}
      </Text>

      <View style={{ marginTop: spacing.lg }}>
        {!zeroSetup ? (
          <TextField
            label="API key"
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="Paste your Azure OpenAI key"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        ) : null}
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
  cta: { marginTop: spacing.xl },
});
