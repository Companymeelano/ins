import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/lib/ai';
import { storyIdeas } from '@/app/prompts';

// ایده‌پرداز هوشمند برای استوری و پست
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const kind = body.kind === 'post' ? 'پست' : 'استوری';
    const niche = typeof body.niche === 'string' && body.niche.trim() ? body.niche.trim() : 'عمومی';

    const prompt = `تو یک استراتژیست محتوای اینستاگرام هستی. ۵ ایده خلاقانه و تعاملی برای ${kind} در حوزه «${niche}» پیشنهاد بده که تعامل بالا بگیرد و شانس اکسپلور داشته باشد. هر ایده کوتاه (یک خط) و کاربردی باشد. خروجی را فقط به صورت لیست فارسی با ایموجی مناسب در ابتدای هر خط بده.`;

    const result = await callGemini(prompt);
    if (result) {
      const ideas = result.text
        .split('\n')
        .map((l) => l.replace(/^[\d.\-*)\s]+/, '').trim())
        .filter(Boolean)
        .slice(0, 5);
      if (ideas.length) return NextResponse.json({ success: true, ideas, model: result.model });
    }

    // fallback — یک ایده تصادفی از کتابخانه
    const shuffled = [...storyIdeas].sort(() => Math.random() - 0.5).slice(0, 5).map((i) => `${i.emoji} ${i.text}`);
    return NextResponse.json({ success: true, ideas: shuffled, model: 'Smart Idea Engine' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در تولید ایده' }, { status: 500 });
  }
}
