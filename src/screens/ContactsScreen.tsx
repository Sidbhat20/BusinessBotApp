import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Search, Trash2 } from 'lucide-react-native';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { TextField } from '../components/TextField';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { useContacts } from '../stores/contactsStore';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Contacts'>;

export function ContactsScreen({ navigation }: Props) {
  const contacts = useContacts((s) => s.contacts);
  const removeContact = useContacts((s) => s.removeContact);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => {
      const d = c.details;
      return (
        d.name.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.company.toLowerCase().includes(q) ||
        d.designation.toLowerCase().includes(q)
      );
    });
  }, [contacts, query]);

  const onDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete contact?',
      `${name || 'This contact'} and all its drafts will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeContact(id) },
      ],
    );
  };

  return (
    <Screen>
      <Header
        eyebrow={`${contacts.length} saved`}
        title="Contacts"
        onBack={() => navigation.goBack()}
      />
      <TextField
        value={query}
        onChangeText={setQuery}
        placeholder="Search by name, company, email"
        rightAccessory={<Search size={18} color={colors.textMuted} />}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {filtered.length === 0 ? (
        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.empty}>
            {contacts.length === 0 ? 'No contacts yet. Scan a card to get started.' : 'No matches found.'}
          </Text>
        </Card>
      ) : (
        <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
          {filtered.map((c) => (
            <Card key={c.id} onPress={() => {
              if ((c.drafts?.length || 0) > 0) {
                navigation.navigate('Draft', { contactId: c.id, draftId: c.drafts[0].id });
              } else {
                navigation.navigate('Conversation', { contactId: c.id });
              }
            }}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{c.details.name || 'Unnamed contact'}</Text>
                  {c.details.designation || c.details.company ? (
                    <Text style={styles.meta}>
                      {[c.details.designation, c.details.company].filter(Boolean).join(' · ')}
                    </Text>
                  ) : null}
                  {c.details.email ? (
                    <Text style={styles.email}>{c.details.email}</Text>
                  ) : null}
                </View>
                <Pressable
                  hitSlop={10}
                  onPress={() => onDelete(c.id, c.details.name)}
                  style={styles.deleteBtn}
                >
                  <Trash2 size={16} color={colors.textMuted} />
                </Pressable>
              </View>
              {(c.drafts?.length || 0) > 0 ? (
                <Pill label={`${c.drafts.length} draft${c.drafts.length === 1 ? '' : 's'}`} tone="accent" style={{ marginTop: spacing.sm }} />
              ) : null}
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { ...typography.body, color: colors.textSecondary },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  name: { ...typography.h3, color: colors.textPrimary },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  email: { ...typography.caption, color: colors.accent, marginTop: 2 },
  deleteBtn: { padding: 6 },
});
