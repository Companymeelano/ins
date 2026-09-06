import { NextRequest, NextResponse } from 'next/server';
import { callGemini, validateInput } from '@/lib/ai';

// دستیار سناریوی ریلز — تولید کامل هوک، سناریوی صحنه‌به‌صحنه، موزیک و هشتگ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const v = validateInput(body.topic, 'موضوع ریلز');
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

    const topic = v.value;
    const templateType = typeof body.templateType === 'string' ? body.templateType : 'عمومی';
    const duration = typeof body.duration === 'string' ? body.duration : '۱۵ ثانیه';

    const prompt = `تو یک کارگردان و استراتژیست محتوای ریلز اینستاگرام هستی.
برای موضوع «${topic}» با قالب «${templateType}» و مدت «${duration}» یک سناریوی کامل ریلز به فارسی بنویس.
خروجی را دقیقاً در قالب JSON معتبر و بدون هیچ متن اضافه بده:
{
  "hook": "یک جمله قلاب فوق‌العاده جذاب برای ۳ ثانیه اول",
  "scenes": ["صحنه ۱ با بازه زمانی و توضیح", "صحنه ۲ ...", "صحنه ۳ ...", "صحنه پایانی با کال تو اکشن"],
  "music": "پیشنهاد نوع موزیک/ترک ترند مناسب",
  "onScreenText": ["متن روی صحنه ۱", "متن روی صحنه ۲"],
  "hashtags": ["هشتگ۱", "هشتگ۲", "..."],
  "tip": "یک نکته حرفه‌ای برای وایرال شدن"
}`;

    const result = await callGemini(prompt);
    if (result) {
      const parsed = tryParseJson(result.text);
      if (parsed) {
        return NextResponse.json({ success: true, scenario: parsed, model: result.model });
      }
    }

    // fallback هوشمند
    const scenario = {
      hook: `${topic} — چیزی که نباید از دستش بدی! 🔥`,
      scenes: [
        `۰-۳ ثانیه: نمای قلاب قوی درباره «${topic}» با متن درشت روی تصویر`,
        `۳-۸ ثانیه: نمایش سریع و ریتمیک نکات اصلی با کات‌های تند`,
        `۸-${duration === '۱۵ ثانیه' ? '۱۲' : '۱۶'} ثانیه: نمایش نتیجه یا لحظه اوج`,
        `پایان: کال تو اکشن — دعوت به فالو، ذخیره و کامنت`,
      ],
      music: 'ترک ترند پرانرژی با تمپو متوسط (از تب موزیک اینستاگرام انتخاب کن)',
      onScreenText: [`${topic}؟`, 'تا آخر ببین! 👀'],
      hashtags: ['ریلز', 'ریلز_ترند', 'اکسپلور', 'وایرال', 'ترند_روز', topic.replace(/\s+/g, '_')].map((h) => `#${h}`),
      tip: 'سه ثانیه اول تعیین‌کننده است. با یک قلاب قوی مخاطب را متوقف کن و از موزیک ترند روز استفاده کن.',
    };

    return NextResponse.json({
      success: true, scenario, model: 'Smart Reel Director',
      note: process.env.GEMINI_API_KEY ? 'Gemini در دسترس نبود، موتور داخلی فعال شد' : 'برای خروجی هوشمندتر GEMINI_API_KEY را تنظیم کنید',
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در تولید سناریوی ریلز' }, { status: 500 });
  }
}

function tryParseJson(text: string): Record<string, unknown> | null {
  try {
    const clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    return JSON.parse(clean.slice(start, end + 1));
  } catch {
    return null;
  }
}
