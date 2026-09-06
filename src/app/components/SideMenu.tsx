'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Home, Wand2, Film, BarChart3, FolderOpen, Settings, Rocket, Hash, MessageSquareReply,
  ScanEye, Anchor, Music, Clock, Shield, MessageSquare, Bot, BrainCircuit, Users, ShoppingBag,
  CalendarDays, Workflow, Tag, Bell, LogOut, ChevronLeft, Sparkles, Globe2,
} from 'lucide-react';
import { type Tab, type AuthUser } from './shared';
import { type Lang, languages } from '../i18n';

type Action =
  | { kind: 'tab'; target: Tab }
  | { kind: 'tool'; target: string }
  | { kind: 'secure' }
  | { kind: 'alerts' };

interface MenuItem {
  key: string;
  label: string;
  icon: React.ElementType;
  action: Action;
}

const GROUPS: { title: string; emoji: string; items: MenuItem[] }[] = [
  {
    title: 'بخش‌های اصلی',
    emoji: '🧭',
    items: [
      { key: 'home', label: 'خانه و داشبورد', icon: Home, action: { kind: 'tab', target: 'home' } },
      { key: 'create', label: 'استودیو ساخت محتوا', icon: Wand2, action: { kind: 'tab', target: 'create' } },
      { key: 'story', label: 'استودیو استوری', icon: Film, action: { kind: 'tab', target: 'story' } },
      { key: 'analytics', label: 'آنالیز و گزارش', icon: BarChart3, action: { kind: 'tab', target: 'analytics' } },
      { key: 'library', label: 'کتابخانه محتوا', icon: FolderOpen, action: { kind: 'tab', target: 'library' } },
      { key: 'settings', label: 'تنظیمات و حساب', icon: Settings, action: { kind: 'tab', target: 'settings' } },
    ],
  },
  {
    title: 'هوش مصنوعی',
    emoji: '🤖',
    items: [
      { key: 'viral', label: 'پیش‌بینی وایرال شدن', icon: Rocket, action: { kind: 'tool', target: 'viral' } },
      { key: 'hashtags', label: 'هشتگ‌ساز هوشمند', icon: Hash, action: { kind: 'tool', target: 'hashtags' } },
      { key: 'comment', label: 'دستیار پاسخ به کامنت', icon: MessageSquareReply, action: { kind: 'tool', target: 'comment' } },
      { key: 'vision', label: 'تحلیل هوشمند تصویر', icon: ScanEye, action: { kind: 'tool', target: 'vision' } },
      { key: 'hook', label: 'قلاب و کاور ریلز', icon: Anchor, action: { kind: 'tool', target: 'hook' } },
      { key: 'reelprod', label: 'پروداکشن ریلز', icon: Music, action: { kind: 'tool', target: 'reelprod' } },
      { key: 'besttime', label: 'بهترین زمان انتشار', icon: Clock, action: { kind: 'tool', target: 'besttime' } },
    ],
  },
  {
    title: 'مدیریت و اتوماسیون',
    emoji: '⚙️',
    items: [
      { key: 'secure', label: 'مرکز اتصال امن (ضدبن)', icon: Shield, action: { kind: 'secure' } },
      { key: 'autoreply', label: 'پاسخ خودکار دایرکت', icon: MessageSquare, action: { kind: 'tool', target: 'autoreply' } },
      { key: 'engine', label: 'موتور پاسخ هوشمند', icon: Bot, action: { kind: 'tool', target: 'engine' } },
      { key: 'knowledge', label: 'پایگاه دانش چت‌بات', icon: BrainCircuit, action: { kind: 'tool', target: 'knowledge' } },
      { key: 'team', label: 'همکاری تیمی', icon: Users, action: { kind: 'tool', target: 'team' } },
      { key: 'shop', label: 'فروشگاه و تگ محصول', icon: ShoppingBag, action: { kind: 'tool', target: 'shop' } },
      { key: 'calendar', label: 'تقویم هوشمند', icon: CalendarDays, action: { kind: 'tool', target: 'calendar' } },
      { key: 'approval', label: 'گردش کار تأیید', icon: Workflow, action: { kind: 'tool', target: 'approval' } },
      { key: 'producttag', label: 'تگ محصول روی پست', icon: Tag, action: { kind: 'tool', target: 'producttag' } },
    ],
  },
];

export function SideMenu({
  open,
  onClose,
  onTab,
  onTool,
  onSecure,
  onAlerts,
  onLogout,
  user,
  alertCount,
  lang,
  onLang,
}: {
  open: boolean;
  onClose: () => void;
  onTab: (t: Tab) => void;
  onTool: (k: string) => void;
  onSecure: () => void;
  onAlerts: () => void;
  onLogout: () => void;
  user: AuthUser | null;
  alertCount: number;
  lang: Lang;
  onLang: (l: Lang) => void;
}) {
  const dispatch = (a: Action) => {
    if (a.kind === 'tab') onTab(a.target);
    else if (a.kind === 'tool') onTool(a.target);
    else if (a.kind === 'secure') onSecure();
    else if (a.kind === 'alerts') onAlerts();
    onClose();
  };

  return (
    <>
      {/* پس‌زمینه محو */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
      />

      {/* ستون مرکزی (مانند قاب گوشی) تا دراور با فریم هم‌تراز شود */}
      <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[80] pointer-events-none">
        {/* پنل کشویی — از سمت راست (انتهای RTL) */}
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          className="absolute inset-y-0 right-0 w-[88%] max-w-[360px] pointer-events-auto bg-[#0d0916] border-l border-white/5 shadow-2xl flex flex-col"
        >
        {/* هدر برند */}
        <div className="relative px-5 pt-7 pb-5 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.45),transparent_70%)] blur-2xl" />
          <div className="relative flex items-center gap-3">
            <img src="/icons/icon-192.png" alt="میلانو" className="w-14 h-14 rounded-2xl shadow-[0_10px_30px_-8px_rgba(236,72,153,0.7)]" />
            <div>
              <p className="text-xl font-black text-white leading-none">میلانو</p>
              <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-pink-400" /> استودیو هوشمند اینستاگرام
              </p>
            </div>
          </div>
        </div>

        {/* کاربر + اعلان‌ها */}
        <div className="mx-4 mb-3 rounded-3xl p-4 bg-gradient-to-br from-[#2e1650] to-[#160a24] border border-white/5 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] flex items-center justify-center text-white font-black shrink-0">
            {user?.displayName?.[0] || user?.username?.[0]?.toUpperCase() || 'M'}
          </div>
          <div className="flex-1 text-right min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.displayName || user?.username || 'کاربر'}</p>
            <p className="text-[11px] text-zinc-400 truncate" dir="ltr">@{user?.username || 'milano'}</p>
          </div>
          <button onClick={() => dispatch({ kind: 'alerts' })} className="relative w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
            <Bell className="w-5 h-5 text-zinc-300" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ec4899] text-[10px] flex items-center justify-center font-bold text-white">
                {alertCount > 99 ? '99+' : alertCount}
              </span>
            )}
          </button>
        </div>

        {/* لیست گروه‌بندی‌شده */}
        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 pb-4">
          {GROUPS.map((g, gi) => (
            <div key={g.title} className="mb-2">
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="text-base">{g.emoji}</span>
                <span className="text-[11px] font-bold text-zinc-500 tracking-wide">{g.title}</span>
                <span className="flex-1 h-px bg-white/5" />
              </div>
              <div className="space-y-1">
                {g.items.map((it, ii) => {
                  const Icon = it.icon;
                  return (
                    <motion.button
                      key={it.key}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * (gi * 3 + ii), type: 'spring', stiffness: 300, damping: 26 }}
                      onClick={() => dispatch(it.action)}
                      className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-2xl text-right text-zinc-300 hover:bg-white/[0.06] hover:text-white transition"
                    >
                      <span className="w-9 h-9 rounded-xl bg-white/[0.04] group-hover:bg-gradient-to-br group-hover:from-[#7c3aed] group-hover:to-[#a855f7] flex items-center justify-center transition">
                        <Icon className="w-4.5 h-4.5 w-[18px] h-[18px] text-zinc-300 group-hover:text-white" />
                      </span>
                      <span className="flex-1 text-sm">{it.label}</span>
                      <ChevronLeft className="w-4 h-4 text-zinc-600 group-hover:text-purple-300 transition" />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* انتخاب زبان */}
          <div className="mt-3 px-3">
            <div className="flex items-center gap-2 mb-2">
              <Globe2 className="w-4 h-4 text-sky-400" />
              <span className="text-[11px] font-bold text-zinc-500">زبان برنامه</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => onLang(l.code)}
                  className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium flex items-center gap-1 transition ${lang === l.code ? 'bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white' : 'bg-white/[0.05] text-zinc-400'}`}
                >
                  <span>{l.flag}</span>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* خروج */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => { onLogout(); onClose(); }}
            className="w-full py-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            <LogOut className="w-4 h-4" /> خروج از حساب
          </button>
        </div>
        </motion.aside>
      </div>
    </>
  );
}
