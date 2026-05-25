# Supabase Edge Function setup

This project includes a Supabase Edge Function at:

- `supabase/functions/mobile-responses/index.ts`

It proxies the mobile app's AI requests to Azure OpenAI so the APK can run without showing API setup to end users.

## Required Supabase secrets

Set these in your Supabase project for the Edge Function:

- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_MODEL`

Example values:

- `AZURE_OPENAI_ENDPOINT=https://ai-research-development-resource.openai.azure.com/openai/v1`
- `AZURE_OPENAI_MODEL=gpt-5.4`

## Deploy steps

Using Supabase CLI on your machine:

```bash
supabase login
supabase link --project-ref pxqxbgsivzhguaghyhax
supabase secrets set \
  AZURE_OPENAI_API_KEY=YOUR_KEY \
  AZURE_OPENAI_ENDPOINT=https://ai-research-development-resource.openai.azure.com/openai/v1 \
  AZURE_OPENAI_MODEL=gpt-5.4
supabase functions deploy mobile-responses
```

## Function URL

After deployment, the app will call:

```text
https://pxqxbgsivzhguaghyhax.supabase.co/functions/v1/mobile-responses
```

## Notes

- The app already includes the Supabase URL and anon key.
- End users will not see Azure API setup in the app.
- Azure secrets stay on the server side in Supabase.
