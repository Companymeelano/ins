import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tunnels, proxies, alerts } from '@/db/schema';
import { eq } from 'drizzle-orm';

// مانیتور: بررسی قطعی تونل و افت پینگ، تولید هشدار + failover خودکار
export async function POST() {
  try {
    const tunnelList = await db.select().from(tunnels);
    const proxyList = await db.select().from(proxies);
    const created: { title: string; type: string }[] = [];

    const active = tunnelList.find((t) => t.active);
    if (active) {
      // شبیه‌سازی پینگ جدید
      const newPing = Math.floor(40 + Math.random() * 600);
      const down = Math.random() < 0.25; // احتمال قطعی

      if (down) {
        await db.update(tunnels).set({ status: 'dead', active: false }).where(eq(tunnels.id, active.id));
        const [a] = await db.insert(alerts).values({
          type: 'tunnel_down', severity: 'critical',
          title: `قطعی سرویس «${active.label}»`,
          message: 'سرویس اتصال قطع شد. سیستم در حال جابه‌جایی خودکار به سرویس جایگزین است...',
        }).returning();
        created.push({ title: a.title, type: a.type ?? 'tunnel_down' });

        // failover خودکار
        const candidates = tunnelList.filter((t) => t.id !== active.id && t.autoSwitch).sort((a, b) => (a.ping ?? 999) - (b.ping ?? 999));
        if (candidates[0]) {
          await db.update(tunnels).set({ active: true, status: 'connected' }).where(eq(tunnels.id, candidates[0].id));
          const [a2] = await db.insert(alerts).values({
            type: 'info', severity: 'info',
            title: `اتصال بازیابی شد`,
            message: `به‌صورت خودکار به «${candidates[0].label}» متصل شدید ✓`,
          }).returning();
          created.push({ title: a2.title, type: 'info' });
        }
      } else if (newPing > 500) {
        await db.update(tunnels).set({ ping: newPing }).where(eq(tunnels.id, active.id));
        const [a] = await db.insert(alerts).values({
          type: 'ping_spike', severity: 'warning',
          title: `افت کیفیت اتصال`,
          message: `پینگ سرویس «${active.label}» به ${newPing}ms رسید. پیشنهاد: سرویس بهتر انتخاب کنید.`,
        }).returning();
        created.push({ title: a.title, type: a.type ?? 'ping_spike' });
      } else {
        await db.update(tunnels).set({ ping: newPing }).where(eq(tunnels.id, active.id));
      }
    }

    // بررسی پروکسی‌های مرده فعال
    const deadActive = proxyList.find((p) => p.active && p.status === 'dead');
    if (deadActive) {
      const [a] = await db.insert(alerts).values({
        type: 'proxy_dead', severity: 'warning',
        title: `پروکسی فعال قطع شده`,
        message: `پروکسی ${deadActive.host} پاسخ نمی‌دهد. یک پروکسی سبز دیگر انتخاب کنید.`,
      }).returning();
      created.push({ title: a.title, type: a.type ?? 'proxy_dead' });
    }

    return NextResponse.json({ success: true, created, checkedAt: new Date().toISOString() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در مانیتور' }, { status: 500 });
  }
}
