import { NextResponse } from 'next/server';
import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';

// پیشنهاد بهترین کشور پروکسی بر اساس موقعیت جغرافیایی مخاطبان پیج
export async function GET() {
  try {
    const [active] = await db.select().from(pages).where(eq(pages.isActive, true));
    const token = active?.accessToken;
    const igId = active?.igUserId;

    let audienceCountries: { country: string; percent: number }[] = [];

    if (token && igId && token !== 'DEMO_LONG_LIVED_TOKEN' && process.env.META_APP_ID) {
      try {
        const res = await fetch(
          `https://graph.instagram.com/${igId}/insights?metric=audience_country&period=lifetime&access_token=${token}`
        );
        const data = await res.json();
        const values = data?.data?.[0]?.values?.[0]?.value;
        if (values) {
          const total = Object.values(values).reduce((a: number, b) => a + (b as number), 0) as number;
          audienceCountries = Object.entries(values)
            .map(([c, v]) => ({ country: c, percent: Math.round(((v as number) / total) * 100) }))
            .sort((a, b) => b.percent - a.percent).slice(0, 5);
        }
      } catch (e) { console.error(e); }
    }

    if (!audienceCountries.length) {
      // دمو — توزیع نمونه مخاطبان
      audienceCountries = [
        { country: 'IR', percent: 62 },
        { country: 'AE', percent: 14 },
        { country: 'TR', percent: 9 },
        { country: 'DE', percent: 8 },
        { country: 'US', percent: 7 },
      ];
    }

    const flags: Record<string, string> = { IR: '🇮🇷', AE: '🇦🇪', TR: '🇹🇷', DE: '🇩🇪', US: '🇺🇸', GB: '🇬🇧', NL: '🇳🇱', FR: '🇫🇷', CA: '🇨🇦', SE: '🇸🇪' };

    // منطق پیشنهاد: برای طبیعی جلوه دادن، پروکسی نزدیک به بیشترین مخاطب بهتر است
    // اما چون IR فیلتر است، بهترین گزینه‌های عملی: کشور همسایه با مخاطب بالا یا کشور دوم
    const top = audienceCountries[0];
    const practical = audienceCountries.filter((c) => c.country !== 'IR');
    const recommended = top.country === 'IR' ? (practical[0] || { country: 'DE', percent: 0 }) : top;

    return NextResponse.json({
      success: true,
      audienceCountries: audienceCountries.map((c) => ({ ...c, flag: flags[c.country] || '🌐' })),
      recommended: { ...recommended, flag: flags[recommended.country] || '🌐' },
      reasoning: top.country === 'IR'
        ? `بیشترین مخاطب شما از ایران است، اما به دلیل فیلترینگ، پروکسی «${recommended.country}» (دومین کشور مخاطبان) طبیعی‌ترین و امن‌ترین گزینه برای لاگین است.`
        : `پروکسی از کشور «${recommended.country}» با بیشترین مخاطب شما هماهنگ است و لاگین را طبیعی‌تر نشان می‌دهد.`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}
