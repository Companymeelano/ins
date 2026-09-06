// Rate limiter ساده مبتنی بر حافظه (sliding window)
// برای auth و routeهای AI تا از سوءاستفاده جلوگیری شود.

interface Bucket { count: number; resetAt: number }
const buckets = new Map<string, Bucket>();

export interface RateResult { ok: boolean; remaining: number; retryAfter: number }

export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  return { ok: true, remaining: limit - b.count, retryAfter: 0 };
}

// استخراج شناسه کلاینت از request
export function clientId(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  return fwd?.split(',')[0]?.trim() || 'local';
}

// کمک‌کننده برای اعمال محدودیت با پاسخ آماده
import { NextResponse } from 'next/server';
export function enforceRate(request: Request, name: string, limit: number, windowMs: number): NextResponse | null {
  const r = rateLimit(`${name}:${clientId(request)}`, limit, windowMs);
  if (!r.ok) {
    return NextResponse.json(
      { error: `تعداد درخواست‌ها زیاد است. ${r.retryAfter} ثانیه صبر کنید.` },
      { status: 429, headers: { 'Retry-After': String(r.retryAfter) } }
    );
  }
  return null;
}
