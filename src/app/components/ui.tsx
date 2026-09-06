'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

type Variant = 'primary' | 'pink' | 'glass' | 'outline' | 'ghost' | 'success' | 'danger' | 'neon';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'text-white bg-gradient-to-r from-[#7c3aed] to-[#a855f7] shadow-[0_10px_30px_-8px_rgba(124,58,237,0.7)] btn-sheen',
  pink:
    'text-white bg-gradient-to-br from-[#f43f7f] to-[#e11d74] shadow-[0_10px_30px_-8px_rgba(236,72,153,0.8)] btn-sheen',
  success:
    'text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-[0_10px_30px_-8px_rgba(16,185,129,0.6)] btn-sheen',
  danger: 'text-rose-400 bg-rose-500/10 border border-rose-500/20',
  glass: 'text-white bg-white/[0.06] border border-white/10 backdrop-blur-xl',
  outline: 'text-purple-200 bg-[#1e1330] border border-purple-500/20',
  ghost: 'text-zinc-300 bg-transparent',
  neon: 'text-cyan-200 bg-[#06121a] border border-cyan-400/40 shadow-[0_0_22px_-2px_rgba(34,211,238,0.55)]',
};

const SIZES: Record<Size, string> = {
  sm: 'py-2.5 px-4 text-xs rounded-2xl gap-1.5',
  md: 'py-3.5 px-5 text-sm rounded-2xl gap-2',
  lg: 'py-4 px-6 text-sm rounded-[22px] gap-2',
};

export interface BtnProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
}

/** دکمه اختصاصی با انیمیشن فشار، شید متحرک و حالت‌های متنوع */
export function Btn({
  variant = 'primary',
  size = 'md',
  full,
  iconLeft,
  iconRight,
  loading,
  onClick,
  children,
  disabled,
  className = '',
  ...rest
}: BtnProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      onClick={() => !disabled && !loading && onClick?.()}
      disabled={disabled || loading}
      className={`relative overflow-hidden font-bold flex items-center justify-center select-none transition active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${full ? 'w-full' : ''} ${className}`}
      {...(rest as any)}
    >
      {loading && (
        <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
      )}
      {!loading && iconLeft}
      {children}
      {!loading && iconRight}
    </motion.button>
  );
}

/** دکمه آیکون گرد شناور/درون‌خطی */
export function IconBtn({
  children,
  onClick,
  variant = 'glass',
  size = 'md',
  className = '',
  active,
  ...rest
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: Variant | 'plain';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  active?: boolean;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>) {
  const sz = { sm: 'w-9 h-9 rounded-xl', md: 'w-11 h-11 rounded-2xl', lg: 'w-14 h-14 rounded-3xl' }[size];
  const base =
    variant === 'plain'
      ? 'text-zinc-300'
      : VARIANTS[variant as Variant];
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={() => onClick?.()}
      className={`relative flex items-center justify-center shrink-0 transition ${sz} ${base} ${active ? 'ring-2 ring-purple-400/60' : ''} ${className}`}
      {...(rest as any)}
    >
      {children}
    </motion.button>
  );
}

/** کارت شیشه‌ای */
export function GlassCard({ children, className = '', ...rest }: { children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-[#14101c]/80 backdrop-blur-xl border border-white/10 rounded-3xl ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

/** عنوان بخش با نوار رنگی */
export function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <h3 className="font-bold text-white mb-4 flex items-center gap-2 justify-end">
      <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-[#ec4899] to-[#a855f7]" />
      {icon}
      {children}
    </h3>
  );
}

/** چیپ/تگ قابل انتخاب */
export function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={() => onClick?.()}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${active ? 'bg-purple-600 text-white shadow-[0_6px_18px_-6px_rgba(124,58,237,0.8)]' : 'bg-[#241d33] text-zinc-400'}`}
    >
      {children}
    </button>
  );
}

/** سوئیچ (Toggle) اختصاصی */
export function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-14 h-8 rounded-full p-1 transition-colors ${on ? 'bg-gradient-to-r from-[#ec4899] to-[#a855f7]' : 'bg-[#2a2437]'}`}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={`w-6 h-6 rounded-full bg-white ${on ? 'ml-auto' : ''}`}
      />
    </button>
  );
}
