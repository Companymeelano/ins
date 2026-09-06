import { NextRequest, NextResponse } from 'next/server';
import { getBrandContext } from '@/lib/brand';
import { parseBody } from '@/lib/validators';
import { enforceRate } from '@/lib/rate-limit';
import { audit } from '@/lib/observability';
import { generateCaption, buildImage } from '@/services/content-service';
import { routeJson } from '@/lib/ai-router';
import { buildReelPrompt, buildStoryPrompt } from '@/lib/prompt-builder';
import { z } from 'zod';

const schema = z.object({ topic: z.string().min(1, 'ایده الزامی است').max(2000), tone: z.string().optional(), category: z.string().optional() });

// Auto-Repurpose — از یک ایده، هم‌زمان پست + استوری + ریلز + کاروسل بساز
export async function POST(request: NextRequest) {
  const limited = enforceRate(request, 'ai-repurpose', 8, 60000);
  if (limited) return limited;

  const parsed = await parseBody(request, schema);
  if (!parsed.ok) return parsed.response;
  const { topic, tone, category } = parsed.data;

  try {
    const brand = await getBrandContext();

    // ۱) پست (کپشن ساختاری)
    const postResult = await generateCaption({ topic, tone, category }, brand, { moderation: true });
    if (postResult && 'blocked' in postResult) {
      return NextResponse.json({ error: 'ایده شامل ادعای غیرمجاز است', moderation: postResult.moderation }, { status: 422 });
    }

    // ۲) تصویر پست
    const img = buildImage(topic, brand);

    // ۳) استوری (توالی کارت)
    const story = await routeJson<{ cards: { text: string; sticker: string; sticker_text?: string }[]; cta: string }>(
      'general', buildStoryPrompt(topic, brand),
      (o) => Array.isArray(o?.cards), 1
    );

    // ۴) ریلز (سناریو)
    const reel = await routeJson<{ hook: string; shot_list: string[]; voiceover: string; caption: string; hashtags: string[] }>(
      'reel', buildReelPrompt(topic, '۱۵ ثانیه', brand),
      (o) => !!o?.hook, 1
    );

    // ۵) کاروسل (اسلایدها)
    const carousel = fallbackCarousel(topic);

    audit('auto_repurpose', { category: 'ai', detail: topic.slice(0, 80) });
    return NextResponse.json({
      success: true,
      post: postResult ? { caption: postResult.caption, structured: postResult.structured, image: img.imageUrl } : fallbackPost(topic),
      story: story?.data || fallbackStory(topic),
      reel: reel?.data || fallbackReel(topic),
      carousel,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در بازتولید محتوا' }, { status: 500 });
  }
}

function fallbackPost(topic: string) {
  return { caption: `${topic}\n\n📌 کامنت کن • 💾 ذخیره کن • 🔔 فالو کن\n\n#ترند #اکسپلور #وایرال`, structured: null, image: '' };
}
function fallbackStory(topic: string) {
  return { cards: [{ text: topic, sticker: 'poll', sticker_text: 'نظرت چیه؟' }, { text: 'تا آخر ببین 👀', sticker: 'none' }], cta: 'به دایرکت پیام بده' };
}
function fallbackReel(topic: string) {
  return { hook: `${topic}؟ تا آخر ببین! 🔥`, shot_list: ['۰-۳ث: قلاب', '۳-۱۰ث: محتوا', '۱۰-۱۵ث: کال تو اکشن'], voiceover: `درباره ${topic} بدون که...`, caption: topic, hashtags: ['#ریلز', '#اکسپلور'] };
}
function fallbackCarousel(topic: string) {
  return { slides: [`${topic} (ورق بزن 👉)`, 'نکته اول', 'نکته دوم', 'نکته سوم', 'ذخیره کن و فالو کن! 💜'] };
}
