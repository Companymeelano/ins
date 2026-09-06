'use client';

import React from 'react';
import { Bell, Menu } from 'lucide-react';
import { useUI } from './ui-context';

// اعداد فارسی
export function toFa(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);
}

export type Tab = 'home' | 'story' | 'create' | 'analytics' | 'settings' | 'library';
export interface AuthUser { username: string; role: string; displayName: string | null }
export interface AlertRow { id: number; type: string | null; severity: string | null; title: string; message: string | null; read: boolean | null; createdAt: string | null }

// هدر مشترک صفحات — شامل دکمه همبرگر (بازکننده منو) و اعلان‌ها
export function TopHeader({ title, sub, wave }: { title: string; sub: string; wave?: boolean }) {
  const { openMenu, openAlerts, alertCount } = useUI();
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-4">
      {/* منوی کشویی */}
      <button
        onClick={openMenu}
        className="relative w-12 h-12 rounded-2xl bg-[#14101c] border border-white/5 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition"
        aria-label="باز کردن منو"
      >
        <span className="w-5 h-0.5 rounded-full bg-zinc-200" />
        <span className="w-5 h-0.5 rounded-full bg-zinc-200" />
        <span className="w-3.5 h-0.5 rounded-full bg-zinc-200 mr-auto ml-0.5" />
      </button>

      <div className="flex items-center gap-3">
        <div className="text-left">
          <p className="text-xs text-zinc-400 flex items-center gap-1 justify-end">
            {sub} {wave && <span>👋</span>}
          </p>
          <h1 className="text-2xl font-black text-white -mt-0.5">{title}</h1>
        </div>
        <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-[#ec4899] via-[#a855f7] to-[#fbbf24]">
          <div className="w-full h-full rounded-full bg-[#14101c] flex items-center justify-center text-white font-bold">M</div>
        </div>
      </div>

      {/* اعلان‌ها */}
      <button
        onClick={openAlerts}
        className="relative w-12 h-12 rounded-2xl bg-[#14101c] border border-white/5 flex items-center justify-center active:scale-95 transition"
        aria-label="اعلان‌ها"
      >
        <Bell className="w-5 h-5 text-zinc-300" />
        {alertCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ec4899] text-[10px] flex items-center justify-center font-bold text-white">
            {alertCount > 99 ? '99+' : alertCount}
          </span>
        )}
      </button>
    </div>
  );
}
