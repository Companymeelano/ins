import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gamification } from '@/db/schema';
import { eq } from 'drizzle-orm';

const ALL_BADGES = [
  { id: 'starter', label: 'شروع‌کننده', emoji: '🌱', need: 0 },
  { id: 'creator', label: 'خالق محتوا', emoji: '🎨', need: 50 },
  { id: 'consistent', label: 'منظم', emoji: '🔥', need: 150 },
  { id: 'viral', label: 'وایرال‌ساز', emoji: '🚀', need: 300 },
  { id: 'master', label: 'استاد اینستاگرام', emoji: '👑', need: 600 },
];

export async function GET() {
  try {
    let [row] = await db.select().from(gamification).where(eq(gamification.username, 'demo_creator'));
    if (!row) {
      [row] = await db.insert(gamification).values({ username: 'demo_creator', points: 120, streak: 5, badges: ['starter', 'creator'] }).returning();
    }
    const badges = ALL_BADGES.map((b) => ({ ...b, unlocked: (row.points ?? 0) >= b.need }));
    return NextResponse.json({ success: true, data: row, badges });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const add = Number(body.points) || 10;
    let [row] = await db.select().from(gamification).where(eq(gamification.username, 'demo_creator'));
    if (!row) {
      [row] = await db.insert(gamification).values({ username: 'demo_creator' }).returning();
    }
    const newPoints = (row.points ?? 0) + add;
    const unlocked = ALL_BADGES.filter((b) => newPoints >= b.need).map((b) => b.id);
    [row] = await db.update(gamification)
      .set({ points: newPoints, streak: (row.streak ?? 0) + 1, lastActive: new Date(), badges: unlocked })
      .where(eq(gamification.username, 'demo_creator')).returning();
    const badges = ALL_BADGES.map((b) => ({ ...b, unlocked: newPoints >= b.need }));
    return NextResponse.json({ success: true, data: row, badges, earned: add });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}
