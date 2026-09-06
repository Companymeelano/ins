// Model Router — مسیریابی هوشمند مدل‌ها با timeout، retry، fallback و caching
// هر نوع کار (کپشن/تحلیل/تصویر/vision) به مدل مناسب مسیر داده می‌شود.

import crypto from 'crypto';
import { canRequest, recordSuccess, recordFailure } from '@/lib/circuit-breaker';

type Task = 'caption' | 'analysis' | 'reel' | 'ideas' | 'vision' | 'general';

interface RouterResult {
  text: string;
  model: string;
  cached: boolean;
  usedFallback: boolean;
}

// انتخاب مدل بر اساس نوع کار (model router)
const MODEL_MAP: Record<Task, string> = {
  caption: 'gemini-2.0-flash',
  analysis: 'gemini-2.0-flash',
  reel: 'gemini-2.0-flash',
  ideas: 'gemini-2.0-flash',
  vision: 'gemini-2.0-flash',
  general: 'gemini-2.0-flash',
};

// کش ساده در حافظه (TTL ۱۰ دقیقه)
const cache = new Map<string, { text: string; model: string; at: number }>();
const CACHE_TTL = 10 * 60 * 1000;

function cacheKey(task: string, prompt: string): string {
  return crypto.createHash('sha256').update(`${task}:${prompt}`).digest('hex').slice(0, 32);
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

// فراخوانی یک مدل Gemini با timeout
async function callModel(model: string, prompt: string, temperature = 0.9): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  // Circuit breaker — اگر provider قطع است، درخواست نده
  if (!canRequest('gemini')) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature, topP: 0.95, maxOutputTokens: 2048 } }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);
    if (!res.ok) { recordFailure('gemini'); return null; }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    if (text) recordSuccess('gemini'); else recordFailure('gemini');
    return text;
  } catch { recordFailure('gemini'); return null; }
}

/**
 * مسیریابی هوشمند: کش → مدل اصلی (با retry) → مدل fallback.
 */
export async function route(task: Task, prompt: string, opts?: { temperature?: number; noCache?: boolean }): Promise<RouterResult | null> {
  const key = cacheKey(task, prompt);
  if (!opts?.noCache) {
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < CACHE_TTL) return { text: hit.text, model: hit.model, cached: true, usedFallback: false };
  }

  const primary = MODEL_MAP[task];
  const fallbacks = ['gemini-2.0-flash', 'gemini-1.5-flash'];

  // مدل اصلی با ۲ تلاش
  for (let i = 0; i < 2; i++) {
    const text = await callModel(primary, prompt, opts?.temperature);
    if (text) { cache.set(key, { text, model: primary, at: Date.now() }); return { text, model: primary, cached: false, usedFallback: false }; }
    await sleep(500 * (i + 1));
  }

  // fallback
  for (const fb of fallbacks) {
    if (fb === primary) continue;
    const text = await callModel(fb, prompt, opts?.temperature);
    if (text) { cache.set(key, { text, model: fb, at: Date.now() }); return { text, model: fb, cached: false, usedFallback: true }; }
  }

  return null;
}

/**
 * Self-consistency: چند خروجی بگیر و بهترین را با scorer انتخاب کن.
 */
export async function routeBest(task: Task, prompt: string, scorer: (text: string) => number, samples = 3): Promise<RouterResult | null> {
  const results: RouterResult[] = [];
  for (let i = 0; i < samples; i++) {
    const r = await route(task, prompt, { temperature: 0.85 + i * 0.05, noCache: i > 0 });
    if (r) results.push(r);
    if (i === 0 && !r) break; // اگر اولی fail شد، ادامه نده
  }
  if (!results.length) return null;
  results.sort((a, b) => scorer(b.text) - scorer(a.text));
  return results[0];
}

// استخراج JSON امن از خروجی مدل
export function parseJson<T = Record<string, unknown>>(text: string): T | null {
  try {
    const clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const s = clean.indexOf('{'); const e = clean.lastIndexOf('}');
    if (s === -1 || e === -1) return null;
    return JSON.parse(clean.slice(s, e + 1)) as T;
  } catch { return null; }
}

/**
 * routeJson — تولید خروجی JSON معتبر با Self-Healing.
 * اگر خروجی JSON نامعتبر بود یا از validator رد شد، خودکار با پرامپت اصلاح‌شده retry می‌کند.
 */
export async function routeJson<T>(
  task: Task,
  prompt: string,
  validate: (obj: T) => boolean,
  maxRepairs = 2
): Promise<{ data: T; model: string } | null> {
  let lastText = '';
  for (let attempt = 0; attempt <= maxRepairs; attempt++) {
    const p = attempt === 0
      ? prompt
      : `${prompt}\n\n⚠️ خروجی قبلی نامعتبر بود. حتماً فقط JSON معتبر و کامل برگردان، بدون هیچ متن اضافه یا markdown.${lastText ? `\nخروجی قبلی: ${lastText.slice(0, 200)}` : ''}`;
    const r = await route(task, p, { temperature: attempt === 0 ? 0.8 : 0.4, noCache: attempt > 0 });
    if (!r) continue;
    lastText = r.text;
    const parsed = parseJson<T>(r.text);
    if (parsed && validate(parsed)) return { data: parsed, model: r.model };
  }
  return null;
}
