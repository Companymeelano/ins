import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { auditLogs, featureFlags, abEvents } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { getUserByToken } from '@/lib/auth';
import { invalidateFlags } from '@/lib/flags';

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('milano_token')?.value || '';
  const user = await getUserByToken(token);
  return user?.role === 'admin' ? user : null;
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'دسترسی فقط برای مدیر' }, { status: 403 });

  const [logs, flags, abStats] = await Promise.all([
    db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(30),
    db.select().from(featureFlags),
    db.select({ variant: abEvents.variant, event: abEvents.event, count: sql<number>`count(*)::int` }).from(abEvents).groupBy(abEvents.variant, abEvents.event),
  ]);

  return NextResponse.json({ success: true, logs, flags, abStats });
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'دسترسی فقط برای مدیر' }, { status: 403 });

  const body = await request.json();
  if (body.flagKey) {
    await db.update(featureFlags).set({ enabled: !!body.enabled }).where(eq(featureFlags.key, body.flagKey));
    invalidateFlags();
  }
  return NextResponse.json({ success: true });
}
