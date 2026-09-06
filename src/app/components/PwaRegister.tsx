'use client';

import { useEffect } from 'react';

/** ثبت Service Worker برای نصب‌پذیری و کار آفلاین (حس اپلیکیشن اندرویدی) */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
  return null;
}
