import { NextRequest, NextResponse } from 'next/server';
import { callGemini, validateInput } from '@/lib/ai';

// تولید هشتگ هوشمند با ترکیب حجم بالا/متوسط/نیچ برای اکسپلور بهتر
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const v = validateInput(body.topic, 'موضوع');
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
    const topic = v.value;

    const prompt = `برای موضوع «${topic}» در اینستاگرام فارسی، ۳۰ هشتگ بهینه پیشنهاد بده که ترکیبی از هشتگ‌های پرمخاطب، متوسط و تخصصی (نیچ) باشند تا شانس اکسپلور بالا برود. فقط هشتگ‌ها را با فاصله و علامت # بنویس، بدون توضیح.`;

    const result = await callGemini(prompt);
    if (result) {
      const tags = result.text.match(/#[^\s#]+/g);
      if (tags && tags.length) return NextResponse.json({ success: true, hashtags: tags.slice(0, 30), model: result.model });
    }

    // fallback هوشمند
    const base = topic.replace(/\s+/g, '_');
    const popular = ['اکسپلور', 'ترند', 'وایرال', 'ایران', 'تهران', 'فالو', 'لایک', 'پیج_برتر'];
    const medium = ['محتوای_جذاب', 'پست_روز', 'بهترین', 'کیفیت', 'خلاقیت', 'الهام', 'ایده'];
    const niche = [base, `${base}_ایران`, `${base}_حرفه‌ای`, `عاشقان_${base}`, `دنیای_${base}`];
    const hashtags = [...popular, ...medium, ...niche].slice(0, 30).map((t) => `#${t}`);
    return NextResponse.json({ success: true, hashtags, model: 'Smart Hashtag Engine' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در تولید هشتگ' }, { status: 500 });
  }
}
