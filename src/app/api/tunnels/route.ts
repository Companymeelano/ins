import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tunnels } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { encrypt, maskConfig, decrypt } from '@/lib/crypto';

// تشخیص پروتکل از روی URI کانفیگ
function detectProtocol(uri: string): string {
  const u = uri.toLowerCase();
  if (u.startsWith('vmess://')) return 'vmess';
  if (u.startsWith('vless://')) return 'vless';
  if (u.startsWith('trojan://')) return 'trojan';
  if (u.startsWith('ss://')) return 'shadowsocks';
  if (u.startsWith('socks')) return 'socks5';
  return 'vmess';
}

export async function GET() {
  try {
    const list = await db.select().from(tunnels).orderBy(tunnels.ping);
    // هرگز کانفیگ رمزنگاری‌شده را خام برنگردان — ماسک‌شده بفرست
    const safe = list.map((t) => ({ ...t, configUri: t.configUri ? maskConfig(decrypt(t.configUri)) : '' }));
    return NextResponse.json({ success: true, tunnels: safe });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // پشتیبانی از افزودن گروهی با چند خط
    const uris: string[] = Array.isArray(body.list)
      ? body.list
      : String(body.configUri || '').split('\n').map((s: string) => s.trim()).filter(Boolean);

    if (!uris.length) return NextResponse.json({ error: 'کانفیگ لازم است' }, { status: 400 });

    const inserted = [];
    for (const uri of uris) {
      const protocol = detectProtocol(uri);
      const ping = Math.floor(50 + Math.random() * 400);
      const [t] = await db.insert(tunnels).values({
        label: body.label || `${protocol.toUpperCase()} سرور`,
        protocol,
        configUri: encrypt(uri), // رمزنگاری در حالت ذخیره
        encrypted: true,
        ping,
        status: 'ready',
        autoSwitch: true,
      }).returning();
      inserted.push({ ...t, configUri: maskConfig(uri) });
    }
    return NextResponse.json({ success: true, inserted });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در افزودن سرویس' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.connect) {
      await db.update(tunnels).set({ status: 'ready', active: false });
      await db.update(tunnels).set({ status: 'connected', active: true }).where(eq(tunnels.id, Number(body.connect)));
    }
    if (body.toggleAutoSwitch !== undefined) {
      await db.update(tunnels).set({ autoSwitch: !!body.toggleAutoSwitch }).where(eq(tunnels.id, Number(body.id)));
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = Number(request.nextUrl.searchParams.get('id'));
    await db.delete(tunnels).where(eq(tunnels.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}
