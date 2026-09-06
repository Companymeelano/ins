import { NextRequest, NextResponse } from 'next/server';
import { callGemini, validateInput, enhanceImagePrompt } from '@/lib/ai';

// تولید محتوای کاروسل چند-اسلایدی (متن هر اسلاید + تصاویر)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const v = validateInput(body.topic, 'موضوع کاروسل');
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
    const topic = v.value;
    const slides = Math.min(Math.max(Number(body.slides) || 5, 3), 8);

    let slideTexts: string[] = [];
    const prompt = `برای موضوع «${topic}» یک کاروسل آموزشی/جذاب اینستاگرام با ${slides} اسلاید بساز.
اسلاید اول جلد جذاب با قلاب، اسلایدهای میانی محتوای ارزشمند، اسلاید آخر کال تو اکشن.
خروجی فقط JSON: {"slides": ["متن اسلاید ۱", "متن اسلاید ۲", ...]}`;

    const result = await callGemini(prompt);
    if (result) {
      const parsed = tryParse(result.text);
      if (parsed && Array.isArray(parsed.slides)) slideTexts = (parsed.slides as string[]).slice(0, slides);
    }

    if (!slideTexts.length) {
      slideTexts = [
        `${topic}\n\n(ورق بزن 👉)`,
        `نکته اول درباره ${topic} که باید بدانی`,
        `نکته دوم که تفاوت ایجاد می‌کند`,
        `نکته سوم و مهم‌ترین بخش`,
        `اگر مفید بود ذخیره کن و فالو کن! 💜`,
      ].slice(0, slides);
    }

    // تولید تصویر برای هر اسلاید
    const images = slideTexts.map((_, i) => {
      const p = enhanceImagePrompt(`${topic}, instagram carousel slide ${i + 1}, cohesive brand design`, 'minimal');
      const seed = Math.floor(Math.random() * 1000000);
      return `https://image.pollinations.ai/prompt/${encodeURIComponent(p.slice(0, 300))}?width=1080&height=1080&seed=${seed}&nologo=true&model=flux`;
    });

    return NextResponse.json({ success: true, slides: slideTexts, images, model: result?.model || 'Smart Carousel Engine' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در ساخت کاروسل' }, { status: 500 });
  }
}

function tryParse(text: string): Record<string, unknown> | null {
  try {
    const clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const s = clean.indexOf('{'); const e = clean.lastIndexOf('}');
    if (s === -1 || e === -1) return null;
    return JSON.parse(clean.slice(s, e + 1));
  } catch { return null; }
}
