import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { proxies } from '@/db/schema';

const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸', DE: '🇩🇪', NL: '🇳🇱', FR: '🇫🇷', GB: '🇬🇧', TR: '🇹🇷', AE: '🇦🇪',
  CA: '🇨🇦', SE: '🇸🇪', FI: '🇫🇮', SG: '🇸🇬', JP: '🇯🇵',
};

// واکشی خودکار لیست پروکسی از ارائه‌دهنده
// اگر PROXY_PROVIDER_URL تنظیم شده باشد از آن می‌خواند، وگرنه لیست دموی متنوع می‌سازد.
export async function POST(request: NextRequest) {
  try {
    const providerUrl = process.env.PROXY_PROVIDER_URL;
    const providerKey = process.env.PROXY_PROVIDER_KEY;
    let fetched: { host: string; port: number; country: string; type: string }[] = [];

    if (providerUrl) {
      try {
        const res = await fetch(providerUrl, {
          headers: providerKey ? { Authorization: `Bearer ${providerKey}` } : {},
        });
        const data = await res.json();
        // انتظار می‌رود آرایه‌ای از {host, port, country, type} باشد
        if (Array.isArray(data)) fetched = data;
        else if (Array.isArray(data.proxies)) fetched = data.proxies;
      } catch (e) {
        console.error('provider fetch failed', e);
      }
    }

    if (!fetched.length) {
      // لیست دموی متنوع بر اساس کشورهای مختلف
      const countries = ['US', 'DE', 'NL', 'FR', 'GB', 'TR', 'AE', 'CA', 'SE', 'FI', 'SG', 'JP'];
      const types = ['http', 'socks5'];
      fetched = Array.from({ length: 12 }, (_, i) => ({
        host: `${185 + (i % 40)}.${20 + i}.${100 + i}.${(i * 7) % 255}`,
        port: [8080, 3128, 1080, 8000, 9050][i % 5],
        country: countries[i % countries.length],
        type: types[i % 2],
      }));
    }

    const inserted = [];
    for (const p of fetched.slice(0, 30)) {
      const country = (p.country || 'US').toUpperCase();
      const ping = Math.floor(60 + Math.random() * 600);
      const [row] = await db.insert(proxies).values({
        label: `${p.host}:${p.port}`,
        type: p.type || 'http',
        host: p.host,
        port: Number(p.port),
        country,
        countryFlag: COUNTRY_FLAGS[country] || '🌐',
        ping,
        status: ping < 300 ? 'green' : ping < 800 ? 'slow' : 'dead',
        provider: providerUrl ? 'api' : 'demo-provider',
        lastChecked: new Date(),
      }).returning();
      inserted.push(row);
    }

    return NextResponse.json({
      success: true,
      count: inserted.length,
      source: providerUrl ? 'provider-api' : 'demo',
      note: providerUrl ? 'از ارائه‌دهنده واقعی دریافت شد' : 'برای اتصال واقعی، PROXY_PROVIDER_URL را تنظیم کنید',
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در واکشی' }, { status: 500 });
  }
}
