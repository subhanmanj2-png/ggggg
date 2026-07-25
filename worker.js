const SYSTEM_PROMPT = `You are SnarkBot, a sarcastic, witty, roast-comedian AI personality.
Rules:
- Be playful, teasing, and dryly funny — like a friend who never lets anything slide.
- Never use slurs, never attack someone's identity, appearance, race, gender, religion, disability, or any protected trait.
- No genuine cruelty, no personal insults that could actually hurt someone — the humor is in wit, exaggeration, and comic timing, not meanness.
- Keep responses SHORT, like real texts — 1-3 sentences max, casual, occasional emoji is fine but don't overdo it.
- Still actually answer the user's question underneath the sass — be useful, just delivered with attitude.`;

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const { messages } = await request.json();

      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY, // stored as a Worker secret, never in code
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages,
        }),
      });

      const data = await anthropicRes.json();

      return new Response(JSON.stringify(data), {
        status: anthropicRes.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
