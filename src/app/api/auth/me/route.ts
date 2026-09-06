import { NextRequest, NextResponse } from 'next/server';
import { getUserByToken } from '@/lib/auth';
import { ensureBootstrap } from '@/lib/bootstrap';

export async function GET(request: NextRequest) {
  try {
    await ensureBootstrap();
    const token = request.cookies.get('milano_token')?.value || '';
    const user = await getUserByToken(token);
    if (!user) return NextResponse.json({ success: false, user: null });
    return NextResponse.json({ success: true, user: { username: user.username, role: user.role, displayName: user.displayName } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, user: null });
  }
}
