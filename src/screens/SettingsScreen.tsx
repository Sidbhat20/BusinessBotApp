import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useSettings } from '../stores/settingsStore';
import { useProfile } from '../stores/profileStore';
import { useContacts } from '../stores/contactsStore';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const azure = useSettings((s) => s.azure);
  const setAzure = useSettings((s) => s.setAzure);
  const profile = useProfile((s) => s.profile);
  const clearProfile = useProfile((s) => s.clearProfile);
  const resetContacts = useContacts((s) => s.reset);

  const [apiKey, setApiKey] = useState(azure.apiKey);
  const [endpoint, setEndpoint] = useState(azure.endpoint);
  const [model, setModel] = useState(azure.model);
  const [saved, setSaved] = useState(false);

  const onSave = () => {
    setAzure({ apiKey: apiKey.trim(), endpoint: endpoint.trim(), model: model.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const onReset = () => {
    Alert.alert(
      'Reset all data?',
      'This deletes your profile, contacts, drafts, and Azure config from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            clearProfile();
            resetContacts();
            setAzure({ apiKey: '', endpoint: '', model: '' });
            navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <Header title="Settings" onBack={() => navigation.goBack()} />

      <Text style={styles.section}>Azure OpenAI</Text>
      <TextField
        label="API key"
        value={apiKey}
        onChangeText={setApiKey}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextField
        label="Endpoint"
        value={endpoint}
        onChangeText={setEndpoint}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextField
        label="Deployment model"
        value={model}
        onChangeText={setModel}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button label={saved ? 'Saved' : 'Save changes'} onPress={onSave} />

      <Text style={[styles.section, { marginTop: spacing.xxl }]}>Your profile</Text>
      {profile ? (
        <Card>
          <Text style={styles.label}>{profile.name}</Text>
          <Text style={styles.value}>{profile.designation} · {profile.company}</Text>
          <Text style={styles.value}>{profile.email}</Text>
          <Text style={styles.role}>{profile.roleDescription}</Text>
          <Button
            label="Edit profile"
            variant="secondary"
            onPress={() => navigation.navigate('ProfileSetup')}
            style={{ marginTop: spacing.md }}
          />
        </Card>
      ) : (
        <Card>
          <Text style={styles.value}>No profile yet.</Text>
          <Button
            label="Set up profile"
            onPress={() => navigation.navigate('ProfileSetup')}
            style={{ marginTop: spacing.md }}
          />
        </Card>
      )}

      <View style={{ marginTop: spacing.xxl, marginBottom: spacing.xl }}>
        <Button label="Reset all data" variant="destructive" onPress={onReset} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    ...typography.micro,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  label: { ...typography.h3, color: colors.textPrimary },
  value: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  role: { ...typography.body, color: colors.textPrimary, marginTop: spacing.sm },
});
