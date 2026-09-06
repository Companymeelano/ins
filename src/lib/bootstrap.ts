import { db } from '@/db';
import { panelUsers, activitySchedules, knowledgeBase } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth';
import { ensureFlags } from '@/lib/flags';

// Bootstrap مرکزی و idempotent — همه داده‌های اولیه یکجا و ایمن ساخته می‌شوند.
// از ON CONFLICT / شمارش برای جلوگیری از race condition و duplicate استفاده می‌شود.
// این تابع فقط یک‌بار در هر فرآیند اجرا می‌شود (کش با flag).

let bootstrapped = false;
let bootstrapPromise: Promise<void> | null = null;

export const SAFE_LIMITS: Record<string, { max: number; recommended: number; label: string }> = {
  engage_likes: { max: 300, recommended: 150, label: 'یادآور لایک تعاملی' },
  follow_reminder: { max: 100, recommended: 40, label: 'یادآور فالو هدفمند' },
  comment_reminder: { max: 50, recommended: 20, label: 'یادآور کامنت واقعی' },
  unfollow_review: { max: 100, recommended: 50, label: 'بازبینی آنفالو' },
};

const KB_SEED = [
  { category: 'قیمت', question: 'قیمت محصولات چنده؟', answer: 'قیمت‌ها در توضیحات هر پست درج شده. برای لیست کامل، کلمه «کاتالوگ» را بفرستید.', keywords: 'قیمت,چند,هزینه,تومان' },
  { category: 'ارسال', question: 'شرایط ارسال چیه؟', answer: 'ارسال به سراسر کشور با پست پیشتاز ۲ تا ۴ روز کاری. ارسال تهران رایگان است.', keywords: 'ارسال,پست,تحویل,مرسوله' },
  { category: 'پشتیبانی', question: 'ساعات پاسخگویی؟', answer: 'هر روز از ۹ صبح تا ۹ شب پاسخگوی شما هستیم 🙏', keywords: 'ساعت,پشتیبانی,پاسخگویی,تماس' },
  { category: 'تخفیف', question: 'کد تخفیف دارید؟', answer: 'با فالو کردن پیج و ثبت اولین سفارش، کد تخفیف ۱۵٪ دریافت می‌کنید! کلمه «تخفیف» را بفرستید.', keywords: 'تخفیف,کد,آف,ارزان' },
];

async function runBootstrap(): Promise<void> {
  // ۱) کاربر admin پیش‌فرض (idempotent با ON CONFLICT روی username unique)
  await db.insert(panelUsers).values({
    username: 'admin',
    passwordHash: hashPassword('admin'),
    role: 'admin',
    displayName: 'مدیر سیستم',
  }).onConflictDoNothing({ target: panelUsers.username });

  // ۲) زمان‌بندهای فعالیت (فقط اگر خالی باشد)
  const [{ count: schedCount }] = await db.select({ count: sql<number>`count(*)::int` }).from(activitySchedules);
  if (schedCount === 0) {
    await db.insert(activitySchedules).values(
      Object.entries(SAFE_LIMITS).map(([actionType, cfg]) => ({
        actionType, enabled: false, dailyLimit: cfg.recommended, intervalMin: 10, activeHoursStart: 9, activeHoursEnd: 23, doneToday: 0,
      }))
    ).onConflictDoNothing();
  }

  // ۳) پایگاه دانش (فقط اگر خالی باشد)
  const [{ count: kbCount }] = await db.select({ count: sql<number>`count(*)::int` }).from(knowledgeBase);
  if (kbCount === 0) {
    await db.insert(knowledgeBase).values(KB_SEED).onConflictDoNothing();
  }

  // ۴) feature flags
  await ensureFlags();
}

// اطمینان از bootstrap — با کش تا فقط یک‌بار اجرا شود (بدون race condition)
export async function ensureBootstrap(): Promise<void> {
  // در محیط‌های بدون پایگاه‌داده، bootstrap نیازی ندارد و باعث خطا نمی‌شود.
  if (!process.env.DATABASE_URL) return;
  if (bootstrapped) return;
  if (!bootstrapPromise) {
    bootstrapPromise = runBootstrap()
      .then(() => { bootstrapped = true; })
      .catch((e) => { bootstrapPromise = null; throw e; });
  }
  return bootstrapPromise;
}
