import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const list = await db.select().from(projects).orderBy(desc(projects.createdAt)).limit(50);
    return NextResponse.json({ success: true, projects: list });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در دریافت پروژه‌ها' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const [created] = await db.insert(projects).values({
      username: body.username || 'demo_creator',
      kind: body.kind || 'post',
      title: body.title || null,
      caption: body.caption || null,
      imageUrl: body.imageUrl || null,
      scenario: body.scenario || {},
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
      status: body.status || 'draft',
      viralScore: typeof body.viralScore === 'number' ? body.viralScore : 0,
    }).returning();
    return NextResponse.json({ success: true, project: created });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در ذخیره پروژه' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = Number(request.nextUrl.searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'شناسه نامعتبر' }, { status: 400 });
    await db.delete(projects).where(eq(projects.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در حذف پروژه' }, { status: 500 });
  }
}
