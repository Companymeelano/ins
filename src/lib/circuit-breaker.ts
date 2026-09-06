// Circuit Breaker — جلوگیری از کرش هنگام قطعی provider (AI/Meta)
// حالت‌ها: closed (عادی) → open (قطع، درخواست نده) → half-open (تست مجدد)

interface Breaker { failures: number; state: 'closed' | 'open' | 'half-open'; openedAt: number }
const breakers = new Map<string, Breaker>();

const FAILURE_THRESHOLD = 5;
const OPEN_DURATION = 30000; // ۳۰ ثانیه قطع

function get(name: string): Breaker {
  let b = breakers.get(name);
  if (!b) { b = { failures: 0, state: 'closed', openedAt: 0 }; breakers.set(name, b); }
  return b;
}

export function canRequest(name: string): boolean {
  const b = get(name);
  if (b.state === 'open') {
    if (Date.now() - b.openedAt > OPEN_DURATION) { b.state = 'half-open'; return true; }
    return false;
  }
  return true;
}

export function recordSuccess(name: string) {
  const b = get(name);
  b.failures = 0;
  b.state = 'closed';
}

export function recordFailure(name: string) {
  const b = get(name);
  b.failures += 1;
  if (b.failures >= FAILURE_THRESHOLD) { b.state = 'open'; b.openedAt = Date.now(); }
}

export function breakerState(name: string): string {
  return get(name).state;
}

// اجرای امن یک تابع با محافظت circuit breaker
export async function withBreaker<T>(name: string, fn: () => Promise<T>): Promise<{ ok: true; value: T } | { ok: false; reason: 'open' | 'error' }> {
  if (!canRequest(name)) return { ok: false, reason: 'open' };
  try {
    const value = await fn();
    recordSuccess(name);
    return { ok: true, value };
  } catch {
    recordFailure(name);
    return { ok: false, reason: 'error' };
  }
}
