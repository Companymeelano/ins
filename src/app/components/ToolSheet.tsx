'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, GripVertical } from 'lucide-react';

/** ورقه پایینی (Bottom Sheet) برای نمایش یکی از ابزارهای هوشمند از منوی کشویی */
export function ToolSheet({
  title,
  icon,
  onClose,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
      />
      <motion.section
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        className="fixed inset-x-0 bottom-0 z-[80] mx-auto w-full max-w-[480px] h-[92vh] bg-[#0a0510] rounded-t-[32px] border-t border-white/10 shadow-2xl flex flex-col"
      >
        {/* دستگیره */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-white/15" />
        </div>
        {/* هدر */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition">
            <X className="w-4 h-4 text-zinc-300" />
          </button>
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="font-bold text-white text-sm">{title}</h2>
          </div>
          <GripVertical className="w-4 h-4 text-zinc-700" />
        </div>
        {/* محتوا */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-10">{children}</div>
      </motion.section>
    </>
  );
}
