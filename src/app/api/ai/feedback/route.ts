import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { aiFeedback } from '@/db/schema';
import { desc, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const [f] = await db.insert(aiFeedback).values({
      kind: body.kind || 'caption',
      promptVersion: body.promptVersion || null,
      rating: body.rating || 'good', // good, bad, needs_edit
      reason: body.reason || null,
      score: typeof body.score === 'number' ? body.score : 0,
    }).returning();
    return NextResponse.json({ success: true, feedback: f });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const recent = await db.select().from(aiFeedback).orderBy(desc(aiFeedback.createdAt)).limit(100);
    // آمار تجمیعی برای بهبود
    const total = recent.length;
    const good = recent.filter((f) => f.rating === 'good').length;
    const bad = recent.filter((f) => f.rating === 'bad').length;
    const needsEdit = recent.filter((f) => f.rating === 'needs_edit').length;
    return NextResponse.json({ success: true, stats: { total, good, bad, needsEdit, satisfaction: total ? Math.round((good / total) * 100) : 0 }, recent: recent.slice(0, 20) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}
