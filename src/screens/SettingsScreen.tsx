import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
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
            setAzure({ apiKey: '' });
            navigation.reset({ index: 0, routes: [{ name: 'ProfileSetup' }] });
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <Header title="Settings" onBack={() => navigation.goBack()} />

      <Text style={styles.section}>Your profile</Text>
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
