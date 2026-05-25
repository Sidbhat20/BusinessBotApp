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

export const DEFAULT_AZURE_ENDPOINT = 'https://ai-research-development-resource.openai.azure.com/openai/v1';
export const DEFAULT_AZURE_MODEL = 'gpt-5.4';

export const DEFAULT_AZURE: AzureConfig = {
  apiKey: '',
  endpoint: DEFAULT_AZURE_ENDPOINT,
  model: DEFAULT_AZURE_MODEL,
};

function normalizeAzure(config?: Partial<AzureConfig>): AzureConfig {
  return {
    apiKey: typeof config?.apiKey === 'string' ? config.apiKey.trim() : '',
    endpoint:
      typeof config?.endpoint === 'string' && config.endpoint.trim()
        ? config.endpoint.trim()
        : DEFAULT_AZURE_ENDPOINT,
    model:
      typeof config?.model === 'string' && config.model.trim()
        ? config.model.trim()
        : DEFAULT_AZURE_MODEL,
  };
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      azure: DEFAULT_AZURE,
      hydrated: false,
      setAzure: (config) => set({ azure: normalizeAzure({ ...get().azure, ...config }) }),
      isConfigured: () => Boolean(get().azure.apiKey.trim()),
    }),
    {
      name: 'businessbot-settings',
      storage: jsonStorage,
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<SettingsState> | undefined) ?? {};
        return {
          ...currentState,
          ...persisted,
          azure: normalizeAzure(persisted.azure),
          hydrated: false,
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.hydrated && state;
        // mark hydrated after rehydration
        setTimeout(() => useSettings.setState({ hydrated: true }), 0);
      },
    },
  ),
);
