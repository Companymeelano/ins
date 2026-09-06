import { db } from '@/db';
import { auditLogs, abEvents } from '@/db/schema';

// ثبت audit (fire-and-forget، بدون بلاک کردن request)
export function audit(action: string, opts?: { actor?: string; category?: string; detail?: string; meta?: Record<string, unknown> }) {
  db.insert(auditLogs).values({
    actor: opts?.actor || 'system',
    action,
    category: opts?.category || 'general',
    detail: opts?.detail || null,
    meta: opts?.meta || {},
  }).catch((e) => console.error('audit failed', e));
}

// ثبت رویداد A/B
export function abEvent(experiment: string, variant: string, event: string) {
  db.insert(abEvents).values({ experiment, variant, event }).catch(() => {});
}

// structured log ساده
export function log(level: 'info' | 'warn' | 'error', msg: string, meta?: Record<string, unknown>) {
  const entry = { ts: new Date().toISOString(), level, msg, ...meta };
  if (level === 'error') console.error(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}
