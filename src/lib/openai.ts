import OpenAI from 'openai';

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

export function hasOpenAI(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/** Fast, cheap structured decisions — gpt-4o-mini */
export async function miniChat(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const client = getClient();
  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
  });
  return res.choices[0]?.message?.content ?? '';
}

/** Creative / brand copy — gpt-4o */
export async function creativeChat(
  systemPrompt: string,
  userPrompt: string,
  _seed?: number, // kept for API compat but NOT passed to OpenAI — seed in prompt text is enough
): Promise<string> {
  const client = getClient();
  const res = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.9,
  });
  return res.choices[0]?.message?.content ?? '';
}

/** Parse JSON from LLM response, strip markdown fences if present */
export function parseJSON<T>(raw: string): T {
  const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
  return JSON.parse(cleaned) as T;
}
