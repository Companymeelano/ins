import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';

// دریافت کد OAuth و تبدیل به توکن دسترسی طولانی‌مدت
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const isDemo = request.nextUrl.searchParams.get('demo') === '1' || !process.env.META_APP_ID;
  const origin = request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/?meta=error`);
  }

  if (isDemo) {
    // حالت دمو — ایجاد پیج نمونه متصل
    await upsertPage({
      handle: '@your_business',
      displayName: 'پیج کسب‌وکار من',
      igUserId: '17841400000000000',
      accessToken: 'DEMO_LONG_LIVED_TOKEN',
      followers: 48210,
      connected: true,
      isActive: true,
    });
    return NextResponse.redirect(`${origin}/?meta=connected&demo=1`);
  }

  try {
    const appId = process.env.META_APP_ID!;
    const appSecret = process.env.META_APP_SECRET!;
    const redirectUri = `${origin}/api/meta/callback`;

    // ۱) کد → توکن کوتاه‌مدت
    const form = new URLSearchParams();
    form.set('client_id', appId);
    form.set('client_secret', appSecret);
    form.set('grant_type', 'authorization_code');
    form.set('redirect_uri', redirectUri);
    form.set('code', code);

    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', { method: 'POST', body: form });
    const tokenData = await tokenRes.json();
    const shortToken = tokenData.access_token;
    const igUserId = String(tokenData.user_id || '');

    // ۲) توکن کوتاه‌مدت → طولانی‌مدت (۶۰ روزه)
    const longRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortToken}`
    );
    const longData = await longRes.json();
    const longToken = longData.access_token || shortToken;

    // ۳) دریافت اطلاعات پروفایل
    const meRes = await fetch(`https://graph.instagram.com/me?fields=username,followers_count&access_token=${longToken}`);
    const me = await meRes.json();

    await upsertPage({
      handle: `@${me.username || 'account'}`,
      displayName: me.username || 'حساب متصل',
      igUserId,
      accessToken: longToken,
      followers: me.followers_count || 0,
      connected: true,
      isActive: true,
    });

    return NextResponse.redirect(`${origin}/?meta=connected`);
  } catch (e) {
    console.error('OAuth callback error', e);
    return NextResponse.redirect(`${origin}/?meta=error`);
  }
}

async function upsertPage(data: {
  handle: string; displayName: string; igUserId: string; accessToken: string;
  followers: number; connected: boolean; isActive: boolean;
}) {
  const existing = await db.select().from(pages).where(eq(pages.igUserId, data.igUserId));
  // فقط این پیج را فعال کن، بقیه غیرفعال
  await db.update(pages).set({ isActive: false });
  if (existing.length) {
    await db.update(pages).set({ ...data }).where(eq(pages.igUserId, data.igUserId));
  } else {
    await db.insert(pages).values(data);
  }
}
