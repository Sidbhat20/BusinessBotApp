import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { useContacts } from '../stores/contactsStore';
import { validateConversation } from '../utils/validation';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Conversation'>;

export function ConversationScreen({ route, navigation }: Props) {
  const { contactId } = route.params;
  const contact = useContacts((s) => s.contacts.find((c) => c.id === contactId));
  const upsertContact = useContacts((s) => s.upsertContact);
  const [value, setValue] = useState(contact?.keyMoments || '');
  const [error, setError] = useState<string | null>(null);

  if (!contact) {
    return (
      <Screen>
        <Header title="Contact not found" onBack={() => navigation.goBack()} />
      </Screen>
    );
  }

  const onContinue = () => {
    const result = validateConversation(value);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    upsertContact({ ...contact, keyMoments: result.value, updatedAt: new Date().toISOString() });
    setError(null);
    navigation.navigate('TonePicker', { contactId: contact.id });
  };

  const onSkip = () => {
    upsertContact({ ...contact, keyMoments: '', updatedAt: new Date().toISOString() });
    navigation.navigate('TonePicker', { contactId: contact.id });
  };

  return (
    <Screen>
      <Header
        eyebrow={`Drafting for ${contact.details.name || 'this contact'}`}
        title="Your key conversation"
        onBack={() => navigation.goBack()}
      />
      <Text style={styles.lead}>
        Where did you meet? What did you talk about? What is your intent?
      </Text>
      <Text style={styles.helper}>
        The richer this is, the more specific your AI draft will be.
      </Text>

      <View style={{ marginTop: spacing.lg }}>
        <TextField
          value={value}
          onChangeText={(v) => {
            setValue(v);
            if (error) setError(null);
          }}
          placeholder="Met at the AI Summit in Bangalore last Friday. We discussed how their ops team uses agents for ticket triage — they were curious about wiring it to Azure OpenAI."
          multiline
          error={error || undefined}
          autoFocus
        />
      </View>

      <View style={styles.cta}>
        <Button label="Continue to tone" onPress={onContinue} />
        <Button label="Skip" variant="ghost" onPress={onSkip} style={{ marginTop: spacing.sm }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: { ...typography.lead, color: colors.textPrimary },
  helper: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  cta: { marginTop: spacing.lg },
});
