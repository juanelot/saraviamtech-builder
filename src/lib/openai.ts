import OpenAI from 'openai';

const MINI_TIMEOUT_MS = 12_000;
const CREATIVE_TIMEOUT_MS = 20_000;

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

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

/** Fast, cheap structured decisions — gpt-4o-mini */
export async function miniChat(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const client = getClient();
  const res = await withTimeout(
    client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
    }),
    MINI_TIMEOUT_MS,
    'miniChat',
  );
  return res.choices[0]?.message?.content ?? '';
}

/** Creative / brand copy — gpt-4o */
export async function creativeChat(
  systemPrompt: string,
  userPrompt: string,
  _seed?: number,
): Promise<string> {
  const client = getClient();
  const res = await withTimeout(
    client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9,
    }),
    CREATIVE_TIMEOUT_MS,
    'creativeChat',
  );
  return res.choices[0]?.message?.content ?? '';
}

/** Parse JSON from LLM response, strip markdown fences if present */
export function parseJSON<T>(raw: string): T {
  const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
  return JSON.parse(cleaned) as T;
}
