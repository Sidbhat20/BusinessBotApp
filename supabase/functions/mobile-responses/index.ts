// @ts-nocheck

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const apiKey = Deno.env.get('AZURE_OPENAI_API_KEY');
  const endpoint = (Deno.env.get('AZURE_OPENAI_ENDPOINT') || '').replace(/\/+$/, '');
  const model = Deno.env.get('AZURE_OPENAI_MODEL') || 'gpt-5.4';

  if (!apiKey || !endpoint) {
    return new Response(JSON.stringify({ error: 'Missing Azure OpenAI secrets in Supabase Edge Function.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload = await req.json();
    const response = await fetch(`${endpoint}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        ...payload,
        model: payload?.model || model,
      }),
    });

    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
