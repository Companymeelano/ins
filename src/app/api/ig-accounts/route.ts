import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { igAccounts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { decrypt } from '@/lib/crypto';

export async function GET() {
  try {
    const list = await db.select().from(igAccounts).orderBy(igAccounts.createdAt);
    // هرگز session/challenge خام برنگردان
    const safe = list.map((a) => ({
      id: a.id, username: a.username, connectMethod: a.connectMethod, status: a.status,
      proxyId: a.proxyId, lastLogin: a.lastLogin, createdAt: a.createdAt,
      hasSession: !!a.sessionData,
    }));
    return NextResponse.json({ success: true, accounts: safe });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = Number(request.nextUrl.searchParams.get('id'));
    await db.delete(igAccounts).where(eq(igAccounts.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا' }, { status: 500 });
  }
}
