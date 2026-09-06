import { NextRequest, NextResponse } from 'next/server';
import { toHashtags } from '@/lib/ai';
import { buildImagePrompt } from '@/lib/prompt-builder';
import { getBrandContext } from '@/lib/brand';
import { parseBody, imageSchema } from '@/lib/validators';
import { enforceRate } from '@/lib/rate-limit';
import { moderate } from '@/lib/moderation';
import { audit } from '@/lib/observability';
import { getFlags } from '@/lib/flags';

export async function POST(request: NextRequest) {
  const limited = enforceRate(request, 'ai-image', 15, 60000);
  if (limited) return limited;

  const parsed = await parseBody(request, imageSchema);
  if (!parsed.ok) return parsed.response;
  const { prompt: promptText, style, keywords } = parsed.data;

  const flags = await getFlags();
  if (flags.ai_moderation) {
    const mod = moderate(promptText);
    if (!mod.allowed) {
      audit('image_blocked', { category: 'ai', meta: { flags: mod.flags } });
      return NextResponse.json({ error: 'پرامپت شامل محتوای غیرمجاز است', moderation: mod }, { status: 422 });
    }
  }

  try {
    const brand = await getBrandContext();
    if (style && brand) brand.visualStyle = style;

    const { positive, negative } = buildImagePrompt(`${promptText}${keywords ? ', ' + keywords : ''}`, brand);
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(positive.slice(0, 400))}?width=1080&height=1350&seed=${seed}&nologo=true&model=flux`;

    audit('image_generated', { category: 'ai', meta: { style: brand?.visualStyle } });
    return NextResponse.json({
      success: true, imageUrl, promptUsed: positive, negativePrompt: negative,
      aiModel: 'FLUX + Brand Prompt Builder',
      seoKeywords: ['explore', 'trending', 'aesthetic', ...(keywords ? toHashtags(keywords).map((h: string) => h.slice(1)) : [])].slice(0, 8),
      note: 'تصویر با پرامپت برندشده و guardrail بصری تولید شد. متن فارسی را در لایه UI اضافه کنید.',
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در تولید تصویر' }, { status: 500 });
  }
}
