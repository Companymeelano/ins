// ماژول مرکزی هوش مصنوعی — با مدیریت خطا، تلاش مجدد و fallback هوشمند
// همه سرویس‌های AI پروژه از این ماژول استفاده می‌کنند تا خطا به حداقل برسد.

const GEMINI_MODEL = 'gemini-2.0-flash';

interface GeminiResult {
  text: string;
  model: string;
  usedFallback: boolean;
}

/**
 * فراخوانی امن Gemini با تلاش مجدد خودکار.
 * اگر کلید نبود یا خطا رخ داد، false برمی‌گرداند تا fallback فعال شود.
 */
export async function callGemini(prompt: string, retries = 2): Promise<GeminiResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.9, topP: 0.95, maxOutputTokens: 2048 },
          }),
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);

      if (!res.ok) {
        if (res.status === 429 && attempt < retries) {
          await sleep(1000 * (attempt + 1));
          continue;
        }
        throw new Error(`Gemini HTTP ${res.status}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) {
        return { text, model: 'Gemini 2.0 Flash', usedFallback: false };
      }
      throw new Error('empty response');
    } catch (e) {
      if (attempt === retries) {
        console.error('Gemini failed after retries:', e);
        return null;
      }
      await sleep(600 * (attempt + 1));
    }
  }
  return null;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * تقویت پرامپت تصویر — کلمات کلیدی کیفیت و جزئیات را اضافه می‌کند تا
 * خطای مدل تولید تصویر کم شود و خروجی حرفه‌ای‌تر باشد.
 */
export function enhanceImagePrompt(base: string, style: string): string {
  const styleMap: Record<string, string> = {
    realistic: 'photorealistic, natural lighting, sharp focus, high detail',
    cinematic: 'cinematic lighting, film grain, teal and orange color grade, shallow depth of field, dramatic mood',
    minimal: 'minimalist composition, clean background, negative space, soft shadows, studio lighting',
    vibrant: 'vibrant saturated colors, high energy, dynamic composition, bright',
    luxury: 'luxury aesthetic, premium look, elegant, gold accents, sophisticated lighting',
    vintage: 'vintage film look, retro color palette, nostalgic mood, subtle grain',
  };
  const quality = 'ultra detailed, 8K resolution, professional photography, instagram-ready, no text artifacts, no distorted faces, no extra limbs';
  const styleTag = styleMap[style] || styleMap.realistic;
  return `${base.trim()}, ${styleTag}, ${quality}`;
}

/**
 * اعتبارسنجی ورودی متن — از خطای مدل و ورودی نامعتبر جلوگیری می‌کند.
 */
export function validateInput(value: unknown, field: string, maxLen = 2000): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof value !== 'string' || !value.trim()) {
    return { ok: false, error: `${field} الزامی است` };
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLen) {
    return { ok: false, error: `${field} بیش از حد طولانی است` };
  }
  return { ok: true, value: trimmed };
}

/** تبدیل رشته کاما-جدا به آرایه هشتگ تمیز */
export function toHashtags(input: string): string[] {
  return input
    .split(/[,،\n]/)
    .map((s) => s.trim().replace(/^#/, '').replace(/\s+/g, '_'))
    .filter(Boolean)
    .slice(0, 15)
    .map((s) => `#${s}`);
}
