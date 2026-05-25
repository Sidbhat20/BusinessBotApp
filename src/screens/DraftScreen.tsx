import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Copy, Mail, RefreshCw, Send } from 'lucide-react-native';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { useContacts } from '../stores/contactsStore';
import { useSettings } from '../stores/settingsStore';
import { useProfile } from '../stores/profileStore';
import { draftFollowUpEmail } from '../api/azureOpenAI';
import { openEmailDraft, openGmailWebDraft } from '../utils/gmail';
import { uuid } from '../utils/id';
import { Tone, DraftEntry } from '../types';
import { colors, radii, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Draft'>;

const tones: Tone[] = ['professional', 'casual', 'persuasive'];

export function DraftScreen({ route, navigation }: Props) {
  const { contactId, draftId } = route.params;
  const contact = useContacts((s) => s.contacts.find((c) => c.id === contactId));
  const addDraft = useContacts((s) => s.addDraft);
  const azure = useSettings((s) => s.azure);
  const profile = useProfile((s) => s.profile);

  const [activeDraftId, setActiveDraftId] = useState(draftId);
  const [regenerating, setRegenerating] = useState<Tone | null>(null);

  const draft = contact?.drafts.find((d) => d.id === activeDraftId);

  if (!contact || !draft) {
    return (
      <Screen>
        <Header title="Draft not found" onBack={() => navigation.goBack()} />
      </Screen>
    );
  }

  const onCopy = () => {
    const text = `${draft.subject}\n\n${draft.body}`;
    Clipboard.setString(text);
    Alert.alert('Copied', 'Draft is on your clipboard.');
  };

  const onSend = async () => {
    if (!contact.details.email) {
      Alert.alert('No email', 'Add the recipient email in the contact details first.');
      return;
    }
    try {
      await openEmailDraft(contact.details.email, draft.subject, draft.body);
    } catch (err: any) {
      Alert.alert('Could not open mail app', err?.message || 'Try copying instead.');
    }
  };

  const onOpenGmailWeb = async () => {
    if (!contact.details.email) {
      Alert.alert('No email', 'Add the recipient email in the contact details first.');
      return;
    }
    try {
      await openGmailWebDraft(contact.details.email, draft.subject, draft.body);
    } catch (err: any) {
      Alert.alert('Could not open Gmail', err?.message || 'Try copying instead.');
    }
  };

  const onRewrite = async (tone: Tone) => {
    if (!profile) return;
    setRegenerating(tone);
    try {
      const result = await draftFollowUpEmail(azure, {
        profile,
        contact: contact.details,
        tone,
        keyMoments: contact.keyMoments || '',
      });
      const entry: DraftEntry = {
        id: uuid(),
        tone,
        subject: result.subject,
        body: result.body,
        createdAt: new Date().toISOString(),
      };
      addDraft(contact.id, entry);
      setActiveDraftId(entry.id);
    } catch (err: any) {
      Alert.alert('Could not rewrite', err?.message || 'Please try again.');
    } finally {
      setRegenerating(null);
    }
  };

  return (
    <>
      <Screen>
        <Header
          eyebrow={`To ${contact.details.name || contact.details.email || 'contact'}`}
          title="Your draft"
          onBack={() => navigation.goBack()}
        />

        <Pill label={draft.tone} tone="accent" />

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.fieldLabel}>SUBJECT</Text>
          <Text style={styles.subject}>{draft.subject}</Text>

          <View style={styles.divider} />

          <Text style={styles.fieldLabel}>BODY</Text>
          <Text style={styles.body}>{draft.body}</Text>
        </Card>

        <View style={styles.actionsRow}>
          <ActionButton icon={<Send size={18} color={colors.textOnAccent} />} label="Send via mail app" onPress={onSend} primary />
        </View>
        <View style={styles.actionsRowSecondary}>
          <ActionButton icon={<Copy size={18} color={colors.textPrimary} />} label="Copy" onPress={onCopy} />
          <ActionButton icon={<Mail size={18} color={colors.textPrimary} />} label="Open Gmail web" onPress={onOpenGmailWeb} />
        </View>

        <Text style={styles.section}>Rewrite in another tone</Text>
        <View style={styles.toneRow}>
          {tones.filter((t) => t !== draft.tone).map((t) => (
            <Pressable
              key={t}
              onPress={() => onRewrite(t)}
              style={styles.toneBtn}
            >
              <RefreshCw size={14} color={colors.accent} />
              <Text style={styles.toneBtnLabel}>{t}</Text>
            </Pressable>
          ))}
        </View>
      </Screen>
      <LoadingOverlay
        visible={!!regenerating}
        title="Rewriting"
        message={regenerating ? `Generating ${regenerating} version.` : undefined}
      />
    </>
  );
}

function ActionButton({
  icon, label, onPress, primary,
}: { icon: React.ReactNode; label: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.actionBtn, primary && styles.actionBtnPrimary]}>
      {icon}
      <Text style={[styles.actionLabel, primary && { color: colors.textOnAccent }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fieldLabel: { ...typography.micro, color: colors.textSecondary, textTransform: 'uppercase', marginBottom: spacing.xs },
  subject: { ...typography.h3, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.borderSubtle, marginVertical: spacing.md },
  body: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },

  actionsRow: { marginTop: spacing.lg },
  actionsRowSecondary: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },

  actionBtn: {
    flex: 1,
    height: 50,
    borderRadius: radii.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle,
  },
  actionBtnPrimary: { backgroundColor: colors.accent, borderColor: colors.accent },
  actionLabel: { ...typography.button, color: colors.textPrimary, marginLeft: spacing.xs },

  section: { ...typography.micro, color: colors.textSecondary, textTransform: 'uppercase', marginTop: spacing.xl, marginBottom: spacing.sm },
  toneRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  toneBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accent,
  },
  toneBtnLabel: { ...typography.bodyMedium, color: colors.accentBright, textTransform: 'capitalize' },
});
