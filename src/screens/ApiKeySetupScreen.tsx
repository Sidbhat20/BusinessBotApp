import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
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
  const [endpoint, setEndpoint] = useState(azure.endpoint);
  const [model, setModel] = useState(azure.model);
  const [error, setError] = useState<string | null>(null);

  const onContinue = () => {
    if (!apiKey.trim()) {
      setError('Add the Azure OpenAI API key.');
      return;
    }
    if (!endpoint.trim() || !/^https?:\/\//.test(endpoint)) {
      setError('Endpoint must start with https://');
      return;
    }
    if (!model.trim()) {
      setError('Add a deployment model name.');
      return;
    }
    setAzure({ apiKey: apiKey.trim(), endpoint: endpoint.trim(), model: model.trim() });
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
        Business Bot uses your Azure OpenAI deployment for vision extraction and email drafting. Keys stay on this device.
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
        <TextField
          label="Endpoint"
          value={endpoint}
          onChangeText={setEndpoint}
          placeholder="https://your-resource.openai.azure.com/openai/v1"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextField
          label="Deployment model"
          value={model}
          onChangeText={setModel}
          placeholder="gpt-5.4"
          autoCapitalize="none"
          autoCorrect={false}
        />
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
