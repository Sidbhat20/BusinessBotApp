import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Profile } from '../types';
import { jsonStorage } from './storage';

type ProfileState = {
  profile: Profile | null;
  hydrated: boolean;
  setProfile: (p: Profile) => void;
  clearProfile: () => void;
};

export const useProfile = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      hydrated: false,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'businessbot-profile',
      storage: jsonStorage,
      onRehydrateStorage: () => () => {
        setTimeout(() => useProfile.setState({ hydrated: true }), 0);
      },
    },
  ),
);
