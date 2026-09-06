'use client';

import { createContext, useContext } from 'react';

export interface UICtx {
  /** باز کردن منوی کشویی (دراور) */
  openMenu: () => void;
  /** باز کردن پنل اعلان‌ها */
  openAlerts: () => void;
  /** تعداد اعلان‌های خوانده‌نشده */
  alertCount: number;
  /** وضعیت اتصال (آنلاین/آفلاین) */
  online: boolean;
}

export const UIContext = createContext<UICtx>({
  openMenu: () => {},
  openAlerts: () => {},
  alertCount: 0,
  online: true,
});

export const useUI = () => useContext(UIContext);
