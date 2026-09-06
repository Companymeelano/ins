// Moderation — بررسی ورودی/خروجی برای محتوای خطرناک، claims پزشکی/مالی و نامناسب

const MEDICAL_CLAIMS = ['درمان قطعی', 'معجزه', 'شفای کامل', 'بدون عارضه', 'تضمین درمان', 'لاغری تضمینی', 'کاهش وزن قطعی'];
const FINANCIAL_CLAIMS = ['سود تضمینی', 'دو برابر پول', 'ثروت یک‌شبه', 'سرمایه‌گذاری بدون ریسک', 'سود قطعی', 'برد صددرصد'];
const UNSAFE = ['کلاهبرداری', 'هک اکانت', 'خرید فالوور تقلبی', 'اسپم انبوه'];
const EXAGGERATION = ['بهترین در جهان', 'هیچ‌کس نمی‌تواند', 'صددرصد تضمینی', 'بی‌نظیرترین'];

export interface ModerationResult {
  allowed: boolean;
  flags: { type: 'medical' | 'financial' | 'unsafe' | 'exaggeration'; term: string; note: string }[];
  severity: 'clean' | 'warning' | 'blocked';
}

export function moderate(text: string): ModerationResult {
  const flags: ModerationResult['flags'] = [];
  const t = text || '';

  for (const term of MEDICAL_CLAIMS) if (t.includes(term)) flags.push({ type: 'medical', term, note: 'ادعای پزشکی غیرمجاز — طبق قوانین پلتفرم ممنوع است' });
  for (const term of FINANCIAL_CLAIMS) if (t.includes(term)) flags.push({ type: 'financial', term, note: 'ادعای مالی گمراه‌کننده — ریسک policy' });
  for (const term of UNSAFE) if (t.includes(term)) flags.push({ type: 'unsafe', term, note: 'محتوای ناامن یا ناقض قوانین' });
  for (const term of EXAGGERATION) if (t.includes(term)) flags.push({ type: 'exaggeration', term, note: 'ادعای اغراق‌آمیز' });

  const hasBlocking = flags.some((f) => f.type === 'medical' || f.type === 'financial' || f.type === 'unsafe');
  return {
    allowed: !hasBlocking,
    flags,
    severity: hasBlocking ? 'blocked' : flags.length ? 'warning' : 'clean',
  };
}
