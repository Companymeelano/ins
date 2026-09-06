import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { activitySchedules } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ensureBootstrap, SAFE_LIMITS } from '@/lib/bootstrap';

export async function GET() {
  try {
    await ensureBootstrap();
    const list = await db.select().from(activitySchedules);
    return NextResponse.json({ success: true, schedules: list, limits: SAFE_LIMITS });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const id = Number(body.id);
    if (!id) return NextResponse.json({ error: 'شناسه نامعتبر' }, { status: 400 });

    const [current] = await db.select().from(activitySchedules).where(eq(activitySchedules.id, id));
    if (!current) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 });

    const limit = SAFE_LIMITS[current.actionType];
    const update: Record<string, unknown> = {};
    if (body.enabled !== undefined) update.enabled = !!body.enabled;
    if (body.dailyLimit !== undefined) {
      // اعمال سقف ایمن — جلوگیری از تنظیم خطرناک
      update.dailyLimit = Math.min(Number(body.dailyLimit), limit?.max ?? 300);
    }
    if (body.intervalMin !== undefined) update.intervalMin = Math.max(Number(body.intervalMin), 3);
    if (body.activeHoursStart !== undefined) update.activeHoursStart = Number(body.activeHoursStart);
    if (body.activeHoursEnd !== undefined) update.activeHoursEnd = Number(body.activeHoursEnd);

    const [updated] = await db.update(activitySchedules).set(update).where(eq(activitySchedules.id, id)).returning();

    // هشدار اگر نزدیک سقف باشد
    const warning = limit && (updated.dailyLimit ?? 0) > limit.recommended
      ? `⚠️ مقدار بالاتر از حد توصیه‌شده (${limit.recommended}) است و ریسک محدودیت را افزایش می‌دهد.`
      : null;

    return NextResponse.json({ success: true, schedule: updated, warning });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}
