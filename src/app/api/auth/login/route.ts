import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createSession, findUser } from '@/lib/auth';
import { ensureBootstrap } from '@/lib/bootstrap';
import { parseBody, loginSchema } from '@/lib/validators';
import { enforceRate } from '@/lib/rate-limit';
import { audit } from '@/lib/observability';

export async function POST(request: NextRequest) {
  // rate limiting شدید برای auth (جلوگیری از brute force)
  const limited = enforceRate(request, 'auth-login', 8, 60000);
  if (limited) return limited;

  try {
    await ensureBootstrap();

    const parsed = await parseBody(request, loginSchema);
    if (!parsed.ok) return parsed.response;
    const { username, password } = parsed.data;

    const user = await findUser(username);
    if (!user || !verifyPassword(password, user.passwordHash || '')) {
      audit('login_failed', { category: 'auth', actor: username, detail: 'اعتبار نامعتبر' });
      return NextResponse.json({ error: 'نام کاربری یا رمز عبور اشتباه است' }, { status: 401 });
    }

    const token = await createSession(user.id);
    audit('login_success', { category: 'auth', actor: user.username });
    const res = NextResponse.json({
      success: true,
      user: { username: user.username, role: user.role, displayName: user.displayName },
    });
    res.cookies.set('milano_token', token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در ورود' }, { status: 500 });
  }
}
