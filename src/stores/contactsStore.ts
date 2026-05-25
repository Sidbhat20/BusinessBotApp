import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Contact, DraftEntry } from '../types';
import { jsonStorage } from './storage';

type ContactsState = {
  contacts: Contact[];
  hydrated: boolean;
  upsertContact: (contact: Contact) => void;
  getContact: (id: string) => Contact | undefined;
  removeContact: (id: string) => void;
  addDraft: (contactId: string, draft: DraftEntry) => void;
  reset: () => void;
};

export const useContacts = create<ContactsState>()(
  persist(
    (set, get) => ({
      contacts: [],
      hydrated: false,
      upsertContact: (contact) =>
        set((s) => ({
          contacts: [
            contact,
            ...s.contacts.filter((c) => c.id !== contact.id),
          ].sort(
            (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt),
          ),
        })),
      getContact: (id) => get().contacts.find((c) => c.id === id),
      removeContact: (id) =>
        set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),
      addDraft: (contactId, draft) =>
        set((s) => ({
          contacts: s.contacts.map((c) =>
            c.id === contactId
              ? {
                  ...c,
                  updatedAt: new Date().toISOString(),
                  drafts: [draft, ...(c.drafts || [])],
                }
              : c,
          ),
        })),
      reset: () => set({ contacts: [] }),
    }),
    {
      name: 'businessbot-contacts',
      storage: jsonStorage,
      onRehydrateStorage: () => () => {
        setTimeout(() => useContacts.setState({ hydrated: true }), 0);
      },
    },
  ),
);

export function getRecentDrafts(contacts: Contact[], limit = 20) {
  return contacts
    .flatMap((contact) => (contact.drafts || []).map((draft) => ({ contact, draft })))
    .sort((a, b) => +new Date(b.draft.createdAt) - +new Date(a.draft.createdAt))
    .slice(0, limit);
}
