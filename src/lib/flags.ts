import { db } from '@/db';
import { featureFlags } from '@/db/schema';

export const DEFAULT_FLAGS: Record<string, { enabled: boolean; description: string }> = {
  demo_mode: { enabled: true, description: 'حالت دمو (بدون API واقعی)' },
  ai_self_consistency: { enabled: true, description: 'تولید چند خروجی و انتخاب بهترین' },
  ai_moderation: { enabled: true, description: 'بررسی محتوای خطرناک' },
  experimental_prompts: { enabled: false, description: 'templateهای آزمایشی prompt' },
  beta_tools: { enabled: false, description: 'ابزارهای بتا' },
};

let cache: Record<string, boolean> | null = null;
let cacheAt = 0;

export async function ensureFlags() {
  for (const [key, cfg] of Object.entries(DEFAULT_FLAGS)) {
    await db.insert(featureFlags).values({ key, enabled: cfg.enabled, description: cfg.description }).onConflictDoNothing({ target: featureFlags.key });
  }
}

export async function getFlags(): Promise<Record<string, boolean>> {
  if (cache && Date.now() - cacheAt < 30000) return cache;
  // مقادیر پیش‌فرض به‌عنوان پایه (اگر جدول هنوز seed نشده باشد)
  const base: Record<string, boolean> = Object.fromEntries(Object.entries(DEFAULT_FLAGS).map(([k, v]) => [k, v.enabled]));
  try {
    const rows = await db.select().from(featureFlags);
    for (const r of rows) base[r.key] = !!r.enabled;
    // seed در پس‌زمینه اگر خالی بود
    if (rows.length === 0) ensureFlags().catch(() => {});
  } catch { /* از پیش‌فرض استفاده کن */ }
  cache = base;
  cacheAt = Date.now();
  return cache;
}

export function invalidateFlags() { cache = null; }
