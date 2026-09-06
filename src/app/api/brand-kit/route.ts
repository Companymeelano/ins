import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { brandKits } from '@/db/schema';
import { eq } from 'drizzle-orm';

const HANDLE = 'default';

export async function GET() {
  try {
    let [kit] = await db.select().from(brandKits).where(eq(brandKits.pageHandle, HANDLE));
    if (!kit) {
      [kit] = await db.insert(brandKits).values({ pageHandle: HANDLE, brandName: '', brandVoice: 'دوستانه', visualStyle: 'cinematic' }).returning();
    }
    return NextResponse.json({ success: true, brandKit: kit });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const fields = ['brandName', 'industry', 'audience', 'brandVoice', 'visualStyle', 'primaryColor', 'secondaryColor', 'ctaStyle', 'forbiddenWords', 'keywords'] as const;
    const update: Record<string, unknown> = { updatedAt: new Date() };
    for (const f of fields) if (body[f] !== undefined) update[f] = body[f];

    let [kit] = await db.select().from(brandKits).where(eq(brandKits.pageHandle, HANDLE));
    if (!kit) [kit] = await db.insert(brandKits).values({ pageHandle: HANDLE }).returning();
    const [updated] = await db.update(brandKits).set(update).where(eq(brandKits.id, kit.id)).returning();
    return NextResponse.json({ success: true, brandKit: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}
