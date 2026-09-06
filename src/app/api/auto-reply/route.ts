import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { autoReplies } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const rules = await db.select().from(autoReplies).orderBy(desc(autoReplies.createdAt)).limit(50);
    return NextResponse.json({ success: true, rules });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در دریافت قوانین' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.keyword || !body.reply) return NextResponse.json({ error: 'کلمه کلیدی و پاسخ الزامی است' }, { status: 400 });
    const [rule] = await db.insert(autoReplies).values({
      username: body.username || 'demo_creator',
      keyword: String(body.keyword).trim(),
      reply: String(body.reply).trim(),
      enabled: body.enabled !== false,
    }).returning();
    return NextResponse.json({ success: true, rule });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در ذخیره قانون' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = Number(request.nextUrl.searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'شناسه نامعتبر' }, { status: 400 });
    await db.delete(autoReplies).where(eq(autoReplies.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در حذف' }, { status: 500 });
  }
}
