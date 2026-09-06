import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { calendarItems } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const items = await db.select().from(calendarItems).orderBy(calendarItems.dayIndex);
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title) return NextResponse.json({ error: 'عنوان الزامی است' }, { status: 400 });
    const colorByKind: Record<string, string> = { post: '#a855f7', story: '#ec4899', reel: '#f59e0b' };
    const [item] = await db.insert(calendarItems).values({
      title: String(body.title).trim(),
      kind: body.kind || 'post',
      status: body.status || 'draft',
      dayIndex: Number(body.dayIndex) || 0,
      time: body.time || '۲۰:۰۰',
      color: colorByKind[body.kind] || '#a855f7',
      caption: body.caption || null,
    }).returning();
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

// آپدیت (drag & drop روز جدید یا تغییر وضعیت)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const id = Number(body.id);
    if (!id) return NextResponse.json({ error: 'شناسه نامعتبر' }, { status: 400 });
    const update: Record<string, unknown> = {};
    if (body.dayIndex !== undefined) update.dayIndex = Number(body.dayIndex);
    if (body.status) update.status = body.status;
    if (body.time) update.time = body.time;
    const [item] = await db.update(calendarItems).set(update).where(eq(calendarItems.id, id)).returning();
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = Number(request.nextUrl.searchParams.get('id'));
    await db.delete(calendarItems).where(eq(calendarItems.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}
