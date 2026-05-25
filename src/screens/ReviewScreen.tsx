import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { useContacts } from '../stores/contactsStore';
import { useSettings } from '../stores/settingsStore';
import { extractBusinessCardFromImage } from '../api/azureOpenAI';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { ContactDetails } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Review'>;

export function ReviewScreen({ route, navigation }: Props) {
  const { contactId } = route.params;
  const contact = useContacts((s) => s.contacts.find((c) => c.id === contactId));
  const upsertContact = useContacts((s) => s.upsertContact);
  const azure = useSettings((s) => s.azure);

  const [editing, setEditing] = useState<ContactDetails>(
    contact?.details || { name: '', email: '', phone: '', company: '', designation: '' },
  );
  const [rechecking, setRechecking] = useState(false);

  const warnings = contact?.extractionWarnings || [];

  const save = (details: ContactDetails) => {
    if (!contact) return;
    upsertContact({ ...contact, details, updatedAt: new Date().toISOString() });
  };

  const onConfirm = () => {
    if (!contact) return;
    save(editing);
    navigation.navigate('Conversation', { contactId: contact.id });
  };

  const onRecheck = async () => {
    if (!contact?.imageDataUrl) {
      Alert.alert('No image', 'Original image is missing. Please scan again.');
      return;
    }
    setRechecking(true);
    try {
      const result = await extractBusinessCardFromImage(azure, contact.imageDataUrl);
      const updated = {
        ...contact,
        details: result.details,
        extractionWarnings: result.warnings,
        updatedAt: new Date().toISOString(),
      };
      upsertContact(updated);
      setEditing(result.details);
    } catch (err: any) {
      Alert.alert('Recheck failed', err?.message || 'Please try again.');
    } finally {
      setRechecking(false);
    }
  };

  if (!contact) {
    return (
      <Screen>
        <Header title="Contact not found" onBack={() => navigation.goBack()} />
      </Screen>
    );
  }

  return (
    <>
      <Screen>
        <Header
          eyebrow="Review"
          title="Confirm the details"
          onBack={() => navigation.goBack()}
        />

        {warnings.length > 0 ? (
          <Card style={styles.warningCard}>
            <Pill label="Heads up" tone="warning" />
            <View style={{ marginTop: spacing.xs }}>
              {warnings.map((w, i) => (
                <Text key={i} style={styles.warningText}>• {w}</Text>
              ))}
            </View>
          </Card>
        ) : null}

        <View style={{ marginTop: spacing.lg }}>
          <TextField
            label="Name"
            value={editing.name}
            onChangeText={(v) => setEditing({ ...editing, name: v })}
            placeholder="—"
          />
          <TextField
            label="Email"
            value={editing.email}
            onChangeText={(v) => setEditing({ ...editing, email: v })}
            placeholder="—"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextField
            label="Phone"
            value={editing.phone}
            onChangeText={(v) => setEditing({ ...editing, phone: v })}
            placeholder="—"
            keyboardType="phone-pad"
          />
          <TextField
            label="Company"
            value={editing.company}
            onChangeText={(v) => setEditing({ ...editing, company: v })}
            placeholder="—"
          />
          <TextField
            label="Designation"
            value={editing.designation}
            onChangeText={(v) => setEditing({ ...editing, designation: v })}
            placeholder="—"
          />
        </View>

        <View style={styles.ctaCol}>
          <Button label="Looks good — continue" onPress={onConfirm} />
          <Button label="Re-check from image" variant="secondary" onPress={onRecheck} style={{ marginTop: spacing.sm }} />
        </View>
      </Screen>
      <LoadingOverlay visible={rechecking} title="Re-checking" message="Looking at the image again." />
    </>
  );
}

const styles = StyleSheet.create({
  warningCard: { marginTop: spacing.sm, borderColor: 'rgba(251,191,36,0.4)' },
  warningText: { ...typography.body, color: colors.textPrimary, marginTop: 2 },
  ctaCol: { marginTop: spacing.xl, marginBottom: spacing.lg },
});
