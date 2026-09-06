import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { proxies, rotationLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸', DE: '🇩🇪', NL: '🇳🇱', FR: '🇫🇷', GB: '🇬🇧', TR: '🇹🇷', AE: '🇦🇪',
  CA: '🇨🇦', SE: '🇸🇪', FI: '🇫🇮', SG: '🇸🇬', JP: '🇯🇵', RU: '🇷🇺',
};

export async function GET() {
  try {
    const list = await db.select().from(proxies).orderBy(proxies.ping);
    return NextResponse.json({ success: true, proxies: list });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // ورودی می‌تواند تکی یا لیستی (bulk) باشد
    const rows = Array.isArray(body.list) ? body.list : [body];
    const inserted = [];
    for (const r of rows) {
      if (!r.host || !r.port) continue;
      const country = (r.country || 'US').toUpperCase();
      const [p] = await db.insert(proxies).values({
        label: r.label || `${r.host}:${r.port}`,
        type: r.type || 'http',
        host: String(r.host).trim(),
        port: Number(r.port),
        country,
        countryFlag: COUNTRY_FLAGS[country] || '🌐',
        provider: r.provider || 'manual',
        status: 'unknown',
      }).returning();
      inserted.push(p);
    }
    return NextResponse.json({ success: true, inserted });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در افزودن پروکسی' }, { status: 500 });
  }
}

// فعال‌سازی/چرخش پروکسی
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.activate) {
      await db.update(proxies).set({ active: false });
      const [p] = await db.update(proxies).set({ active: true }).where(eq(proxies.id, Number(body.activate))).returning();
      // ثبت لاگ چرخش
      if (p) await db.insert(rotationLogs).values({ kind: 'proxy', label: `${p.host}:${p.port}`, country: p.country, ping: p.ping ?? 0, reason: body.reason || 'manual', ip: p.host });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = Number(request.nextUrl.searchParams.get('id'));
    if (request.nextUrl.searchParams.get('all') === '1') {
      await db.delete(proxies);
      return NextResponse.json({ success: true });
    }
    await db.delete(proxies).where(eq(proxies.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}
