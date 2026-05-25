import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { hasHostedProxy } from '../config/appConfig';
import { useSettings } from '../stores/settingsStore';
import { useProfile } from '../stores/profileStore';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { ApiKeySetupScreen } from '../screens/ApiKeySetupScreen';
import { ProfileSetupScreen } from '../screens/ProfileSetupScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ReviewScreen } from '../screens/ReviewScreen';
import { ConversationScreen } from '../screens/ConversationScreen';
import { TonePickerScreen } from '../screens/TonePickerScreen';
import { DraftScreen } from '../screens/DraftScreen';
import { ContactsScreen } from '../screens/ContactsScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.accent,
    notification: colors.accent,
  },
};

export function RootNavigator() {
  const settingsHydrated = useSettings((s) => s.hydrated);
  const profileHydrated = useProfile((s) => s.hydrated);
  const isConfigured = useSettings((s) => s.isConfigured());
  const profile = useProfile((s) => s.profile);

  if (!settingsHydrated || !profileHydrated) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  const zeroSetup = hasHostedProxy();

  let initialRoute: keyof RootStackParamList = 'Home';
  if (!isConfigured) initialRoute = zeroSetup ? 'ProfileSetup' : 'Welcome';
  else if (!profile) initialRoute = 'ProfileSetup';

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="ApiKeySetup" component={ApiKeySetupScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen name="Conversation" component={ConversationScreen} />
        <Stack.Screen name="TonePicker" component={TonePickerScreen} />
        <Stack.Screen name="Draft" component={DraftScreen} />
        <Stack.Screen name="Contacts" component={ContactsScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
