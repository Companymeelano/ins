'use client';

import React from 'react';
import { X, BellRing, AlertTriangle } from 'lucide-react';
import type { AlertRow } from './shared';

export function AlertsPanel({ alerts, onClose, reload }: { alerts: AlertRow[]; onClose: () => void; reload: () => void }) {
  const markAll = async () => { await fetch('/api/alerts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAll: true }) }); reload(); };
  const sevColor: Record<string, string> = { critical: '#f43f5e', warning: '#f59e0b', info: '#38bdf8' };
  const sevIcon: Record<string, React.ElementType> = { critical: AlertTriangle, warning: AlertTriangle, info: BellRing };
  return (
    <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-start justify-center" onClick={onClose}>
      <div className="w-full max-w-[480px] bg-[#0d0916] rounded-b-3xl max-h-[75vh] overflow-y-auto no-scrollbar fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#0d0916]/95 backdrop-blur px-5 py-4 flex items-center justify-between border-b border-white/5">
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#241d33] flex items-center justify-center"><X className="w-4 h-4 text-zinc-400" /></button>
          <div className="flex items-center gap-2">
            {alerts.some((a) => !a.read) && <button onClick={markAll} className="text-[11px] text-purple-300">خواندن همه</button>}
            <h3 className="font-bold text-white flex items-center gap-2">اعلان‌ها <BellRing className="w-4 h-4 text-amber-400" /></h3>
          </div>
        </div>
        <div className="p-4 space-y-2">
          {alerts.length === 0 && <p className="text-center text-zinc-500 text-sm py-10">اعلانی وجود ندارد ✓</p>}
          {alerts.map((a) => {
            const Icon = sevIcon[a.severity || 'info'];
            const color = sevColor[a.severity || 'info'];
            return (
              <div key={a.id} className={`rounded-2xl p-3 flex items-start gap-3 ${a.read ? 'bg-[#14101c]' : 'bg-[#1a1230] border border-purple-500/20'}`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}22` }}><Icon className="w-5 h-5" style={{ color }} /></div>
                <div className="flex-1 text-right min-w-0">
                  <p className="text-sm font-bold text-white">{a.title}</p>
                  {a.message && <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{a.message}</p>}
                  <p className="text-[9px] text-zinc-600 mt-1">{a.createdAt ? new Date(a.createdAt).toLocaleString('fa-IR') : ''}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
