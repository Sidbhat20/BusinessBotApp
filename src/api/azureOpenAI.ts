import { AzureConfig, ContactDetails, ExtractionResult, Profile, Tone } from '../types';
import { getProxyBaseUrl, hasHostedProxy } from '../config/appConfig';
import { normalizeEmail, normalizePhone } from '../utils/email';

type ResponsesPayload = {
  model: string;
  input: unknown;
  max_output_tokens: number;
};

function cleanString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function titleCaseWords(value: string): string {
  return cleanString(value)
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function parseResponseText(data: any): string {
  if (!data || typeof data !== 'object') return '';
  if (typeof data.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }
  const chunks: string[] = ((data.output as any[]) || [])
    .flatMap((item: any) => item.content || [])
    .map((content: any) => (typeof content.text === 'string' ? content.text : ''))
    .filter(Boolean);
  return chunks.join('\n').trim();
}

function extractJson(text: string): any {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
  const candidate = fenced || text.trim();
  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  const json = firstBrace >= 0 && lastBrace > firstBrace
    ? candidate.slice(firstBrace, lastBrace + 1)
    : candidate;
  return JSON.parse(json);
}

function normaliseContact(record: any): ContactDetails {
  const source = record && typeof record === 'object' ? record : {};
  return {
    name: titleCaseWords(source.name),
    email: cleanString(source.email),
    phone: cleanString(source.phone),
    company: cleanString(source.company),
    designation: cleanString(source.designation),
  };
}

async function createResponse(config: AzureConfig, input: unknown, maxOutputTokens = 900): Promise<string> {
  const payload: ResponsesPayload = {
    model: config.model,
    input,
    max_output_tokens: maxOutputTokens,
  };

  if (hasHostedProxy()) {
    const response = await fetch(`${getProxyBaseUrl()}/api/mobile/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Business Bot backend request failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const text = parseResponseText(data);
    if (!text) {
      throw new Error('Business Bot backend returned an empty response.');
    }
    return text;
  }

  const endpoint = config.endpoint.replace(/\/+$/, '');
  const response = await fetch(`${endpoint}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Azure OpenAI request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = parseResponseText(data);
  if (!text) {
    throw new Error('Azure OpenAI returned an empty response.');
  }
  return text;
}

async function extractOnce(config: AzureConfig, imageDataUrl: string): Promise<ContactDetails> {
  const text = await createResponse(config, [
    {
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: [
            'Extract contact details from this business card image.',
            'Return strict JSON only with this exact shape:',
            '{"name":"","email":"","phone":"","company":"","designation":""}',
            'Rules:',
            '- Do not invent information.',
            '- Unknown fields must be empty strings.',
            '- Preserve the text exactly if you are confident.',
            "- designation should be the person's role or job title.",
          ].join('\n'),
        },
        { type: 'input_image', image_url: imageDataUrl },
      ],
    },
  ], 500);

  return normaliseContact(extractJson(text));
}

async function verifyExtraction(config: AzureConfig, imageDataUrl: string, extracted: ContactDetails): Promise<ContactDetails> {
  const text = await createResponse(config, [
    {
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: [
            'Re-check this business card image and correct OCR mistakes in the extracted contact details.',
            'Pay special attention to email typos like .commm vs .com, gmial vs gmail, and ambiguous letters or numbers.',
            'Only keep values that are actually supported by the image.',
            'Return strict JSON only with this exact shape:',
            '{"name":"","email":"","phone":"","company":"","designation":""}',
            '',
            'Current extraction to verify:',
            JSON.stringify(extracted, null, 2),
          ].join('\n'),
        },
        { type: 'input_image', image_url: imageDataUrl },
      ],
    },
  ], 500);

  return normaliseContact(extractJson(text));
}

function collectWarnings(details: ContactDetails, originalDetails: ContactDetails): string[] {
  const warnings: string[] = [];
  if (!details.name) warnings.push('Name looks missing.');
  if (!details.company) warnings.push('Company looks missing.');
  if (!details.designation) warnings.push('Designation looks missing.');
  if (!details.email) {
    warnings.push('Email was not found.');
  } else {
    if (!/^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/.test(details.email)) {
      warnings.push('Email still looks unusual.');
    }
    if (/(commm|coomm|gmial|gmai\.|gnail|outlok|hotnail|\.con$|\.cmo$)/i.test(originalDetails.email || '')) {
      warnings.push(`Email may have been auto-corrected from "${originalDetails.email}" to "${details.email}".`);
    }
  }
  if (details.phone && details.phone.replace(/\D/g, '').length < 7) {
    warnings.push('Phone number looks short.');
  }
  return warnings;
}

export async function extractBusinessCardFromImage(config: AzureConfig, imageDataUrl: string): Promise<ExtractionResult> {
  const firstPass = await extractOnce(config, imageDataUrl);
  let verified = firstPass;
  try {
    verified = await verifyExtraction(config, imageDataUrl, firstPass);
  } catch (error) {
    // verification optional; fall back to first pass
  }

  const details: ContactDetails = {
    name: verified.name || firstPass.name,
    email: normalizeEmail(verified.email || firstPass.email),
    phone: normalizePhone(verified.phone || firstPass.phone),
    company: verified.company || firstPass.company,
    designation: verified.designation || firstPass.designation,
  };

  return { details, warnings: collectWarnings(details, firstPass) };
}

function toneLine(tone: Tone): string {
  if (tone === 'casual') return 'Sound warm, natural, and conversational while still professional.';
  if (tone === 'persuasive') return 'Sound confident, commercially sharp, and action-oriented.';
  return 'Sound polished, concise, and professional.';
}

export type DraftRequest = {
  profile: Profile;
  contact: ContactDetails;
  tone: Tone;
  keyMoments: string;
};

export type DraftResult = { subject: string; body: string };

function fallbackDraft({ profile, contact, tone, keyMoments }: DraftRequest): DraftResult {
  const intro =
    tone === 'casual'
      ? 'It was great meeting you.'
      : tone === 'persuasive'
      ? 'I came away from our conversation seeing strong potential to work together.'
      : 'It was a pleasure connecting with you.';

  const contextLine = keyMoments
    ? `I wanted to follow up on our conversation about ${keyMoments.replace(/[.]+$/, '')}.`
    : 'I wanted to follow up on our recent conversation.';

  const subject = contact.company
    ? `Following up with ${contact.name || contact.company}`
    : 'Following up from our conversation';

  const body = [
    `Hi ${contact.name || 'there'},`,
    '',
    intro,
    contextLine,
    `I am ${profile.name}, ${profile.designation} at ${profile.company}. ${profile.roleDescription}`,
    contact.company
      ? `I would love to continue the conversation around opportunities relevant to ${contact.company}.`
      : 'I would love to continue the conversation.',
    'If it works for you, I can share a few specific next steps and coordinate a short call.',
    '',
    'Warm regards,',
    profile.name,
    `${profile.designation} · ${profile.company}`,
    profile.email,
  ].filter(Boolean).join('\n');

  return { subject, body };
}

export async function draftFollowUpEmail(config: AzureConfig, req: DraftRequest): Promise<DraftResult> {
  try {
    const text = await createResponse(config, [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: [
              'Draft a concise business follow-up email and return strict JSON only.',
              'Required JSON shape:',
              '{"subject":"","body":""}',
              'Rules:',
              '- Plain text only.',
              '- 120 to 180 words.',
              '- Include a clear next step.',
              '- Use the conversation context directly and specifically; do not ignore it.',
              '- Mention the most relevant topic, intent, or follow-up point from the context in natural language.',
              '- Do not use placeholder text or generic filler if context is provided.',
              `- ${toneLine(req.tone)}`,
              '',
              'Sender profile:',
              JSON.stringify(req.profile, null, 2),
              '',
              'Contact details:',
              JSON.stringify(req.contact, null, 2),
              '',
              'Conversation context:',
              req.keyMoments?.trim() || '(none provided)',
            ].join('\n'),
          },
        ],
      },
    ], 800);

    const parsed = extractJson(text);
    return {
      subject: cleanString(parsed.subject),
      body: cleanString(parsed.body).replace(/\r\n/g, '\n'),
    };
  } catch (error) {
    return fallbackDraft(req);
  }
}
