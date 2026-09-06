'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, BarChart3, Clapperboard, FolderOpen, Settings, Plus } from 'lucide-react';
import { type Tab } from './shared';
import { tr, type Lang } from '../i18n';

interface Item {
  id: Tab;
  label: string;
  icon: React.ElementType;
}

const ITEMS: Item[] = [
  { id: 'home', label: tr('home', 'fa'), icon: Home },
  { id: 'analytics', label: tr('analytics', 'fa'), icon: BarChart3 },
  // FAB (create) inserted in the middle
  { id: 'story', label: tr('story', 'fa'), icon: Clapperboard },
  { id: 'library', label: tr('library', 'fa'), icon: FolderOpen },
  { id: 'settings', label: tr('settings', 'fa'), icon: Settings },
];

export function BottomBar({ tab, setTab, lang }: { tab: Tab; setTab: (t: Tab) => void; lang: Lang }) {
  const mid = Math.ceil(ITEMS.length / 2);
  const left = ITEMS.slice(0, mid);
  const right = ITEMS.slice(mid);

  const NavBtn = ({ it }: { it: Item }) => {
    const Icon = it.icon;
    const active = tab === it.id;
    return (
      <button onClick={() => setTab(it.id)} className="relative flex-1 flex flex-col items-center gap-1 py-2 px-1">
        {active && (
          <motion.span
            layoutId="navGlow"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="absolute top-1 bottom-1 inset-x-1 rounded-2xl bg-gradient-to-br from-[#7c3aed]/25 to-[#a855f7]/20 border border-purple-400/30"
          />
        )}
        <Icon className={`relative w-6 h-6 transition ${active ? 'text-[#ec4899]' : 'text-zinc-500'}`} strokeWidth={active ? 2.4 : 2} />
        <span className={`relative text-[10px] transition ${active ? 'text-[#ec4899] font-bold' : 'text-zinc-500'}`}>{it.label}</span>
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50">
      <div className="mx-3 mb-3 bg-[#14101c]/85 backdrop-blur-2xl border border-white/10 rounded-[30px] px-2 py-2 flex items-center justify-between relative shadow-[0_18px_50px_-12px_rgba(0,0,0,0.8)]">
        <div className="flex flex-1">
          {left.map((it) => (
            <NavBtn key={it.id} it={it} />
          ))}
        </div>

        {/* دکمه شناور ساخت (FAB) — سه‌بعدی و متحرک */}
        <motion.button
          onClick={() => setTab('create')}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          className="relative mx-1 -mt-9 w-[60px] h-[60px] rounded-[22px] bg-gradient-to-br from-[#f43f7f] to-[#e11d74] flex items-center justify-center shadow-[0_14px_34px_-8px_rgba(236,72,153,0.9)] shrink-0"
        >
          <span className="absolute inset-0 rounded-[22px] border-2 border-white/30 animate-[ping_2.4s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <Plus className="relative w-8 h-8 text-white" strokeWidth={3} />
        </motion.button>

        <div className="flex flex-1">
          {right.map((it) => (
            <NavBtn key={it.id} it={it} />
          ))}
        </div>
      </div>
    </div>
  );
}
