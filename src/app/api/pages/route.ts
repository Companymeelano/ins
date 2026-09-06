import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const list = await db.select().from(pages).orderBy(pages.createdAt);
    return NextResponse.json({ success: true, pages: list, connected: list.some((p) => p.connected) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // افزودن پیج دستی (دمو)
    const [p] = await db.insert(pages).values({
      handle: body.handle || '@new_page',
      displayName: body.displayName || 'پیج جدید',
      avatarColor: body.avatarColor || '#a855f7',
      followers: body.followers || 0,
      connected: true,
      isActive: false,
    }).returning();
    return NextResponse.json({ success: true, page: p });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

// تعویض پیج فعال
export async function PATCH(request: NextRequest) {
  try {
    const { id } = await request.json();
    await db.update(pages).set({ isActive: false });
    await db.update(pages).set({ isActive: true }).where(eq(pages.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = Number(request.nextUrl.searchParams.get('id'));
    await db.delete(pages).where(eq(pages.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}
