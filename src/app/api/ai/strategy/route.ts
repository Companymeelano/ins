import { NextResponse } from 'next/server';
import { db } from '@/db';
import { aiFeedback, calendarItems } from '@/db/schema';
import { route } from '@/lib/ai-router';
import { getBrandContext } from '@/lib/brand';

// گزارش استراتژی هفتگی خودکار — baseline آماری + تفسیر AI
export async function GET() {
  try {
    // سیگنال‌های واقعی از دیتابیس
    const [feedback, calendar] = await Promise.all([
      db.select().from(aiFeedback),
      db.select().from(calendarItems),
    ]);

    const published = calendar.filter((c) => c.status === 'published').length;
    const scheduled = calendar.filter((c) => c.status === 'scheduled').length;
    const byKind = { post: calendar.filter((c) => c.kind === 'post').length, story: calendar.filter((c) => c.kind === 'story').length, reel: calendar.filter((c) => c.kind === 'reel').length };
    const satisfaction = feedback.length ? Math.round((feedback.filter((f) => f.rating === 'good').length / feedback.length) * 100) : 0;

    // baseline deterministic
    const worked: string[] = [];
    const improve: string[] = [];
    if (byKind.reel > byKind.post) worked.push('ریلزها بیشترین حجم تولید را داشتند — روند خوبی است');
    else improve.push('تعداد ریلز را افزایش دهید (ریچ بالاتر از پست)');
    if (satisfaction >= 70) worked.push(`رضایت از محتوای AI بالا بود (${satisfaction}٪)`);
    else if (feedback.length) improve.push('کیفیت prompt‌ها را بهبود دهید (رضایت پایین)');
    if (scheduled > 0) worked.push(`${scheduled} محتوا برای هفته آینده زمان‌بندی شده`);
    else improve.push('برای هفته آینده محتوا زمان‌بندی کنید');

    // برنامه هفته آینده
    const nextWeek = ['شنبه: پست معرفی', 'دوشنبه: ریلز آموزشی/ترند (اوج تعامل)', 'چهارشنبه: استوری تعاملی + نظرسنجی', 'جمعه: پست جمع‌بندی + آفر'];

    // تفسیر AI (اختیاری، روی baseline)
    const brand = await getBrandContext();
    let aiInsight = '';
    const r = await route('analysis', `به‌عنوان استراتژیست محتوا، در ۲ جمله کوتاه فارسی توصیه هفتگی بده. حوزه: ${brand?.industry || 'عمومی'}. آمار: ${published} منتشر، ${byKind.reel} ریلز، رضایت ${satisfaction}٪.`);
    if (r) aiInsight = r.text;

    return NextResponse.json({
      success: true,
      period: 'گزارش استراتژی هفتگی',
      confidence: feedback.length + calendar.length > 5 ? 'متوسط' : 'کم',
      basedOn: 'داده واقعی تقویم و بازخورد + مدل آماری',
      stats: { published, scheduled, byKind, satisfaction },
      whatWorked: worked.length ? worked : ['داده کافی برای تحلیل جمع نشده — محتوای بیشتری تولید کنید'],
      whatToImprove: improve.length ? improve : ['روند فعلی مناسب است 👍'],
      nextWeekPlan: nextWeek,
      aiInsight,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در گزارش' }, { status: 500 });
  }
}
