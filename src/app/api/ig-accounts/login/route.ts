import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { igAccounts, proxies } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { attemptLogin, generateDeviceUuid } from '@/lib/instagram-connect';
import { encrypt } from '@/lib/crypto';

export async function POST(request: NextRequest) {
  try {
    const { username, password, proxyId } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'نام کاربری و رمز عبور اینستاگرام لازم است' }, { status: 400 });
    }

    // پروکسی متصل (برای امنیت)
    let proxyStr: string | undefined;
    if (proxyId) {
      const [p] = await db.select().from(proxies).where(eq(proxies.id, Number(proxyId)));
      if (p) proxyStr = `${p.type}://${p.host}:${p.port}`;
    }

    const deviceUuid = generateDeviceUuid();
    const result = await attemptLogin({ username: String(username).trim(), password, deviceUuid, proxy: proxyStr });

    // ثبت/به‌روزرسانی اکانت
    const [existing] = await db.select().from(igAccounts).where(eq(igAccounts.username, String(username).trim()));
    const base = {
      username: String(username).trim(),
      connectMethod: 'private',
      status: result.status,
      deviceUuid,
      proxyId: proxyId ? Number(proxyId) : null,
      sessionData: result.sessionData ? encrypt(result.sessionData) : null,
      challengeContext: result.challengeContext ? encrypt(result.challengeContext) : null,
      lastLogin: result.status === 'connected' ? new Date() : null,
    };
    let accountId: number;
    if (existing) {
      await db.update(igAccounts).set(base).where(eq(igAccounts.id, existing.id));
      accountId = existing.id;
    } else {
      const [a] = await db.insert(igAccounts).values(base).returning();
      accountId = a.id;
    }

    return NextResponse.json({
      success: result.status === 'connected',
      status: result.status,
      message: result.message,
      accountId,
      needsCode: result.status === 'challenge_required' || result.status === 'two_factor_required',
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در اتصال اکانت' }, { status: 500 });
  }
}
