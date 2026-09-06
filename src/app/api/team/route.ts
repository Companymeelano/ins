import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teamMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const members = await db.select().from(teamMembers).orderBy(teamMembers.createdAt);
    return NextResponse.json({ success: true, members });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name) return NextResponse.json({ error: 'نام الزامی است' }, { status: 400 });
    const colors = ['#ec4899', '#a855f7', '#38bdf8', '#f59e0b', '#10b981'];
    const [m] = await db.insert(teamMembers).values({
      name: String(body.name).trim(),
      email: body.email || null,
      role: body.role || 'editor',
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
    }).returning();
    return NextResponse.json({ success: true, member: m });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = Number(request.nextUrl.searchParams.get('id'));
    await db.delete(teamMembers).where(eq(teamMembers.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}
