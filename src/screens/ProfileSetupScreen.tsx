import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { StepIndicator } from '../components/StepIndicator';
import { useProfile } from '../stores/profileStore';
import { useSettings } from '../stores/settingsStore';
import { Profile } from '../types';
import { profileFields, validateProfileAnswer } from '../utils/validation';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileSetup'>;

const blankProfile: Profile = {
  name: '',
  email: '',
  company: '',
  designation: '',
  roleDescription: '',
};

export function ProfileSetupScreen({ navigation }: Props) {
  const existing = useProfile((s) => s.profile);
  const setProfile = useProfile((s) => s.setProfile);
  const isConfigured = useSettings((s) => s.isConfigured());

  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<Profile>(existing || blankProfile);
  const [value, setValue] = useState<string>(
    existing ? existing[profileFields[0].key] : '',
  );
  const [error, setError] = useState<string | null>(null);

  const field = profileFields[stepIndex];
  const isLast = stepIndex === profileFields.length - 1;
  const subtitle = field.subtitle;

  const placeholders: Record<string, string> = useMemo(() => ({
    name: 'Siddh Bhat',
    email: 'siddh@yourcompany.com',
    company: 'Sudo Sapient',
    designation: 'Founder',
    roleDescription: 'I help businesses ship AI-native products.',
  }), []);

  const onContinue = () => {
    const result = validateProfileAnswer(field.key, value);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    const updated = { ...draft, [field.key]: result.value };
    setError(null);

    if (isLast) {
      setProfile(updated);
      navigation.replace('Home');
      return;
    }

    setDraft(updated);
    const nextIndex = stepIndex + 1;
    setStepIndex(nextIndex);
    setValue(updated[profileFields[nextIndex].key] || '');
  };

  const onBack = () => {
    if (stepIndex === 0) {
      navigation.goBack();
      return;
    }
    const prevIndex = stepIndex - 1;
    setStepIndex(prevIndex);
    setValue(draft[profileFields[prevIndex].key] || '');
    setError(null);
  };

  return (
    <Screen>
      <Header
        eyebrow={isConfigured ? `Profile · Step ${stepIndex + 1} of ${profileFields.length}` : `Step 2 of 2 · ${stepIndex + 1}/${profileFields.length}`}
        title={field.label}
        onBack={onBack}
      />
      <StepIndicator total={profileFields.length} current={stepIndex} />
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={{ marginTop: spacing.lg }}>
        <TextField
          value={value}
          onChangeText={(v) => {
            setValue(v);
            if (error) setError(null);
          }}
          placeholder={placeholders[field.key]}
          keyboardType={field.key === 'email' ? 'email-address' : 'default'}
          autoCapitalize={field.key === 'email' ? 'none' : 'sentences'}
          multiline={field.key === 'roleDescription'}
          error={error || undefined}
          autoFocus
        />
      </View>

      <View style={styles.cta}>
        <Button label={isLast ? 'Finish setup' : 'Continue'} onPress={onContinue} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { ...typography.body, color: colors.textSecondary },
  cta: { marginTop: spacing.xl },
});
