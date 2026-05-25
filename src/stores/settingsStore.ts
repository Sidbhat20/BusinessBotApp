import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AzureConfig } from '../types';
import { jsonStorage } from './storage';

type SettingsState = {
  azure: AzureConfig;
  hydrated: boolean;
  setAzure: (config: Partial<AzureConfig>) => void;
  isConfigured: () => boolean;
};

const DEFAULT_AZURE: AzureConfig = {
  apiKey: '',
  endpoint: 'https://ai-research-development-resource.openai.azure.com/openai/v1',
  model: 'gpt-5.4',
};

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      azure: DEFAULT_AZURE,
      hydrated: false,
      setAzure: (config) => set({ azure: { ...get().azure, ...config } }),
      isConfigured: () => {
        const a = get().azure;
        return Boolean(a.apiKey && a.endpoint && a.model);
      },
    }),
    {
      name: 'businessbot-settings',
      storage: jsonStorage,
      onRehydrateStorage: () => (state) => {
        state?.hydrated && state;
        // mark hydrated after rehydration
        setTimeout(() => useSettings.setState({ hydrated: true }), 0);
      },
    },
  ),
);
