export type Profile = {
  name: string;
  email: string;
  company: string;
  designation: string;
  roleDescription: string;
};

export type ContactDetails = {
  name: string;
  email: string;
  phone: string;
  company: string;
  designation: string;
};

export type Tone = 'professional' | 'casual' | 'persuasive';

export type DraftEntry = {
  id: string;
  tone: Tone;
  subject: string;
  body: string;
  createdAt: string;
};

export type Contact = {
  id: string;
  createdAt: string;
  updatedAt: string;
  details: ContactDetails;
  keyMoments: string;
  drafts: DraftEntry[];
  extractionWarnings: string[];
  imageDataUrl?: string;
  source: 'mobile';
};

export type AzureConfig = {
  apiKey: string;
  endpoint: string;
  model: string;
};

export type ExtractionResult = {
  details: ContactDetails;
  warnings: string[];
};

export type FlowState =
  | { mode: 'idle' }
  | { mode: 'awaiting_review'; contactId: string }
  | { mode: 'awaiting_context'; contactId: string }
  | { mode: 'awaiting_tone'; contactId: string };
