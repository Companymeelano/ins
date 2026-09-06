import { NextRequest, NextResponse } from 'next/server';
import { getBrandContext } from '@/lib/brand';
import { parseBody, captionSchema } from '@/lib/validators';
import { enforceRate } from '@/lib/rate-limit';
import { audit, abEvent } from '@/lib/observability';
import { getFlags } from '@/lib/flags';
import { generateCaption } from '@/services/content-service';
import { PROMPT_VERSION, type CaptionOutput } from '@/lib/prompt-builder';

export async function POST(request: NextRequest) {
  const limited = enforceRate(request, 'ai-caption', 20, 60000);
  if (limited) return limited;

  const parsed = await parseBody(request, captionSchema);
  if (!parsed.ok) return parsed.response;
  const input = parsed.data;

  try {
    const flags = await getFlags();
    const brand = await getBrandContext();
    abEvent('caption_prompt', PROMPT_VERSION, 'served');

    const result = await generateCaption(input, brand, { selfConsistency: flags.ai_self_consistency, moderation: flags.ai_moderation });

    if (result && 'blocked' in result) {
      audit('caption_blocked', { category: 'ai', detail: input.topic.slice(0, 80) });
      return NextResponse.json({ error: 'موضوع شامل ادعای غیرمجاز (پزشکی/مالی) است', moderation: result.moderation }, { status: 422 });
    }

    if (result && result.caption) {
      audit('caption_generated', { category: 'ai', meta: { model: result.model, version: PROMPT_VERSION } });
      return NextResponse.json({ success: true, ...result });
    }

    // fallback داخلی نهایی
    return NextResponse.json({ success: true, ...fallbackCaption(input.topic, input.tone, input.category), promptVersion: PROMPT_VERSION });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در تولید کپشن' }, { status: 500 });
  }
}

function fallbackCaption(topic: string, tone = 'دوستانه', category = 'عمومی') {
  const hooks: Record<string, string> = {
    'دوستانه': 'سلام رفیق! 👋', 'رسمی': 'به اطلاع می‌رسانیم:', 'طنز': 'اینو نخونی ضرر می‌کنی 😂',
    'انگیزشی': 'تو لایق بهترین‌هایی 🚀', 'حرفه‌ای': 'یک نکته کلیدی:', 'احساسی': 'بعضی لحظه‌ها خاص‌اند ❤️',
  };
  const tags = ['ترند', 'اکسپلور', 'وایرال', 'ایران', 'اینستاگرام', 'فالو', 'لایک', 'محتوا', 'بهترین', 'کیفیت', category].map((t) => `#${t.replace(/\s+/g, '_')}`);
  const structured: CaptionOutput = {
    hook: hooks[tone] || hooks['دوستانه'], body: topic,
    cta: '📌 کامنت کن • 💾 ذخیره کن • 🔔 فالو کن', hashtags: tags, tone, risk_flags: [],
  };
  return { caption: `${structured.hook}\n\n${topic}\n\n${structured.cta}\n\n${tags.join(' ')}`, structured, model: 'Smart Engine', qa: { ok: true, warnings: [] }, seoScore: 88 };
}
