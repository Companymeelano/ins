import { NextRequest, NextResponse } from 'next/server';
import { callGemini, validateInput } from '@/lib/ai';

// دستیار پاسخ به کامنت — تولید ۳ پاسخ حرفه‌ای و دوستانه
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const v = validateInput(body.comment, 'کامنت');
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
    const comment = v.value;
    const tone = typeof body.tone === 'string' ? body.tone : 'دوستانه';

    const prompt = `تو مدیر پیج اینستاگرام هستی. برای کامنت زیر ۳ پاسخ کوتاه، ${tone} و حرفه‌ای به فارسی بنویس که تعامل را حفظ کند و با ایموجی مناسب باشد.
کامنت: "${comment}"
فقط ۳ پاسخ را در خطوط جدا بنویس، بدون شماره و توضیح.`;

    const result = await callGemini(prompt);
    if (result) {
      const replies = result.text.split('\n').map((l) => l.replace(/^[\d.\-*)\s]+/, '').trim()).filter(Boolean).slice(0, 3);
      if (replies.length) return NextResponse.json({ success: true, replies, model: result.model });
    }

    // fallback
    const replies = [
      `ممنون از پیام قشنگت 🙏 خوشحالیم که همراهمونی! 💜`,
      `سلام و درود 🌟 حتماً پیگیر درخواستت هستیم، برامون دایرکت بفرست 📩`,
      `چه لطف داری 😍 نظرت برامون خیلی ارزشمنده، منتظر کامنت‌های بعدیت هستیم 🔥`,
    ];
    return NextResponse.json({ success: true, replies, model: 'Smart Reply Engine' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در تولید پاسخ' }, { status: 500 });
  }
}
