import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { rotationLogs } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const logs = await db.select().from(rotationLogs).orderBy(desc(rotationLogs.createdAt)).limit(50);
    // تحلیل الگو: تعداد چرخش‌ها در ۲۴ ساعت اخیر
    const now = Date.now();
    const last24 = logs.filter((l) => l.createdAt && now - new Date(l.createdAt).getTime() < 86400000);
    const countries = Array.from(new Set(logs.map((l) => l.country).filter(Boolean)));
    const avgPing = logs.length ? Math.round(logs.reduce((a, l) => a + (l.ping ?? 0), 0) / logs.length) : 0;
    // ارزیابی امنیت الگو
    let patternScore = 100;
    if (last24.length > 24) patternScore -= 30; // چرخش بیش از حد = رفتار مشکوک
    if (countries.length < 2 && logs.length > 5) patternScore -= 15; // تنوع کم کشور
    patternScore = Math.max(30, patternScore);

    return NextResponse.json({
      success: true, logs,
      insights: { last24: last24.length, countries: countries.length, avgPing, patternScore,
        advice: patternScore >= 80 ? 'الگوی چرخش شما امن و طبیعی است ✓' : last24.length > 24 ? 'چرخش بیش از حد در ۲۴ ساعت — ریسک تشخیص رباتیک' : 'تنوع کشور را افزایش دهید' },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const [log] = await db.insert(rotationLogs).values({
      kind: body.kind || 'proxy',
      label: body.label || null,
      country: body.country || null,
      ping: body.ping || 0,
      reason: body.reason || 'manual',
      ip: body.ip || null,
    }).returning();
    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}
