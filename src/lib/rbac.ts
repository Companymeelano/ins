import { NextRequest, NextResponse } from 'next/server';
import { getUserByToken } from '@/lib/auth';

// RBAC — نقش‌ها و مجوزها
export type Role = 'owner' | 'admin' | 'editor' | 'designer' | 'analyst' | 'viewer';

export const ROLE_LABELS: Record<Role, string> = {
  owner: 'مالک', admin: 'مدیر', editor: 'ویرایشگر', designer: 'طراح', analyst: 'تحلیل‌گر', viewer: 'بازدیدکننده',
};

// ماتریس مجوزها
export const PERMISSIONS: Record<Role, string[]> = {
  owner: ['*'],
  admin: ['*'],
  editor: ['content.create', 'content.edit', 'content.submit', 'ai.use', 'calendar.edit'],
  designer: ['content.create', 'ai.use', 'ai.image'],
  analyst: ['analytics.view', 'report.view'],
  viewer: ['content.view', 'analytics.view'],
};

export function can(role: string | null | undefined, perm: string): boolean {
  const r = (role || 'viewer') as Role;
  const perms = PERMISSIONS[r] || PERMISSIONS.viewer;
  return perms.includes('*') || perms.includes(perm);
}

// فقط approve/reject را owner و admin می‌توانند
export function canApprove(role: string | null | undefined): boolean {
  return role === 'owner' || role === 'admin';
}

// middleware نقش‌محور برای routeها
export async function requirePermission(request: NextRequest, perm: string): Promise<{ ok: true; user: { username: string; role: string } } | { ok: false; response: NextResponse }> {
  const token = request.cookies.get('milano_token')?.value || '';
  const user = await getUserByToken(token);
  if (!user) return { ok: false, response: NextResponse.json({ error: 'ابتدا وارد شوید' }, { status: 401 }) };
  if (!can(user.role, perm)) return { ok: false, response: NextResponse.json({ error: 'دسترسی کافی ندارید' }, { status: 403 }) };
  return { ok: true, user: { username: user.username, role: user.role || 'viewer' } };
}
