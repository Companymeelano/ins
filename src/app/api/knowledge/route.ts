import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { knowledgeBase } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ensureBootstrap } from '@/lib/bootstrap';

export async function GET() {
  try {
    await ensureBootstrap();
    const items = await db.select().from(knowledgeBase).orderBy(knowledgeBase.category);
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.question || !body.answer) return NextResponse.json({ error: 'سوال و پاسخ الزامی است' }, { status: 400 });
    const [item] = await db.insert(knowledgeBase).values({
      category: body.category || 'عمومی',
      question: String(body.question).trim(),
      answer: String(body.answer).trim(),
      keywords: body.keywords || null,
    }).returning();
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = Number(request.nextUrl.searchParams.get('id'));
    await db.delete(knowledgeBase).where(eq(knowledgeBase.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}
