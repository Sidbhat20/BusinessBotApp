import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { ToneChip } from '../components/ToneChip';
import { Button } from '../components/Button';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { useContacts } from '../stores/contactsStore';
import { useSettings } from '../stores/settingsStore';
import { useProfile } from '../stores/profileStore';
import { draftFollowUpEmail } from '../api/azureOpenAI';
import { uuid } from '../utils/id';
import { Tone, DraftEntry } from '../types';
import { spacing } from '../theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TonePicker'>;

const toneOptions: { key: Tone; label: string; desc: string }[] = [
  { key: 'professional', label: 'Professional', desc: 'Polished, concise, neutral.' },
  { key: 'casual', label: 'Casual', desc: 'Warm and conversational, still professional.' },
  { key: 'persuasive', label: 'Persuasive', desc: 'Confident, commercial, action-oriented.' },
];

export function TonePickerScreen({ route, navigation }: Props) {
  const { contactId } = route.params;
  const contact = useContacts((s) => s.contacts.find((c) => c.id === contactId));
  const azure = useSettings((s) => s.azure);
  const profile = useProfile((s) => s.profile);
  const addDraft = useContacts((s) => s.addDraft);

  const [selected, setSelected] = useState<Tone>('professional');
  const [loading, setLoading] = useState(false);

  if (!contact || !profile) {
    return (
      <Screen>
        <Header title="Missing data" onBack={() => navigation.goBack()} />
      </Screen>
    );
  }

  const onGenerate = async () => {
    setLoading(true);
    try {
      const result = await draftFollowUpEmail(azure, {
        profile,
        contact: contact.details,
        tone: selected,
        keyMoments: contact.keyMoments || '',
      });

      const entry: DraftEntry = {
        id: uuid(),
        tone: selected,
        subject: result.subject,
        body: result.body,
        createdAt: new Date().toISOString(),
      };

      addDraft(contact.id, entry);
      setLoading(false);
      navigation.replace('Draft', { contactId: contact.id, draftId: entry.id });
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Could not generate', err?.message || 'Please try again.');
    }
  };

  return (
    <>
      <Screen>
        <Header
          eyebrow="Almost there"
          title="Choose a tone"
          onBack={() => navigation.goBack()}
        />
        <View style={{ marginTop: spacing.md }}>
          {toneOptions.map((o) => (
            <ToneChip
              key={o.key}
              label={o.label}
              description={o.desc}
              selected={selected === o.key}
              onPress={() => setSelected(o.key)}
            />
          ))}
        </View>
        <View style={{ marginTop: spacing.xl }}>
          <Button label={`Draft a ${selected} email`} onPress={onGenerate} />
        </View>
      </Screen>
      <LoadingOverlay visible={loading} title="Drafting" message="Crafting your email." />
    </>
  );
}
