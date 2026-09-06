import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tunnels } from '@/db/schema';
import { eq } from 'drizzle-orm';

// انتخاب هوشمند کم‌پینگ‌ترین سرویس فعال (با failover در صورت قطعی)
export async function POST() {
  try {
    const list = await db.select().from(tunnels);
    if (!list.length) return NextResponse.json({ error: 'هیچ سرویسی ثبت نشده' }, { status: 400 });

    // شبیه‌سازی پینگ مجدد
    for (const t of list) {
      const ping = Math.floor(45 + Math.random() * 420);
      const status = t.status === 'dead' ? 'ready' : t.status;
      await db.update(tunnels).set({ ping, lastChecked: new Date(), status: status === 'connected' ? 'connected' : 'ready' }).where(eq(tunnels.id, t.id));
    }

    const refreshed = await db.select().from(tunnels);
    // انتخاب سرویس‌هایی که autoSwitch دارند و کم‌پینگ‌ترین
    const candidates = refreshed.filter((t) => t.autoSwitch && t.status !== 'dead').sort((a, b) => (a.ping ?? 999) - (b.ping ?? 999));
    const best = candidates[0] || refreshed.sort((a, b) => (a.ping ?? 999) - (b.ping ?? 999))[0];

    if (best) {
      await db.update(tunnels).set({ active: false, status: 'ready' });
      await db.update(tunnels).set({ active: true, status: 'connected' }).where(eq(tunnels.id, best.id));
    }

    const final = await db.select().from(tunnels).orderBy(tunnels.ping);
    return NextResponse.json({
      success: true,
      selected: best ? { id: best.id, label: best.label, ping: best.ping, protocol: best.protocol } : null,
      tunnels: final,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در انتخاب خودکار' }, { status: 500 });
  }
}
