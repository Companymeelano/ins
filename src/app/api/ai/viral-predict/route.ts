import { NextRequest, NextResponse } from 'next/server';
import { callGemini, validateInput } from '@/lib/ai';

// پیش‌بینی وایرال شدن پست قبل از انتشار — تحلیل کپشن و امتیازدهی
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const v = validateInput(body.caption, 'کپشن');
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
    const caption = v.value;
    const hasImage = !!body.hasImage;

    const prompt = `تو یک تحلیلگر الگوریتم اینستاگرام هستی. کپشن زیر را تحلیل کن و شانس وایرال/اکسپلور شدن آن را بسنج.
کپشن:
"""${caption}"""
خروجی را فقط JSON معتبر بده:
{
  "score": عددی بین ۰ تا ۱۰۰,
  "strengths": ["نقطه قوت ۱", "نقطه قوت ۲"],
  "improvements": ["پیشنهاد بهبود ۱", "پیشنهاد بهبود ۲", "پیشنهاد بهبود ۳"],
  "bestTime": "بهترین زمان پیشنهادی انتشار",
  "verdict": "جمع‌بندی کوتاه یک خطی"
}`;

    const result = await callGemini(prompt);
    if (result) {
      const parsed = tryParse(result.text);
      if (parsed && typeof parsed.score === 'number') {
        return NextResponse.json({ success: true, analysis: parsed, model: result.model });
      }
    }

    // موتور تحلیل داخلی (heuristic) — همیشه خروجی معتبر می‌دهد
    const analysis = analyzeCaption(caption, hasImage);
    return NextResponse.json({ success: true, analysis, model: 'Smart Viral Engine' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در تحلیل' }, { status: 500 });
  }
}

function analyzeCaption(caption: string, hasImage: boolean) {
  let score = 40;
  const strengths: string[] = [];
  const improvements: string[] = [];

  const hashtags = (caption.match(/#/g) || []).length;
  const emojis = (caption.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || []).length;
  const hasCTA = /(کامنت|ذخیره|فالو|لینک|بایو|دایرکت|نظر)/.test(caption);
  const hasQuestion = /\?|؟/.test(caption);
  const len = caption.length;

  if (hashtags >= 8) { score += 15; strengths.push('تعداد هشتگ مناسب برای دیده شدن'); }
  else improvements.push('حداقل ۸ تا ۱۵ هشتگ مرتبط اضافه کنید');

  if (emojis >= 3) { score += 10; strengths.push('استفاده خوب از ایموجی برای جذابیت'); }
  else improvements.push('چند ایموجی مرتبط برای گرم‌تر شدن متن اضافه کنید');

  if (hasCTA) { score += 15; strengths.push('کال تو اکشن قوی دارد'); }
  else improvements.push('یک دعوت به اقدام (کامنت/ذخیره/فالو) اضافه کنید');

  if (hasQuestion) { score += 8; strengths.push('سوال باعث تعامل بیشتر می‌شود'); }
  else improvements.push('یک سوال بپرسید تا کامنت بگیرید');

  if (len > 80 && len < 1500) { score += 7; strengths.push('طول کپشن ایده‌آل است'); }
  else if (len <= 80) improvements.push('کپشن را کمی کامل‌تر کنید');

  if (hasImage) score += 5;

  score = Math.min(98, Math.max(20, score));

  return {
    score,
    strengths: strengths.length ? strengths : ['محتوای پایه آماده است'],
    improvements: improvements.slice(0, 3),
    bestTime: 'دوشنبه ۲۰:۰۰ تا ۲۲:۰۰ (اوج فعالیت مخاطبان)',
    verdict: score >= 75 ? 'پتانسیل بالای اکسپلور دارد! 🚀' : score >= 55 ? 'خوب است، با چند بهبود عالی می‌شود' : 'نیاز به بهینه‌سازی بیشتر دارد',
  };
}

function tryParse(text: string): Record<string, unknown> | null {
  try {
    const clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const s = clean.indexOf('{'); const e = clean.lastIndexOf('}');
    if (s === -1 || e === -1) return null;
    return JSON.parse(clean.slice(s, e + 1));
  } catch { return null; }
}
