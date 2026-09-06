import { NextRequest, NextResponse } from 'next/server';

// شروع فرآیند OAuth با Instagram Business Login
// اگر متغیرها تنظیم نشده باشند، حالت دمو فعال می‌شود.
export async function GET(request: NextRequest) {
  const appId = process.env.META_APP_ID;
  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/meta/callback`;

  if (!appId) {
    // حالت دمو — بدون کلید واقعی، مستقیم به callback با کد دمو می‌رود
    return NextResponse.redirect(`${redirectUri}?code=demo_code&demo=1`);
  }

  const scope = [
    'instagram_business_basic',
    'instagram_business_content_publish',
    'instagram_business_manage_comments',
    'instagram_business_manage_messages',
    'instagram_business_manage_insights',
  ].join(',');

  const authUrl =
    `https://api.instagram.com/oauth/authorize` +
    `?client_id=${appId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&response_type=code`;

  return NextResponse.redirect(authUrl);
}
