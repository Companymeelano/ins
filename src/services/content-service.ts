import { route, routeJson, parseJson } from '@/lib/ai-router';
import { buildCaptionPrompt, buildImagePrompt, scoreCaption, qaCaption, PROMPT_VERSION, type CaptionOutput, type BrandContext } from '@/lib/prompt-builder';
import { moderate } from '@/lib/moderation';

// Service Layer — منطق تولید محتوا، جدا از route handlers (Action-Based Architecture)

export interface CaptionResult {
  caption: string; structured: CaptionOutput | null; model: string;
  promptVersion: string; qa: { ok: boolean; warnings: string[] }; seoScore: number;
  moderation?: ReturnType<typeof moderate>;
}

export async function generateCaption(
  input: { topic: string; goal?: string; platform?: string; tone?: string; category?: string },
  brand?: BrandContext,
  opts?: { selfConsistency?: boolean; moderation?: boolean }
): Promise<CaptionResult | { blocked: true; moderation: ReturnType<typeof moderate> }> {
  // moderation ورودی
  if (opts?.moderation !== false) {
    const modIn = moderate(input.topic);
    if (!modIn.allowed) return { blocked: true, moderation: modIn };
  }

  const prompt = buildCaptionPrompt(input, brand);

  // Self-Healing JSON با validator layer
  const validator = (o: CaptionOutput) => !!o?.hook && !!o?.body && Array.isArray(o?.hashtags);
  const jsonResult = await routeJson<CaptionOutput>('caption', prompt, validator, 2);

  if (jsonResult) {
    const out = jsonResult.data;
    const caption = `${out.hook}\n\n${out.body}\n\n${out.cta}\n\n${(out.hashtags || []).join(' ')}`;
    const modOut = opts?.moderation !== false ? moderate(caption) : undefined;
    const qa = qaCaption(out, brand);
    if (modOut?.flags.length) qa.warnings.push(...modOut.flags.map((f) => f.note));
    return { caption, structured: out, model: jsonResult.model, promptVersion: PROMPT_VERSION, qa, seoScore: scoreCaption(caption), moderation: modOut };
  }

  // fallback متن آزاد
  const r = await route('caption', prompt);
  if (r) {
    const parsed = parseJson<CaptionOutput>(r.text);
    const caption = parsed?.hook ? `${parsed.hook}\n\n${parsed.body}\n\n${parsed.cta}\n\n${(parsed.hashtags || []).join(' ')}` : r.text;
    return { caption, structured: parsed, model: r.model, promptVersion: PROMPT_VERSION, qa: { ok: true, warnings: [] }, seoScore: scoreCaption(caption) };
  }

  return null as unknown as CaptionResult; // اجازه بده route fallback داخلی بزند
}

export function buildImage(subject: string, brand?: BrandContext, style?: string) {
  const b = brand ? { ...brand } : undefined;
  if (b && style) b.visualStyle = style;
  const { positive, negative } = buildImagePrompt(subject, b);
  const seed = Math.floor(Math.random() * 1000000);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(positive.slice(0, 400))}?width=1080&height=1350&seed=${seed}&nologo=true&model=flux`;
  return { imageUrl, positive, negative };
}
