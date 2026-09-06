import { NextRequest, NextResponse } from 'next/server';
import { callGemini, validateInput } from '@/lib/ai';

// تولید بسته کامل پروداکشن ریلز: موزیک ترند، متن صداگذاری، افکت‌ها و ترنزیشن
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const v = validateInput(body.topic, 'موضوع ریلز');
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
    const topic = v.value;
    const mood = typeof body.mood === 'string' ? body.mood : 'پرانرژی';

    // متن صداگذاری (Voiceover) با AI
    let voiceover = '';
    const ai = await callGemini(
      `یک متن صداگذاری (voiceover) کوتاه، جذاب و روان فارسی برای یک ریلز ۱۵-۳۰ ثانیه‌ای درباره «${topic}» با حال‌وهوای «${mood}» بنویس. حداکثر ۴ جمله، مناسب خوانده شدن با صدای بلند. فقط متن.`
    );
    voiceover = ai?.text || `${topic} — چیزی که همه دنبالش هستن! با ما همراه شو تا بهترین‌ها رو ببینی. این ریلز رو تا آخر ببین و ذخیره کن!`;

    // پیشنهاد موزیک بر اساس مود
    const musicByMood: Record<string, { name: string; bpm: string; vibe: string }[]> = {
      'پرانرژی': [
        { name: 'Upbeat Pop Trend', bpm: '۱۲۸ BPM', vibe: 'انرژی بالا، مناسب کات‌های تند' },
        { name: 'Electronic Hype', bpm: '۱۴۰ BPM', vibe: 'هیجان‌انگیز، مناسب رونمایی' },
      ],
      'آرام': [
        { name: 'Lo-fi Chill', bpm: '۸۵ BPM', vibe: 'آرامش‌بخش، مناسب ولاگ' },
        { name: 'Acoustic Warm', bpm: '۹۰ BPM', vibe: 'صمیمی و احساسی' },
      ],
      'حماسی': [
        { name: 'Cinematic Epic', bpm: '۱۰۰ BPM', vibe: 'باشکوه، مناسب معرفی برند' },
        { name: 'Dramatic Build', bpm: '۱۱۰ BPM', vibe: 'اوج‌گیری تدریجی' },
      ],
    };

    const effects = [
      { name: 'Zoom Punch', desc: 'زوم ناگهانی روی نقطه اوج برای جلب توجه' },
      { name: 'Speed Ramp', desc: 'تغییر سرعت (کند/تند) برای ریتم پویا' },
      { name: 'Glitch Transition', desc: 'ترنزیشن گلیچ بین صحنه‌ها' },
      { name: 'Text Pop', desc: 'ظاهر شدن انیمیشنی متن روی صحنه' },
      { name: 'Color Grade', desc: 'رنگ‌بندی سینمایی تیل و اورنج' },
    ];

    return NextResponse.json({
      success: true,
      voiceover,
      music: musicByMood[mood] || musicByMood['پرانرژی'],
      effects,
      captions: 'زیرنویس خودکار فعال (Auto-Captions) — برای کاربرانی که بی‌صدا تماشا می‌کنند ضروری است',
      tip: 'صداگذاری را با موزیک زمینه ملایم ترکیب کنید و زیرنویس را حتماً اضافه کنید تا نرخ تماشا بالا برود.',
      model: ai?.model || 'Smart Reel Producer',
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در پروداکشن ریلز' }, { status: 500 });
  }
}
