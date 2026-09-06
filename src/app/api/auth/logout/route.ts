import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('milano_token')?.value || '';
  if (token) await destroySession(token);
  const res = NextResponse.json({ success: true });
  res.cookies.delete('milano_token');
  return res;
}
