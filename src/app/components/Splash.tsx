'use client';

import React from 'react';
import { motion } from 'framer-motion';

/** صفحه افتتاحیه (Splash) با نماد سه‌بعدی برند — حس یک اپلیکیشن اندرویدی واقعی */
export function Splash({ visible }: { visible: boolean }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0510]"
    >
      {/* هاله نور پس‌زمینه */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] max-w-[640px] max-h-[640px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.35),transparent_60%)] blur-2xl" />
      </div>

      <motion.div
        initial={{ scale: 0.4, opacity: 0, rotate: -12 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        className="relative"
      >
        {/* حلقه چرخان دور آیکون */}
        <div className="absolute inset-0 -m-6 rounded-[36px] border-2 border-dashed border-purple-400/30 animate-[spin_9s_linear_infinite]" />
        <img
          src="/icons/icon-192.png"
          alt="میلانو"
          className="w-32 h-32 rounded-[34px] shadow-[0_20px_60px_-10px_rgba(236,72,153,0.7)]"
        />
      </motion.div>

      <motion.h1
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, type: 'spring', stiffness: 200, damping: 18 }}
        className="mt-7 text-4xl font-black text-white tracking-tight"
      >
        میلانو
      </motion.h1>
      <motion.p
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-1 text-sm text-zinc-400"
      >
        استودیو هوشمند مدیریت اینستاگرام
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-9 flex items-center gap-2 text-xs text-zinc-500"
      >
        <span className="w-4 h-4 rounded-full border-2 border-zinc-600 border-t-purple-400 animate-spin" />
        در حال بارگذاری...
      </motion.div>
    </motion.div>
  );
}
