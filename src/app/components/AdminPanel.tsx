'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ShieldAlert, ScrollText, ToggleLeft, FlaskConical } from 'lucide-react';

function toFa(n: number | string): string { return String(n).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]); }

interface Log { id: number; actor: string | null; action: string; category: string | null; detail: string | null; createdAt: string | null }
interface Flag { id: number; key: string; enabled: boolean | null; description: string | null }
interface AbStat { variant: string; event: string; count: number }

export function AdminPanel({ toast }: { toast: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [ab, setAb] = useState<AbStat[]>([]);
  const [tab, setTab] = useState<'logs' | 'flags' | 'ab'>('logs');

  const load = () => fetch('/api/admin').then((r) => r.json()).then((d) => { if (d.success) { setLogs(d.logs); setFlags(d.flags); setAb(d.abStats); } }).catch(() => {});
  useEffect(() => { if (open) load(); }, [open]);

  const toggleFlag = async (key: string, enabled: boolean) => {
    setFlags((f) => f.map((x) => x.key === key ? { ...x, enabled } : x));
    await fetch('/api/admin', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ flagKey: key, enabled }) }).catch(() => {});
    toast(`${enabled ? 'فعال' : 'غیرفعال'} شد`);
  };

  const catColor: Record<string, string> = { ai: '#a855f7', auth: '#38bdf8', content: '#10b981', proxy: '#f59e0b', general: '#71717a' };

  return (
    <div className="mx-5 mb-5 bg-[#14101c] border border-amber-500/20 rounded-3xl p-5">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between mb-1">
        <ChevronLeft className={`w-4 h-4 text-zinc-500 transition ${open ? '-rotate-90' : ''}`} />
        <h3 className="font-bold text-white flex items-center gap-2">پنل مدیر <ShieldAlert className="w-4 h-4 text-amber-400" /></h3>
      </button>
      {open && (
        <div className="fade-up mt-4">
          <div className="bg-[#0d0916] rounded-2xl p-1 flex gap-1 mb-4">
            {([['logs', 'رویدادها', ScrollText], ['flags', 'قابلیت‌ها', ToggleLeft], ['ab', 'A/B تست', FlaskConical]] as const).map(([k, l, Icon]) => (
              <button key={k} onClick={() => setTab(k)} className={`flex-1 py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 ${tab === k ? 'bg-purple-600 text-white' : 'text-zinc-400'}`}><Icon className="w-3.5 h-3.5" /> {l}</button>
            ))}
          </div>

          {tab === 'logs' && (
            <div className="space-y-1.5 max-h-80 overflow-y-auto no-scrollbar">
              {logs.length === 0 && <p className="text-center text-zinc-600 text-xs py-4">رویدادی ثبت نشده</p>}
              {logs.map((l) => (
                <div key={l.id} className="bg-[#0d0916] rounded-xl p-2.5 flex items-center gap-2">
                  <span className="text-[9px] text-zinc-600 shrink-0">{l.createdAt ? new Date(l.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded shrink-0" style={{ background: `${catColor[l.category || 'general']}22`, color: catColor[l.category || 'general'] }}>{l.category}</span>
                  <div className="flex-1 text-right min-w-0"><p className="text-[11px] text-white truncate">{l.action}</p>{l.detail && <p className="text-[9px] text-zinc-500 truncate">{l.detail}</p>}</div>
                  <span className="text-[9px] text-zinc-500 shrink-0">{l.actor}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'flags' && (
            <div className="space-y-2">
              {flags.map((f) => (
                <div key={f.key} className="bg-[#0d0916] rounded-2xl p-3 flex items-center gap-3">
                  <button onClick={() => toggleFlag(f.key, !f.enabled)} className={`w-11 h-6 rounded-full p-0.5 transition shrink-0 ${f.enabled ? 'bg-gradient-to-r from-[#ec4899] to-[#a855f7]' : 'bg-[#2a2437]'}`}><div className={`w-5 h-5 rounded-full bg-white transition-transform ${f.enabled ? '' : 'translate-x-5'}`} /></button>
                  <div className="flex-1 text-right"><p className="text-xs text-white" dir="ltr">{f.key}</p><p className="text-[10px] text-zinc-500">{f.description}</p></div>
                </div>
              ))}
            </div>
          )}

          {tab === 'ab' && (
            <div className="space-y-2">
              <p className="text-[11px] text-zinc-500 text-right mb-2">مقایسه عملکرد نسخه‌های prompt</p>
              {ab.length === 0 && <p className="text-center text-zinc-600 text-xs py-4">داده A/B هنوز جمع نشده</p>}
              {ab.map((s, i) => (
                <div key={i} className="bg-[#0d0916] rounded-xl p-2.5 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{toFa(s.count)}</span>
                  <div className="text-right"><span className="text-[11px] text-purple-300">{s.variant}</span> <span className="text-[10px] text-zinc-500">• {s.event}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
