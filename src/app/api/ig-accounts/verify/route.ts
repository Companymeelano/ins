import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { igAccounts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { resolveChallenge } from '@/lib/instagram-connect';
import { encrypt, decrypt } from '@/lib/crypto';

// تایید کد challenge / 2FA
export async function POST(request: NextRequest) {
  try {
    const { accountId, code } = await request.json();
    if (!accountId || !code) return NextResponse.json({ error: 'کد تایید لازم است' }, { status: 400 });

    const [acc] = await db.select().from(igAccounts).where(eq(igAccounts.id, Number(accountId)));
    if (!acc) return NextResponse.json({ error: 'اکانت یافت نشد' }, { status: 404 });

    const type = acc.status === 'two_factor_required' ? 'two_factor' : 'challenge';
    const result = await resolveChallenge({
      username: acc.username,
      code: String(code).trim(),
      deviceUuid: acc.deviceUuid || '',
      challengeContext: acc.challengeContext ? decrypt(acc.challengeContext) : '{}',
      type,
    });

    await db.update(igAccounts).set({
      status: result.status,
      sessionData: result.sessionData ? encrypt(result.sessionData) : acc.sessionData,
      challengeContext: null,
      lastLogin: result.status === 'connected' ? new Date() : null,
    }).where(eq(igAccounts.id, acc.id));

    return NextResponse.json({ success: result.status === 'connected', status: result.status, message: result.message });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در تایید' }, { status: 500 });
  }
}
