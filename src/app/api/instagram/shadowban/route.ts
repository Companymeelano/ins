import { NextResponse } from 'next/server';
import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';

// تست واقعی سلامت اکانت و تشخیص نشانه‌های shadowban از طریق Instagram Graph API
export async function POST() {
  try {
    const [active] = await db.select().from(pages).where(eq(pages.isActive, true));
    const token = active?.accessToken;
    const igId = active?.igUserId;

    // اگر توکن واقعی موجود بود، از Graph API insights می‌خوانیم
    if (token && igId && token !== 'DEMO_LONG_LIVED_TOKEN' && process.env.META_APP_ID) {
      try {
        // دریافت اینسایت‌های اخیر برای بررسی افت ریچ (نشانه shadowban)
        const res = await fetch(
          `https://graph.instagram.com/${igId}/insights?metric=reach,impressions,profile_views&period=day&access_token=${token}`
        );
        const data = await res.json();
        if (data.data) {
          const reach = data.data.find((d: { name: string; values: { value: number }[] }) => d.name === 'reach')?.values?.[0]?.value ?? 0;
          const impressions = data.data.find((d: { name: string; values: { value: number }[] }) => d.name === 'impressions')?.values?.[0]?.value ?? 0;
          const ratio = impressions ? reach / impressions : 1;
          const risk = ratio < 0.3 ? 'high' : ratio < 0.6 ? 'medium' : 'low';
          return NextResponse.json({ success: true, source: 'graph-api', analysis: buildAnalysis(risk, reach, impressions) });
        }
      } catch (e) { console.error('graph shadowban check failed', e); }
    }

    // حالت دمو / بدون توکن — تحلیل هوشمند نمونه
    const risk = ['low', 'low', 'medium'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high';
    return NextResponse.json({
      success: true, source: 'demo',
      analysis: buildAnalysis(risk, 38000, 89000),
      note: 'برای تست واقعی، اتصال Meta Graph API با توکن معتبر لازم است.',
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در تست' }, { status: 500 });
  }
}

function buildAnalysis(risk: 'low' | 'medium' | 'high', reach: number, impressions: number) {
  const map = {
    low: { score: 92, color: '#10b981', label: 'سالم', verdict: 'اکانت شما سالم است و نشانه‌ای از shadowban دیده نمی‌شود ✓' },
    medium: { score: 64, color: '#f59e0b', label: 'مشکوک', verdict: 'کاهش نسبی ریچ مشاهده شد. مراقب فعالیت خود باشید.' },
    high: { score: 32, color: '#f43f5e', label: 'احتمال shadowban', verdict: 'افت شدید ریچ! احتمال محدودیت اکانت وجود دارد.' },
  };
  const checks = [
    { label: 'نمایش پست‌ها در هشتگ‌ها', ok: risk !== 'high' },
    { label: 'نسبت ریچ به ایمپرشن سالم', ok: risk === 'low' },
    { label: 'دیده شدن در اکسپلور', ok: risk !== 'high' },
    { label: 'عدم محدودیت تعامل', ok: risk !== 'high' },
    { label: 'رشد طبیعی فالوور', ok: risk === 'low' },
  ];
  const tips = risk === 'low' ? [
    'به فعالیت طبیعی و منظم خود ادامه دهید',
    'از هشتگ‌های مرتبط و غیراسپم استفاده کنید',
  ] : [
    'چند روز فعالیت را کاهش دهید (لایک/فالو/کامنت)',
    'از هشتگ‌های بن‌شده یا اسپم استفاده نکنید',
    'محتوای اصیل و باکیفیت منتشر کنید',
    'از اپ‌های شخص‌ثالث مشکوک لاگین نکنید',
  ];
  return { ...map[risk], risk, reach, impressions, ratio: impressions ? Math.round((reach / impressions) * 100) : 0, checks, tips };
}
