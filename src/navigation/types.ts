export type RootStackParamList = {
  Welcome: undefined;
  ApiKeySetup: undefined;
  ProfileSetup: undefined;
  Home: undefined;
  Review: { contactId: string };
  Conversation: { contactId: string };
  TonePicker: { contactId: string };
  Draft: { contactId: string; draftId: string };
  Contacts: undefined;
  History: undefined;
  Settings: undefined;
};
