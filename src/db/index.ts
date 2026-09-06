import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// اتصال به پایگاه‌داده به‌صورت تنبل (lazy) برقرار می‌شود تا بارگذاری ماژول باعث خطا
// در محیط‌های بدون DATABASE_URL (مثل پیش‌نمایش، ساخت استاتیک و PWA) نشود.
// در صورت نبود متغیر، یک Pool با رشته اتصال خالی ساخته می‌شود که فقط هنگام اجرای
// کوئری خطا می‌دهد (مسیرهای API آن را مدیریت می‌کنند) و باعث شکست زمان ساخت نمی‌شود.
const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl || undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

import * as schema from './schema';

export const db = drizzle(pool, { schema });
