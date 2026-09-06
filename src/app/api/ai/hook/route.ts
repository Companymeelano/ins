import { NextRequest, NextResponse } from 'next/server';
import { callGemini, validateInput, enhanceImagePrompt } from '@/lib/ai';

// تولید کاور ریلز: hook text + cover design prompt + تصویر کاور
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const v = validateInput(body.topic, 'موضوع ریلز');
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
    const topic = v.value;
    const style = typeof body.style === 'string' ? body.style : 'cinematic';

    let hooks: string[] = [];
    let coverPrompt = '';

    const ai = await callGemini(
      `تو متخصص کاور ریلز اینستاگرام هستی. برای موضوع «${topic}» خروجی JSON معتبر بده:
{
  "hooks": ["۵ متن قلاب کوتاه، جذاب و کنجکاوی‌برانگیز فارسی برای روی کاور ریلز"],
  "coverPrompt": "یک پرامپت انگلیسی دقیق برای طراحی تصویر کاور ریلز جذاب و توقف‌کننده اسکرول"
}
متن‌های hook باید کوتاه (۳ تا ۶ کلمه)، احساسی و کلیک‌خور باشند.`
    );
    if (ai) {
      const p = tryParse(ai.text);
      if (p && Array.isArray(p.hooks)) { hooks = (p.hooks as string[]).slice(0, 5); coverPrompt = String(p.coverPrompt || ''); }
    }

    if (!hooks.length) {
      hooks = [
        `این اشتباه را همه می‌کنند ❌`,
        `قبل از خرید اینو ببین 👀`,
        `۳ نکته‌ای که کسی نمی‌گه 🤫`,
        `فقط ۱۰ ثانیه وقت بگذار ⏱️`,
        `${topic}؟ تا آخر ببین! 🔥`,
      ];
    }
    if (!coverPrompt) coverPrompt = `Eye-catching Instagram reel cover about ${topic}, bold composition, high contrast, dramatic lighting, space for large text overlay, scroll-stopping`;

    // تولید تصویر کاور
    const enhanced = enhanceImagePrompt(coverPrompt, style);
    const seed = Math.floor(Math.random() * 1000000);
    const coverImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhanced.slice(0, 350))}?width=1080&height=1920&seed=${seed}&nologo=true&model=flux`;

    return NextResponse.json({ success: true, hooks, coverPrompt, coverImage, model: ai?.model || 'Smart Hook Generator' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در تولید کاور' }, { status: 500 });
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
