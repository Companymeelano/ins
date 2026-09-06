import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { alerts, tunnels } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const list = await db.select().from(alerts).orderBy(desc(alerts.createdAt)).limit(30);
    const unread = list.filter((a) => !a.read).length;
    return NextResponse.json({ success: true, alerts: list, unread });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const [a] = await db.insert(alerts).values({
      type: body.type || 'info',
      severity: body.severity || 'info',
      title: body.title || 'اعلان',
      message: body.message || null,
    }).returning();
    return NextResponse.json({ success: true, alert: a });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

// علامت خوانده‌شده
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.markAll) await db.update(alerts).set({ read: true });
    else if (body.id) await db.update(alerts).set({ read: true }).where(eq(alerts.id, Number(body.id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}
