import crypto from 'crypto';
import { db } from '@/db';
import { panelUsers, sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

// هش پسورد با scrypt
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':');
    const test = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(test, 'hex'));
  } catch {
    return false;
  }
}

// حالت دمو: وقتی DATABASE_URL تنظیم نشده باشد (پیش‌نمایش / محیط بدون پایگاه‌داده)،
// احراز هویت روی یک کاربر پیش‌فرض (admin / admin) به‌صورت درون‌حافظه‌ای کار می‌کند
// تا کل رابط کاربری بدون نیاز به دیتابیس قابل استفاده و نمایش باشد.
const USING_DEMO = !process.env.DATABASE_URL;
const DEMO_TOKEN = 'milano-demo-admin-token';
const DEMO_USER = {
  id: 0,
  username: 'admin',
  role: 'admin',
  displayName: 'مدیر سیستم',
  passwordHash: hashPassword('admin'),
};

export type AppUser = {
  id: number;
  username: string;
  role: string;
  displayName: string | null;
  passwordHash?: string;
};

// اطمینان از وجود کاربر admin پیش‌فرض (admin/admin) — idempotent و ضد race condition
export async function ensureAdmin() {
  if (USING_DEMO) return;
  await db.insert(panelUsers).values({
    username: 'admin',
    passwordHash: hashPassword('admin'),
    role: 'admin',
    displayName: 'مدیر سیستم',
  }).onConflictDoNothing({ target: panelUsers.username });
}

// یافتن کاربر بر اساس نام کاربری (با در نظر گرفتن حالت دمو)
export async function findUser(username: string): Promise<AppUser | null> {
  if (USING_DEMO) {
    return username.trim() === 'admin' ? DEMO_USER : null;
  }
  const [user] = await db.select().from(panelUsers).where(eq(panelUsers.username, username.trim()));
  return (user as AppUser) || null;
}

export function newToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createSession(userId: number): Promise<string> {
  if (USING_DEMO) return DEMO_TOKEN;
  const token = newToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // ۷ روز
  await db.insert(sessions).values({ token, userId, expiresAt });
  return token;
}

export async function getUserByToken(token: string) {
  if (!token) return null;
  if (USING_DEMO) return token === DEMO_TOKEN ? DEMO_USER : null;
  const [s] = await db.select().from(sessions).where(eq(sessions.token, token));
  if (!s || (s.expiresAt && new Date(s.expiresAt) < new Date())) return null;
  const [u] = await db.select().from(panelUsers).where(eq(panelUsers.id, s.userId!));
  return u || null;
}

export async function destroySession(token: string) {
  if (USING_DEMO) return;
  await db.delete(sessions).where(eq(sessions.token, token));
}
