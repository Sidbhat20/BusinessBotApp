import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { useContacts, getRecentDrafts } from '../stores/contactsStore';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export function HistoryScreen({ navigation }: Props) {
  const contacts = useContacts((s) => s.contacts);
  const items = getRecentDrafts(contacts, 50);

  return (
    <Screen>
      <Header
        eyebrow={`${items.length} drafts`}
        title="Draft history"
        onBack={() => navigation.goBack()}
      />

      {items.length === 0 ? (
        <Card>
          <Text style={styles.empty}>No drafts yet. Scan a card and generate your first email.</Text>
        </Card>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {items.map(({ contact, draft }) => (
            <Card
              key={draft.id}
              onPress={() => navigation.navigate('Draft', { contactId: contact.id, draftId: draft.id })}
            >
              <View style={styles.row}>
                <Pill label={draft.tone} tone="accent" />
                <Text style={styles.date}>{formatDate(draft.createdAt)}</Text>
              </View>
              <Text style={styles.subject} numberOfLines={2}>{draft.subject}</Text>
              <Text style={styles.contact}>
                {contact.details.name || contact.details.email || 'Unnamed'}
                {contact.details.company ? ` · ${contact.details.company}` : ''}
              </Text>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  empty: { ...typography.body, color: colors.textSecondary },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { ...typography.caption, color: colors.textMuted },
  subject: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.xs },
  contact: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
