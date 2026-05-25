import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radii, spacing, typography, layout } from '../theme';

type Props = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  multiline?: boolean;
  containerStyle?: ViewStyle;
  rightAccessory?: React.ReactNode;
};

export function TextField({
  label,
  hint,
  error,
  multiline,
  containerStyle,
  rightAccessory,
  ...inputProps
}: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.fieldWrap,
          multiline && styles.fieldMultiline,
          focused && styles.fieldFocused,
          !!error && styles.fieldError,
        ]}
      >
        <TextInput
          {...inputProps}
          multiline={multiline}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            inputProps.style,
          ]}
        />
        {rightAccessory ? <View style={styles.accessory}>{rightAccessory}</View> : null}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: {
    ...typography.micro,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  fieldWrap: {
    minHeight: layout.inputHeight,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldMultiline: {
    minHeight: 120,
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  fieldFocused: { borderColor: colors.accent },
  fieldError: { borderColor: colors.error },
  input: {
    flex: 1,
    color: colors.textPrimary,
    ...typography.lead,
    paddingVertical: 0,
  },
  inputMultiline: { textAlignVertical: 'top', minHeight: 100 },
  accessory: { marginLeft: spacing.xs },
  hint: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  error: { ...typography.caption, color: colors.error, marginTop: spacing.xs },
});
