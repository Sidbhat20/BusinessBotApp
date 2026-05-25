import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { Camera as CameraIcon, ImagePlus, Settings as SettingsIcon, Users, Mail } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { BrandRow } from '../components/Brand';
import { Pill } from '../components/Pill';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { colors, radii, spacing, typography } from '../theme';
import { useContacts } from '../stores/contactsStore';
import { useSettings } from '../stores/settingsStore';
import { useProfile } from '../stores/profileStore';
import { extractBusinessCardFromImage } from '../api/azureOpenAI';
import { uuid } from '../utils/id';
import { Contact } from '../types';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const contacts = useContacts((s) => s.contacts);
  const upsertContact = useContacts((s) => s.upsertContact);
  const azure = useSettings((s) => s.azure);
  const profile = useProfile((s) => s.profile);

  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Reading the business card...');

  const recentDrafts = contacts
    .flatMap((c) => (c.drafts || []).map((d) => ({ contact: c, draft: d })))
    .slice(0, 3);

  const handleAsset = useCallback(async (asset?: Asset) => {
    if (!asset) return;
    const base64 = asset.base64;
    if (!base64) {
      Alert.alert('Could not read image', 'Please try a different photo.');
      return;
    }

    const mime = asset.type || 'image/jpeg';
    const dataUrl = `data:${mime};base64,${base64}`;

    setLoading(true);
    setLoadingMsg('Reading the business card...');
    try {
      const result = await extractBusinessCardFromImage(azure, dataUrl);
      const now = new Date().toISOString();
      const contact: Contact = {
        id: uuid(),
        createdAt: now,
        updatedAt: now,
        details: result.details,
        keyMoments: '',
        drafts: [],
        extractionWarnings: result.warnings,
        imageDataUrl: dataUrl,
        source: 'mobile',
      };
      upsertContact(contact);
      setLoading(false);
      navigation.navigate('Review', { contactId: contact.id });
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Extraction failed', err?.message || 'Please try a clearer photo.');
    }
  }, [azure, navigation, upsertContact]);

  const onScan = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      includeBase64: true,
      quality: 0.8,
      saveToPhotos: false,
    });
    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert('Camera error', result.errorMessage || 'Could not open the camera.');
      return;
    }
    handleAsset(result.assets?.[0]);
  };

  const onUpload = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
      quality: 0.8,
      selectionLimit: 1,
    });
    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert('Picker error', result.errorMessage || 'Could not open gallery.');
      return;
    }
    handleAsset(result.assets?.[0]);
  };

  return (
    <>
      <Screen>
        <View style={styles.headerRow}>
          <BrandRow />
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            hitSlop={12}
            style={styles.iconBtn}
          >
            <SettingsIcon size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Pill label={profile ? profile.company : 'You'} tone="accent" />
          <Text style={styles.heroTitle}>
            Turn any card into a polished email.
          </Text>
          <Text style={styles.heroSub}>
            Scan, review, and Business Bot drafts your follow-up in your voice.
          </Text>
        </View>

        <Pressable onPress={onScan} style={styles.primaryCta}>
          <LinearGradient
            colors={[colors.accentBright, colors.accent, colors.accentMuted]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryCtaInner}
          >
            <CameraIcon size={26} color={colors.textOnAccent} />
            <View style={{ marginLeft: spacing.md }}>
              <Text style={styles.primaryCtaTitle}>Scan a business card</Text>
              <Text style={styles.primaryCtaSub}>Open camera</Text>
            </View>
          </LinearGradient>
        </Pressable>

        <Pressable onPress={onUpload} style={styles.secondaryCta}>
          <ImagePlus size={20} color={colors.textPrimary} />
          <Text style={styles.secondaryCtaText}>Upload from gallery</Text>
        </Pressable>

        <View style={styles.row}>
          <NavTile
            icon={<Users size={20} color={colors.accent} />}
            label="Contacts"
            count={contacts.length}
            onPress={() => navigation.navigate('Contacts')}
          />
          <NavTile
            icon={<Mail size={20} color={colors.accent} />}
            label="Drafts"
            count={contacts.reduce((a, c) => a + (c.drafts?.length || 0), 0)}
            onPress={() => navigation.navigate('History')}
          />
        </View>

        {recentDrafts.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Recent drafts</Text>
            <View style={{ gap: spacing.sm }}>
              {recentDrafts.map(({ contact, draft }) => (
                <Card
                  key={draft.id}
                  onPress={() => navigation.navigate('Draft', { contactId: contact.id, draftId: draft.id })}
                >
                  <Text style={styles.draftName}>{contact.details.name || 'Unnamed contact'}</Text>
                  <Text style={styles.draftSubject} numberOfLines={1}>
                    {draft.subject}
                  </Text>
                  <Pill label={draft.tone} tone="default" style={{ marginTop: spacing.sm }} />
                </Card>
              ))}
            </View>
          </>
        ) : (
          <Card style={{ marginTop: spacing.xl }}>
            <Text style={styles.emptyTitle}>No drafts yet.</Text>
            <Text style={styles.emptySub}>
              Scan a card to get your first AI-drafted follow-up email.
            </Text>
          </Card>
        )}
      </Screen>
      <LoadingOverlay visible={loading} title="Reading card" message={loadingMsg} />
    </>
  );
}

function NavTile({
  icon, label, count, onPress,
}: { icon: React.ReactNode; label: string; count: number; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.tile}>
      <View>{icon}</View>
      <View>
        <Text style={styles.tileLabel}>{label}</Text>
        <Text style={styles.tileCount}>{count}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.borderSubtle,
  },
  hero: { marginTop: spacing.xl, marginBottom: spacing.xl },
  heroTitle: { ...typography.h1, color: colors.textPrimary, marginTop: spacing.sm },
  heroSub: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, maxWidth: 320 },

  primaryCta: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  primaryCtaInner: {
    paddingVertical: 22, paddingHorizontal: spacing.lg,
    flexDirection: 'row', alignItems: 'center',
  },
  primaryCtaTitle: { ...typography.h3, color: colors.textOnAccent },
  primaryCtaSub: { ...typography.caption, color: colors.textOnAccent, opacity: 0.7 },

  secondaryCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: radii.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle,
    marginBottom: spacing.lg,
  },
  secondaryCtaText: { ...typography.button, color: colors.textPrimary, marginLeft: spacing.xs },

  row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  tile: {
    flex: 1, padding: spacing.md, borderRadius: radii.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  tileLabel: { ...typography.caption, color: colors.textSecondary, textAlign: 'right' },
  tileCount: { ...typography.h2, color: colors.textPrimary, textAlign: 'right' },

  sectionTitle: { ...typography.micro, color: colors.textSecondary, textTransform: 'uppercase', marginBottom: spacing.sm },

  draftName: { ...typography.h3, color: colors.textPrimary },
  draftSubject: { ...typography.body, color: colors.textSecondary, marginTop: 2 },

  emptyTitle: { ...typography.h3, color: colors.textPrimary },
  emptySub: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xxs },
});
