import { db } from '@/db';
import { jobs } from '@/db/schema';
import { eq } from 'drizzle-orm';

// صف کار سبک مبتنی بر دیتابیس (بدون نیاز به Redis)
// کاربر 202 می‌گیرد، worker در پس‌زمینه پردازش می‌کند، کلاینت polling می‌کند.

export type JobType = 'image' | 'caption' | 'reel' | 'analysis';
type Handler = (payload: Record<string, unknown>) => Promise<Record<string, unknown>>;

const handlers = new Map<JobType, Handler>();
export function registerHandler(type: JobType, fn: Handler) { handlers.set(type, fn); }

export async function enqueue(type: JobType, payload: Record<string, unknown>): Promise<number> {
  const [job] = await db.insert(jobs).values({ type, status: 'queued', payload }).returning();
  // پردازش غیرمسدودکننده در پس‌زمینه
  processJob(job.id).catch((e) => console.error('job process error', e));
  return job.id;
}

async function processJob(id: number) {
  const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
  if (!job || job.status !== 'queued') return;
  await db.update(jobs).set({ status: 'processing', attempts: (job.attempts ?? 0) + 1 }).where(eq(jobs.id, id));

  const handler = handlers.get(job.type as JobType);
  if (!handler) {
    await db.update(jobs).set({ status: 'failed', error: 'handler یافت نشد' }).where(eq(jobs.id, id));
    return;
  }
  try {
    const result = await handler((job.payload as Record<string, unknown>) || {});
    await db.update(jobs).set({ status: 'done', result, completedAt: new Date() }).where(eq(jobs.id, id));
  } catch (e) {
    await db.update(jobs).set({ status: 'failed', error: e instanceof Error ? e.message : 'خطای نامشخص', completedAt: new Date() }).where(eq(jobs.id, id));
  }
}

export async function getJob(id: number) {
  const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
  return job || null;
}
