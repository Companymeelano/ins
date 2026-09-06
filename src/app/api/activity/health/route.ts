import { NextResponse } from 'next/server';
import { db } from '@/db';
import { activitySchedules, proxies, tunnels } from '@/db/schema';

// امتیاز سلامت و ریسک بن اکانت بر اساس تنظیمات فعلی
export async function GET() {
  try {
    const [schedules, proxyList, tunnelList] = await Promise.all([
      db.select().from(activitySchedules),
      db.select().from(proxies),
      db.select().from(tunnels),
    ]);

    let score = 100;
    const risks: string[] = [];
    const tips: string[] = [];

    // بررسی محدودیت‌های فعالیت
    const SAFE: Record<string, number> = { engage_likes: 150, follow_reminder: 40, comment_reminder: 20, unfollow_review: 50 };
    for (const s of schedules) {
      if (s.enabled) {
        const rec = SAFE[s.actionType] ?? 50;
        if ((s.dailyLimit ?? 0) > rec) { score -= 12; risks.push(`سقف روزانه «${labelFor(s.actionType)}» بالاتر از حد امن است`); }
        if ((s.intervalMin ?? 0) < 5) { score -= 8; risks.push('فاصله بین اقدامات خیلی کم است (ریسک رفتار رباتیک)'); }
      }
    }

    // پروکسی و تونل
    const greenProxies = proxyList.filter((p) => p.status === 'green').length;
    if (proxyList.length === 0) tips.push('برای امنیت بیشتر، چند پروکسی سبز اضافه کنید');
    else if (greenProxies === 0) { score -= 10; risks.push('هیچ پروکسی سالمی موجود نیست'); }

    const activeTunnel = tunnelList.find((t) => t.active);
    if (tunnelList.length > 0 && !activeTunnel) tips.push('یک سرویس اتصال (V2Ray/SOCKS) را فعال کنید');

    // چرخش IP
    if (proxyList.length < 3 && proxyList.length > 0) tips.push('حداقل ۳ پروکسی از کشورهای مختلف برای چرخش امن داشته باشید');

    score = Math.max(20, Math.min(100, score));
    const level = score >= 80 ? 'امن' : score >= 55 ? 'متوسط' : 'پرریسک';
    const color = score >= 80 ? '#10b981' : score >= 55 ? '#f59e0b' : '#f43f5e';

    if (!tips.length) tips.push('تنظیمات شما در محدوده امن است 👍');

    return NextResponse.json({
      success: true,
      score, level, color,
      risks: risks.length ? risks : ['ریسک قابل‌توجهی شناسایی نشد'],
      tips,
      stats: { totalProxies: proxyList.length, greenProxies, tunnels: tunnelList.length, activeTunnel: activeTunnel?.label || null },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

function labelFor(a: string): string {
  return ({ engage_likes: 'لایک', follow_reminder: 'فالو', comment_reminder: 'کامنت', unfollow_review: 'آنفالو' } as Record<string, string>)[a] || a;
}
