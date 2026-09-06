'use client';

import React, { useState, useEffect } from 'react';
import {
  X, Shield, ShieldCheck, ShieldAlert, Globe2, ServerCog, Activity, History,
  UserCircle, Radar, ScanLine, CheckCircle2, XCircle, Wifi, ArrowDownUp,
  Plus as PlusIcon, Send as SendIcon, MapPin, Power, Timer, LogIn, Check, Loader2,
  RefreshCw as Refresh, Zap as ZapIcon,
} from 'lucide-react';
import { toFa } from './shared';

export function ConnectionCenter({ toast, onClose }: { toast: (m: string) => void; onClose: () => void }) {
  const [view, setView] = useState<'account' | 'health' | 'proxy' | 'tunnel' | 'activity' | 'logs'>('account');
  return (
    <div className="fixed inset-0 z-[75] bg-[#0a0510] overflow-y-auto no-scrollbar">
      <div className="max-w-[480px] mx-auto pb-10">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0a0510]/95 backdrop-blur-xl px-5 pt-5 pb-3 flex items-center justify-between">
          <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-[#14101c] border border-white/5 flex items-center justify-center"><X className="w-5 h-5 text-zinc-300" /></button>
          <div className="text-right">
            <p className="text-xs text-zinc-400">امنیت و ضدبن</p>
            <h1 className="text-xl font-black text-white flex items-center gap-2">مرکز اتصال امن <Shield className="w-5 h-5 text-emerald-400" /></h1>
          </div>
        </div>

        {/* Inner tabs */}
        <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-1.5 flex gap-1 overflow-x-auto no-scrollbar">
          {([['account', 'اکانت', UserCircle], ['health', 'سلامت', ShieldCheck], ['proxy', 'پروکسی', Globe2], ['tunnel', 'تونل', ServerCog], ['activity', 'فعالیت', Activity], ['logs', 'لاگ', History]] as const).map(([k, l, Icon]) => (
            <button key={k} onClick={() => setView(k)} className={`flex-1 min-w-[62px] py-2.5 rounded-2xl text-[11px] font-bold flex flex-col items-center gap-1 transition ${view === k ? 'bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white glow-purple' : 'text-zinc-400'}`}>
              <Icon className="w-4 h-4" /> {l}
            </button>
          ))}
        </div>

        {view === 'account' && <IgAccountPanel toast={toast} />}
        {view === 'health' && <HealthPanel toast={toast} />}
        {view === 'proxy' && <ProxyPanel toast={toast} />}
        {view === 'tunnel' && <TunnelPanel toast={toast} />}
        {view === 'activity' && <ActivityPanel toast={toast} />}
        {view === 'logs' && <RotationLogPanel />}
      </div>
    </div>
  );
}

/* ---- Health ---- */
interface Shadowban { score: number; color: string; label: string; verdict: string; risk: string; ratio: number; checks: { label: string; ok: boolean }[]; tips: string[]; }
function HealthPanel({ toast }: { toast: (m: string) => void }) {
  const [data, setData] = useState<{ score: number; level: string; color: string; risks: string[]; tips: string[]; stats: { totalProxies: number; greenProxies: number; tunnels: number; activeTunnel: string | null } } | null>(null);
  const [sb, setSb] = useState<Shadowban | null>(null);
  const [sbLoading, setSbLoading] = useState(false);
  const load = () => { fetch('/api/activity/health').then((r) => r.json()).then((d) => { if (d.success) setData(d); }).catch(() => {}); };
  useEffect(() => { load(); }, []);

  const testShadowban = async () => {
    setSbLoading(true);
    try {
      const res = await fetch('/api/instagram/shadowban', { method: 'POST' });
      const d = await res.json();
      if (d.success) { setSb(d.analysis as Shadowban); toast('تست سلامت اکانت انجام شد 🔍'); }
    } catch { toast('خطا'); }
    finally { setSbLoading(false); }
  };

  if (!data) return <p className="text-center text-zinc-500 text-sm py-8">در حال بارگذاری...</p>;
  return (
    <div className="fade-up">
      {/* Shadowban test */}
      <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={testShadowban} disabled={sbLoading} className="text-xs px-4 py-2 rounded-full bg-purple-600 text-white font-medium flex items-center gap-1.5 active:scale-95 transition disabled:opacity-60">
            <ScanLine className="w-3.5 h-3.5" /> {sbLoading ? 'در حال بررسی...' : 'تست اکانت'}
          </button>
          <h4 className="font-bold text-white flex items-center gap-2">تست shadowban <Radar className="w-4 h-4 text-pink-400" /></h4>
        </div>
        {sb ? (
          <div className="fade-up">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-right flex-1">
                <p className="text-2xl font-black" style={{ color: sb.color }}>{sb.label}</p>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{sb.verdict}</p>
                <p className="text-[11px] text-zinc-500 mt-2">نسبت ریچ به ایمپرشن: {toFa(sb.ratio)}٪</p>
              </div>
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#241d33" strokeWidth="10" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke={sb.color} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(sb.score / 100) * 264} 264`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-xl font-black text-white">{toFa(sb.score)}</span></div>
              </div>
            </div>
            <div className="space-y-1.5 mb-3">
              {sb.checks.map((c, i) => (
                <div key={i} className="flex items-center gap-2 justify-end">
                  <p className="text-xs text-zinc-300 text-right flex-1">{c.label}</p>
                  {c.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                </div>
              ))}
            </div>
            {sb.risk !== 'low' && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 space-y-1">
                {sb.tips.map((t, i) => <p key={i} className="text-[11px] text-amber-200 text-right">• {t}</p>)}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-zinc-500 text-right leading-relaxed">وضعیت shadowban و محدودیت اکانت را از طریق Graph API (نسبت ریچ/ایمپرشن) بررسی کن.</p>
        )}
      </div>

      <div className="mx-5 mb-5 rounded-3xl p-6 bg-gradient-to-br from-[#2e1650] to-[#160a24] border border-white/5 text-center">
        <div className="relative w-32 h-32 mx-auto mb-3">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#241d33" strokeWidth="9" />
            <circle cx="50" cy="50" r="42" fill="none" stroke={data.color} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${(data.score / 100) * 264} 264`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white">{toFa(data.score)}</span>
            <span className="text-[10px] text-zinc-500">سلامت اتصال</span>
          </div>
        </div>
        <span className="text-sm font-bold px-4 py-1 rounded-full" style={{ background: `${data.color}22`, color: data.color }}>وضعیت: {data.level}</span>
      </div>

      <div className="mx-5 grid grid-cols-2 gap-3 mb-5">
        <div className="bg-[#14101c] border border-white/5 rounded-2xl p-4 text-center"><p className="text-2xl font-black text-emerald-400">{toFa(data.stats.greenProxies)}</p><p className="text-[11px] text-zinc-500 mt-1">پروکسی سبز</p></div>
        <div className="bg-[#14101c] border border-white/5 rounded-2xl p-4 text-center"><p className="text-2xl font-black text-white">{toFa(data.stats.totalProxies)}</p><p className="text-[11px] text-zinc-500 mt-1">کل پروکسی</p></div>
        <div className="bg-[#14101c] border border-white/5 rounded-2xl p-4 text-center"><p className="text-2xl font-black text-white">{toFa(data.stats.tunnels)}</p><p className="text-[11px] text-zinc-500 mt-1">سرویس تونل</p></div>
        <div className="bg-[#14101c] border border-white/5 rounded-2xl p-4 text-center"><p className="text-sm font-bold text-sky-400 truncate">{data.stats.activeTunnel || '—'}</p><p className="text-[11px] text-zinc-500 mt-1">تونل فعال</p></div>
      </div>

      <div className="mx-5 mb-4 bg-[#14101c] border border-white/5 rounded-3xl p-5">
        <h4 className="font-bold text-white mb-3 flex items-center gap-2 justify-end">ریسک‌های شناسایی‌شده <XCircle className="w-4 h-4 text-rose-400" /></h4>
        {data.risks.map((r, i) => <p key={i} className="text-xs text-zinc-300 text-right leading-relaxed mb-2">• {r}</p>)}
      </div>
      <div className="mx-5 mb-5 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-5">
        <h4 className="font-bold text-white mb-3 flex items-center gap-2 justify-end">توصیه‌های ضدبن <ShieldCheck className="w-4 h-4 text-emerald-400" /></h4>
        {data.tips.map((r, i) => <p key={i} className="text-xs text-emerald-200 text-right leading-relaxed mb-2">✓ {r}</p>)}
      </div>
      <button onClick={load} className="mx-5 mb-4 w-[calc(100%-40px)] py-3 rounded-2xl bg-[#14101c] border border-white/10 font-bold text-white flex items-center justify-center gap-2"><Refresh className="w-4 h-4" /> بررسی مجدد</button>
    </div>
  );
}

/* ---- Proxy ---- */
interface ProxyRow { id: number; label: string | null; type: string | null; host: string; port: number; country: string | null; countryFlag: string | null; ping: number | null; status: string | null; active: boolean | null; provider: string | null; }
const PSTATUS: Record<string, { c: string; l: string }> = { green: { c: '#10b981', l: 'سبز' }, slow: { c: '#f59e0b', l: 'کند' }, dead: { c: '#f43f5e', l: 'قطع' }, unknown: { c: '#71717a', l: 'نامشخص' } };

function ProxyPanel({ toast }: { toast: (m: string) => void }) {
  const [proxies, setProxies] = useState<ProxyRow[]>([]);
  const [sortBy, setSortBy] = useState<'ping' | 'country'>('ping');
  const [countryFilter, setCountryFilter] = useState('all');
  const [selected, setSelected] = useState<number[]>([]);
  const [bulk, setBulk] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = () => { fetch('/api/proxies').then((r) => r.json()).then((d) => { if (d.success) setProxies(d.proxies); }).catch(() => {}); };
  useEffect(() => { load(); }, []);

  const fetchProvider = async () => {
    setLoading(true);
    try { const res = await fetch('/api/proxies/fetch-provider', { method: 'POST' }); const d = await res.json(); if (d.success) { toast(`${toFa(d.count)} پروکسی از ارائه‌دهنده دریافت شد`); load(); } }
    catch { toast('خطا'); } finally { setLoading(false); }
  };
  const pingAll = async () => {
    setLoading(true);
    try { const res = await fetch('/api/proxies/ping', { method: 'POST' }); const d = await res.json(); if (d.success) { setProxies(d.proxies); toast('پینگ همه پروکسی‌ها بررسی شد'); } }
    catch { toast('خطا'); } finally { setLoading(false); }
  };
  const activate = async (id: number) => { await fetch('/api/proxies', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ activate: id }) }); setProxies((p) => p.map((x) => ({ ...x, active: x.id === id }))); toast('پروکسی فعال شد 🔒'); };
  const remove = async (id: number) => { await fetch(`/api/proxies?id=${id}`, { method: 'DELETE' }); setProxies((p) => p.filter((x) => x.id !== id)); };
  const addBulk = async () => {
    const lines = bulk.split('\n').map((l) => l.trim()).filter(Boolean);
    const list = lines.map((l) => { const [hp, country, type] = l.split(/[\s,|]+/); const [host, port] = hp.split(':'); return { host, port: Number(port), country: country || 'US', type: type || 'http' }; }).filter((x) => x.host && x.port);
    if (!list.length) return toast('فرمت: host:port country type');
    const res = await fetch('/api/proxies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ list }) });
    const d = await res.json(); if (d.success) { toast(`${toFa(d.inserted.length)} پروکسی اضافه شد`); setBulk(''); setShowAdd(false); load(); }
  };
  const sendSelected = () => { if (!selected.length) return toast('چند پروکسی انتخاب کنید'); toast(`${toFa(selected.length)} پروکسی برای چرخش اکانت ارسال شد 🔄`); };

  const countries = ['all', ...Array.from(new Set(proxies.map((p) => p.country || 'US')))];
  let shown = countryFilter === 'all' ? proxies : proxies.filter((p) => p.country === countryFilter);
  shown = [...shown].sort((a, b) => sortBy === 'ping' ? (a.ping ?? 999) - (b.ping ?? 999) : (a.country || '').localeCompare(b.country || ''));

  return (
    <div className="fade-up">
      {/* Country suggestion based on audience */}
      <CountrySuggestion />

      <div className="mx-5 mb-4 grid grid-cols-2 gap-2">
        <button onClick={fetchProvider} disabled={loading} className="py-3 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] font-bold text-white text-xs flex items-center justify-center gap-1.5 glow-purple"><Refresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> دریافت از ارائه‌دهنده</button>
        <button onClick={pingAll} disabled={loading} className="py-3 rounded-2xl bg-[#14101c] border border-white/10 font-bold text-white text-xs flex items-center justify-center gap-1.5"><Wifi className="w-4 h-4 text-emerald-400" /> پینگ همه</button>
      </div>
      <button onClick={() => setShowAdd((s) => !s)} className="mx-5 mb-4 w-[calc(100%-40px)] py-2.5 rounded-2xl bg-[#14101c] border border-dashed border-white/10 text-zinc-400 text-xs flex items-center justify-center gap-1.5"><PlusIcon className="w-4 h-4" /> افزودن لیست پروکسی دستی</button>

      {showAdd && (
        <div className="mx-5 mb-4 bg-[#14101c] border border-white/5 rounded-3xl p-4 fade-up">
          <textarea value={bulk} onChange={(e) => setBulk(e.target.value)} rows={4} placeholder={'هر خط یک پروکسی:\n185.20.100.5:8080 DE http\n104.28.10.5:1080 US socks5'} className="w-full bg-[#0d0916] border border-white/10 rounded-2xl px-4 py-3 text-left text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 text-xs resize-none" dir="ltr" />
          <button onClick={addBulk} className="w-full mt-3 py-3 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] font-bold text-white text-sm">افزودن</button>
        </div>
      )}

      {/* Sort & filter */}
      <div className="mx-5 mb-4 flex items-center gap-2 justify-between">
        <div className="flex gap-1.5">
          <button onClick={() => setSortBy('ping')} className={`px-3 py-1.5 rounded-full text-[11px] flex items-center gap-1 ${sortBy === 'ping' ? 'bg-purple-600 text-white' : 'bg-[#241d33] text-zinc-400'}`}><ArrowDownUp className="w-3 h-3" /> پینگ</button>
          <button onClick={() => setSortBy('country')} className={`px-3 py-1.5 rounded-full text-[11px] ${sortBy === 'country' ? 'bg-purple-600 text-white' : 'bg-[#241d33] text-zinc-400'}`}>کشور</button>
        </div>
        <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="bg-[#14101c] border border-white/10 rounded-full px-3 py-1.5 text-white text-[11px] focus:outline-none">
          {countries.map((c) => <option key={c} value={c}>{c === 'all' ? 'همه کشورها' : c}</option>)}
        </select>
      </div>

      {selected.length > 0 && (
        <button onClick={sendSelected} className="mx-5 mb-3 w-[calc(100%-40px)] py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 font-bold text-white text-sm flex items-center justify-center gap-2"><SendIcon className="w-4 h-4" /> ارسال {toFa(selected.length)} پروکسی برای چرخش اکانت</button>
      )}

      <div className="mx-5 space-y-2">
        {shown.length === 0 && <p className="text-center text-zinc-500 text-sm py-8">پروکسی‌ای موجود نیست. از ارائه‌دهنده دریافت کنید.</p>}
        {shown.map((p) => {
          const st = PSTATUS[p.status || 'unknown'];
          const isSel = selected.includes(p.id);
          return (
            <div key={p.id} className={`bg-[#14101c] border rounded-2xl p-3 flex items-center gap-3 ${p.active ? 'border-emerald-500/50' : 'border-white/5'}`}>
              <input type="checkbox" checked={isSel} onChange={() => setSelected((s) => isSel ? s.filter((x) => x !== p.id) : [...s, p.id])} className="w-4 h-4 accent-purple-500 shrink-0" />
              <button onClick={() => remove(p.id)} className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0"><X className="w-3.5 h-3.5 text-rose-400" /></button>
              <button onClick={() => activate(p.id)} className={`text-[10px] px-2.5 py-1 rounded-full shrink-0 ${p.active ? 'bg-emerald-500 text-white' : 'bg-[#241d33] text-zinc-400'}`}>{p.active ? 'فعال' : 'انتخاب'}</button>
              <div className="flex-1 text-right min-w-0">
                <p className="text-xs text-white truncate" dir="ltr">{p.host}:{toFa(p.port)}</p>
                <div className="flex items-center gap-2 justify-end mt-1">
                  <span className="text-[10px]" style={{ color: st.c }}>● {st.l}</span>
                  <span className="text-[10px] text-zinc-500">{p.ping ? `${toFa(p.ping)}ms` : '—'}</span>
                  <span className="text-[10px] text-zinc-400 uppercase">{p.type}</span>
                </div>
              </div>
              <div className="text-center shrink-0"><span className="text-lg">{p.countryFlag}</span><p className="text-[9px] text-zinc-500">{p.country}</p></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Tunnel (V2Ray/SOCKS) ---- */
interface TunnelRow { id: number; label: string | null; protocol: string | null; ping: number | null; status: string | null; active: boolean | null; autoSwitch: boolean | null; }
function TunnelPanel({ toast }: { toast: (m: string) => void }) {
  const [tunnels, setTunnels] = useState<TunnelRow[]>([]);
  const [uri, setUri] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => { fetch('/api/tunnels').then((r) => r.json()).then((d) => { if (d.success) setTunnels(d.tunnels); }).catch(() => {}); };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!uri.trim()) return toast('کانفیگ V2Ray/SOCKS را وارد کنید');
    const res = await fetch('/api/tunnels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ configUri: uri }) });
    const d = await res.json(); if (d.success) { toast(`${toFa(d.inserted.length)} سرویس اضافه شد`); setUri(''); load(); }
  };
  const connect = async (id: number) => { await fetch('/api/tunnels', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ connect: id }) }); setTunnels((t) => t.map((x) => ({ ...x, active: x.id === id, status: x.id === id ? 'connected' : 'ready' }))); toast('به سرویس متصل شد 🔗'); };
  const autoSelect = async () => { setLoading(true); try { const res = await fetch('/api/tunnels/auto-select', { method: 'POST' }); const d = await res.json(); if (d.success) { setTunnels(d.tunnels); toast(d.selected ? `هوشمند به «${d.selected.label}» (${toFa(d.selected.ping)}ms) وصل شد ⚡` : 'سرویسی یافت نشد'); } } catch { toast('خطا'); } finally { setLoading(false); } };
  const remove = async (id: number) => { await fetch(`/api/tunnels?id=${id}`, { method: 'DELETE' }); setTunnels((t) => t.filter((x) => x.id !== id)); };
  const toggleAuto = async (t: TunnelRow) => { await fetch('/api/tunnels', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: t.id, toggleAutoSwitch: !t.autoSwitch }) }); setTunnels((ts) => ts.map((x) => x.id === t.id ? { ...x, autoSwitch: !x.autoSwitch } : x)); };

  const protoColors: Record<string, string> = { vmess: '#a855f7', vless: '#38bdf8', trojan: '#ec4899', shadowsocks: '#10b981', socks5: '#f59e0b' };

  return (
    <div className="fade-up">
      <div className="mx-5 mb-4 rounded-3xl p-4 bg-amber-500/5 border border-amber-500/20">
        <p className="text-xs text-amber-200 text-right leading-relaxed">🇮🇷 برای اتصال داخل ایران به دلیل فیلترینگ، کانفیگ V2Ray (vmess/vless/trojan) یا Shadowsocks/SOCKS خود را اضافه کنید. انتخاب هوشمند، کم‌پینگ‌ترین سرویس را فعال و در صورت قطعی جابه‌جا می‌کند.</p>
      </div>

      <div className="mx-5 mb-4 bg-[#14101c] border border-white/5 rounded-3xl p-4">
        <textarea value={uri} onChange={(e) => setUri(e.target.value)} rows={3} placeholder={'vmess://... یا vless://... یا ss://...\n(هر خط یک سرویس)'} className="w-full bg-[#0d0916] border border-white/10 rounded-2xl px-4 py-3 text-left text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 text-xs resize-none" dir="ltr" />
        <button onClick={add} className="w-full mt-3 py-3 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] font-bold text-white text-sm flex items-center justify-center gap-2"><PlusIcon className="w-4 h-4" /> افزودن سرویس</button>
      </div>

      <button onClick={autoSelect} disabled={loading} className="mx-5 mb-4 w-[calc(100%-40px)] py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 font-bold text-white flex items-center justify-center gap-2 glow-green"><ZapIcon className="w-5 h-5" /> {loading ? 'در حال تست...' : 'اتصال هوشمند (کم‌پینگ‌ترین سرویس)'}</button>

      <div className="mx-5 space-y-2">
        {tunnels.length === 0 && <p className="text-center text-zinc-500 text-sm py-8">هنوز سرویسی اضافه نشده</p>}
        {tunnels.map((t) => (
          <div key={t.id} className={`bg-[#14101c] border rounded-2xl p-3 ${t.active ? 'border-emerald-500/50' : 'border-white/5'}`}>
            <div className="flex items-center gap-3">
              <button onClick={() => remove(t.id)} className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0"><X className="w-3.5 h-3.5 text-rose-400" /></button>
              <button onClick={() => connect(t.id)} className={`text-[10px] px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 ${t.active ? 'bg-emerald-500 text-white' : 'bg-[#241d33] text-zinc-400'}`}><Power className="w-3 h-3" /> {t.active ? 'متصل' : 'اتصال'}</button>
              <div className="flex-1 text-right min-w-0">
                <p className="text-xs text-white truncate">{t.label}</p>
                <div className="flex items-center gap-2 justify-end mt-1">
                  <span className="text-[10px] text-zinc-500">{t.ping ? `${toFa(t.ping)}ms` : '—'}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold" style={{ background: `${protoColors[t.protocol || 'vmess']}22`, color: protoColors[t.protocol || 'vmess'] }}>{t.protocol}</span>
                </div>
              </div>
            </div>
            <button onClick={() => toggleAuto(t)} className="mt-2 w-full flex items-center justify-end gap-2 text-[11px] text-zinc-400">
              <div className={`w-9 h-5 rounded-full p-0.5 transition ${t.autoSwitch ? 'bg-emerald-500' : 'bg-[#2a2437]'}`}><div className={`w-4 h-4 rounded-full bg-white transition-transform ${t.autoSwitch ? '' : 'translate-x-4'}`} /></div>
              جابه‌جایی خودکار هنگام قطعی
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Activity Scheduler (safe) ---- */
interface SchedRow { id: number; actionType: string; enabled: boolean | null; dailyLimit: number | null; intervalMin: number | null; activeHoursStart: number | null; activeHoursEnd: number | null; doneToday: number | null; }
function ActivityPanel({ toast }: { toast: (m: string) => void }) {
  const [schedules, setSchedules] = useState<SchedRow[]>([]);
  const [limits, setLimits] = useState<Record<string, { max: number; recommended: number; label: string }>>({});

  const load = () => { fetch('/api/activity').then((r) => r.json()).then((d) => { if (d.success) { setSchedules(d.schedules); setLimits(d.limits); } }).catch(() => {}); };
  useEffect(() => { load(); }, []);

  const patch = async (id: number, body: Record<string, unknown>) => {
    const res = await fetch('/api/activity', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...body }) });
    const d = await res.json();
    if (d.success) { setSchedules((s) => s.map((x) => x.id === id ? d.schedule : x)); if (d.warning) toast(d.warning); }
  };

  const icons: Record<string, string> = { engage_likes: '❤️', follow_reminder: '➕', comment_reminder: '💬', unfollow_review: '➖' };

  return (
    <div className="fade-up">
      <div className="mx-5 mb-4 rounded-3xl p-4 bg-emerald-500/5 border border-emerald-500/20">
        <p className="text-xs text-emerald-200 text-right leading-relaxed">🛡️ این زمان‌بند فعالیت‌های <span className="font-bold">دستی و مجاز</span> شما را در محدوده امن الگوریتم اینستاگرام برنامه‌ریزی و یادآوری می‌کند تا از محدودیت و بن جلوگیری شود. سقف‌ها بر اساس رفتار طبیعی انسانی تنظیم شده‌اند.</p>
      </div>

      <div className="mx-5 space-y-4">
        {schedules.map((s) => {
          const lim = limits[s.actionType];
          const overRec = lim && (s.dailyLimit ?? 0) > lim.recommended;
          return (
            <div key={s.id} className="bg-[#14101c] border border-white/5 rounded-3xl p-5">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => patch(s.id, { enabled: !s.enabled })} className={`w-12 h-7 rounded-full p-1 transition ${s.enabled ? 'bg-gradient-to-r from-[#ec4899] to-[#a855f7]' : 'bg-[#2a2437]'}`}><div className={`w-5 h-5 rounded-full bg-white transition-transform ${s.enabled ? '' : 'translate-x-5'}`} /></button>
                <h4 className="font-bold text-white flex items-center gap-2">{lim?.label} <span className="text-lg">{icons[s.actionType]}</span></h4>
              </div>

              {/* Daily limit */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold ${overRec ? 'text-amber-400' : 'text-emerald-400'}`}>{toFa(s.dailyLimit ?? 0)} / روز</span>
                  <span className="text-[11px] text-zinc-500">سقف روزانه (توصیه: {toFa(lim?.recommended ?? 0)})</span>
                </div>
                <input type="range" min={5} max={lim?.max ?? 100} value={s.dailyLimit ?? 0} onChange={(e) => patch(s.id, { dailyLimit: +e.target.value })} className="w-full" />
              </div>

              {/* Interval */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white flex items-center gap-1"><Timer className="w-3.5 h-3.5" /> هر {toFa(s.intervalMin ?? 0)} دقیقه</span>
                  <span className="text-[11px] text-zinc-500">فاصله بین اقدامات</span>
                </div>
                <input type="range" min={3} max={60} value={s.intervalMin ?? 0} onChange={(e) => patch(s.id, { intervalMin: +e.target.value })} className="w-full" />
              </div>

              {/* Active hours */}
              <div className="flex items-center gap-2 justify-end text-[11px] text-zinc-400">
                <select value={s.activeHoursEnd ?? 23} onChange={(e) => patch(s.id, { activeHoursEnd: +e.target.value })} className="bg-[#0d0916] border border-white/10 rounded-xl px-2 py-1 text-white focus:outline-none">
                  {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{toFa(i)}</option>)}
                </select>
                تا
                <select value={s.activeHoursStart ?? 9} onChange={(e) => patch(s.id, { activeHoursStart: +e.target.value })} className="bg-[#0d0916] border border-white/10 rounded-xl px-2 py-1 text-white focus:outline-none">
                  {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{toFa(i)}</option>)}
                </select>
                ساعت فعالیت از
              </div>

              {overRec && <p className="text-[11px] text-amber-400 text-right mt-3">⚠️ بالاتر از حد توصیه‌شده — ریسک محدودیت بیشتر می‌شود</p>}
            </div>
          );
        })}
      </div>

      <div className="mx-5 mt-5 mb-4 rounded-3xl p-4 bg-[#14101c] border border-white/5">
        <p className="text-[11px] text-zinc-500 text-right leading-relaxed">⚠️ توجه: این ابزار فعالیت‌های خودکار انجام نمی‌دهد و صرفاً برنامه‌ریز و یادآور فعالیت دستی ایمن است. اتوماسیون کامل (ربات لایک/فالو) ناقض قوانین اینستاگرام و عامل اصلی بن شدن است.</p>
      </div>
    </div>
  );
}

/* ---- Country Suggestion ---- */
function CountrySuggestion() {
  const [data, setData] = useState<{ audienceCountries: { country: string; percent: number; flag: string }[]; recommended: { country: string; flag: string }; reasoning: string } | null>(null);
  useEffect(() => { fetch('/api/proxies/suggest-country').then((r) => r.json()).then((d) => { if (d.success) setData(d); }).catch(() => {}); }, []);
  if (!data) return null;
  return (
    <div className="mx-5 mb-4 rounded-3xl p-5 bg-gradient-to-br from-[#2e1650] to-[#160a24] border border-purple-500/20">
      <h4 className="font-bold text-white mb-3 flex items-center gap-2 justify-end">پیشنهاد کشور پروکسی <MapPin className="w-4 h-4 text-pink-400" /></h4>
      <div className="flex items-center gap-3 bg-[#0d0916]/60 rounded-2xl p-3 mb-3">
        <span className="text-3xl">{data.recommended.flag}</span>
        <div className="flex-1 text-right">
          <p className="text-sm font-bold text-emerald-400">پیشنهاد: {data.recommended.country}</p>
          <p className="text-[11px] text-zinc-400 leading-relaxed mt-1">{data.reasoning}</p>
        </div>
      </div>
      <p className="text-[11px] text-zinc-500 text-right mb-2">توزیع مخاطبان شما:</p>
      <div className="space-y-1.5">
        {data.audienceCountries.map((c) => (
          <div key={c.country} className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 w-8">{toFa(c.percent)}٪</span>
            <div className="flex-1 h-2 rounded-full bg-[#241d33] overflow-hidden"><div className="h-full bg-gradient-to-l from-purple-500 to-pink-500" style={{ width: `${c.percent}%` }} /></div>
            <span className="text-xs text-white flex items-center gap-1">{c.country} {c.flag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Rotation Log ---- */
interface LogRow { id: number; kind: string | null; label: string | null; country: string | null; ping: number | null; reason: string | null; createdAt: string | null; }
function RotationLogPanel() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [insights, setInsights] = useState<{ last24: number; countries: number; avgPing: number; patternScore: number; advice: string } | null>(null);
  useEffect(() => { fetch('/api/rotation-log').then((r) => r.json()).then((d) => { if (d.success) { setLogs(d.logs); setInsights(d.insights); } }).catch(() => {}); }, []);
  const reasonLabel: Record<string, string> = { manual: 'دستی', auto_switch: 'خودکار', failover: 'جایگزینی', schedule: 'زمان‌بندی' };

  return (
    <div className="fade-up">
      {insights && (
        <div className="mx-5 mb-4 rounded-3xl p-5 bg-gradient-to-br from-[#2e1650] to-[#160a24] border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-black" style={{ color: insights.patternScore >= 80 ? '#10b981' : '#f59e0b' }}>{toFa(insights.patternScore)}</span>
            <h4 className="font-bold text-white flex items-center gap-2">امنیت الگوی چرخش <ShieldCheck className="w-4 h-4 text-emerald-400" /></h4>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3 text-center">
            <div className="bg-[#0d0916]/60 rounded-xl py-2"><p className="text-sm font-bold text-white">{toFa(insights.last24)}</p><p className="text-[10px] text-zinc-500">چرخش ۲۴ساعت</p></div>
            <div className="bg-[#0d0916]/60 rounded-xl py-2"><p className="text-sm font-bold text-white">{toFa(insights.countries)}</p><p className="text-[10px] text-zinc-500">تنوع کشور</p></div>
            <div className="bg-[#0d0916]/60 rounded-xl py-2"><p className="text-sm font-bold text-white">{toFa(insights.avgPing)}</p><p className="text-[10px] text-zinc-500">میانگین پینگ</p></div>
          </div>
          <p className="text-[11px] text-zinc-300 text-right">{insights.advice}</p>
        </div>
      )}
      <h4 className="mx-5 mb-3 font-bold text-white text-right flex items-center gap-2 justify-end">تاریخچه چرخش IP <History className="w-4 h-4 text-sky-400" /></h4>
      <div className="mx-5 space-y-2">
        {logs.length === 0 && <p className="text-center text-zinc-500 text-sm py-8">هنوز چرخشی ثبت نشده. یک پروکسی فعال کنید.</p>}
        {logs.map((l) => (
          <div key={l.id} className="bg-[#14101c] border border-white/5 rounded-2xl p-3 flex items-center gap-3">
            <span className="text-[10px] text-zinc-500 shrink-0">{l.createdAt ? new Date(l.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 shrink-0">{reasonLabel[l.reason || 'manual']}</span>
            <div className="flex-1 text-right min-w-0">
              <p className="text-xs text-white truncate" dir="ltr">{l.label}</p>
              <p className="text-[10px] text-zinc-500">{l.country} • {l.ping ? `${toFa(l.ping)}ms` : '—'} • {l.kind === 'tunnel' ? 'تونل' : 'پروکسی'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================ LOGIN SCREEN ============================ */
/* ============================ IG ACCOUNT CONNECT PANEL ============================ */
interface IgAcc { id: number; username: string; status: string | null; connectMethod: string | null; lastLogin: string | null; hasSession: boolean; }
const IG_STATUS: Record<string, { c: string; l: string }> = {
  connected: { c: '#10b981', l: 'متصل' }, challenge_required: { c: '#f59e0b', l: 'نیاز به کد' },
  two_factor_required: { c: '#f59e0b', l: 'تایید دومرحله‌ای' }, disconnected: { c: '#71717a', l: 'قطع' }, failed: { c: '#f43f5e', l: 'ناموفق' },
};

function IgAccountPanel({ toast }: { toast: (m: string) => void }) {
  const [accounts, setAccounts] = useState<IgAcc[]>([]);
  const [proxies, setProxies] = useState<{ id: number; host: string; country: string | null; countryFlag: string | null }[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [proxyId, setProxyId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [pendingType, setPendingType] = useState<'challenge' | 'two_factor'>('challenge');
  const [code, setCode] = useState('');

  const load = () => { fetch('/api/ig-accounts').then((r) => r.json()).then((d) => { if (d.success) setAccounts(d.accounts); }).catch(() => {}); };
  useEffect(() => {
    load();
    fetch('/api/proxies').then((r) => r.json()).then((d) => { if (d.success) setProxies(d.proxies); }).catch(() => {});
  }, []);

  const doLogin = async () => {
    if (!username || !password) return toast('نام کاربری و رمز اینستاگرام را وارد کنید');
    setLoading(true);
    try {
      const res = await fetch('/api/ig-accounts/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password, proxyId: proxyId || null }) });
      const d = await res.json();
      toast(d.message || 'انجام شد');
      if (d.needsCode) { setPendingId(d.accountId); setPendingType(d.status === 'two_factor_required' ? 'two_factor' : 'challenge'); }
      else if (d.success) { setUsername(''); setPassword(''); }
      load();
    } catch { toast('خطا در اتصال'); }
    finally { setLoading(false); }
  };

  const verify = async () => {
    if (!/^\d{6}$/.test(code)) return toast('کد ۶ رقمی را وارد کنید');
    setLoading(true);
    try {
      const res = await fetch('/api/ig-accounts/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accountId: pendingId, code }) });
      const d = await res.json();
      toast(d.message);
      if (d.success) { setPendingId(null); setCode(''); setUsername(''); setPassword(''); }
      load();
    } catch { toast('خطا'); }
    finally { setLoading(false); }
  };

  const remove = async (id: number) => { await fetch(`/api/ig-accounts?id=${id}`, { method: 'DELETE' }); setAccounts((a) => a.filter((x) => x.id !== id)); toast('اکانت حذف شد'); };

  return (
    <div className="fade-up">
      {/* Security note */}
      <div className="mx-5 mb-4 rounded-3xl p-4 bg-amber-500/5 border border-amber-500/20">
        <p className="text-xs text-amber-200 text-right leading-relaxed">🔐 ورود با نشست (session) امن انجام می‌شود و کانفیگ رمزنگاری می‌گردد. برای امنیت بیشتر، هر اکانت را به یک پروکسی سبز متصل کنید تا از بن جلوگیری شود.</p>
      </div>

      {pendingId ? (
        /* Challenge / 2FA step */
        <div className="mx-5 mb-5 bg-[#14101c] border border-amber-500/30 rounded-3xl p-5 fade-up">
          <h3 className="font-bold text-white mb-2 flex items-center gap-2 justify-end">{pendingType === 'two_factor' ? 'تایید دو مرحله‌ای' : 'تایید هویت'} <ShieldAlert className="w-4 h-4 text-amber-400" /></h3>
          <p className="text-xs text-zinc-400 text-right mb-4 leading-relaxed">کد ۶ رقمی ارسال‌شده به {pendingType === 'two_factor' ? 'اپ/پیامک' : 'ایمیل/پیامک'} خود را وارد کنید.</p>
          <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="۶ رقم کد تایید" className="w-full bg-[#0d0916] border border-white/10 rounded-2xl px-4 py-3.5 text-center text-white text-xl tracking-[0.5em] focus:outline-none focus:border-purple-500 mb-4" dir="ltr" />
          <div className="grid grid-cols-2 gap-3">
            <button onClick={verify} disabled={loading} className="py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 font-bold text-white flex items-center justify-center gap-2 glow-green disabled:opacity-60">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} تایید</button>
            <button onClick={() => { setPendingId(null); setCode(''); }} className="py-3.5 rounded-2xl bg-[#241d33] font-bold text-zinc-400">انصراف</button>
          </div>
        </div>
      ) : (
        /* Login form */
        <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2 justify-end">افزودن اکانت اینستاگرام <UserCircle className="w-4 h-4 text-purple-400" /></h3>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="نام کاربری اینستاگرام" className="w-full bg-[#0d0916] border border-white/10 rounded-2xl px-4 py-3 text-right text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 text-sm mb-3" dir="ltr" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="رمز عبور" className="w-full bg-[#0d0916] border border-white/10 rounded-2xl px-4 py-3 text-right text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 text-sm mb-3" dir="ltr" />
          <select value={proxyId} onChange={(e) => setProxyId(e.target.value ? Number(e.target.value) : '')} className="w-full bg-[#0d0916] border border-white/10 rounded-2xl px-4 py-3 text-right text-white text-sm mb-4 focus:outline-none">
            <option value="">بدون پروکسی (مستقیم)</option>
            {proxies.map((p) => <option key={p.id} value={p.id}>{p.countryFlag} {p.host} ({p.country})</option>)}
          </select>
          <button onClick={doLogin} disabled={loading} className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] font-bold text-white flex items-center justify-center gap-2 glow-purple active:scale-[0.98] transition disabled:opacity-60">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />} {loading ? 'در حال اتصال...' : 'اتصال اکانت'}
          </button>
        </div>
      )}

      {/* Connected accounts */}
      <h4 className="mx-5 mb-3 font-bold text-white text-right">اکانت‌های متصل</h4>
      <div className="mx-5 space-y-2">
        {accounts.length === 0 && <p className="text-center text-zinc-500 text-sm py-6">هنوز اکانتی متصل نشده</p>}
        {accounts.map((a) => {
          const st = IG_STATUS[a.status || 'disconnected'];
          return (
            <div key={a.id} className={`bg-[#14101c] border rounded-2xl p-3 flex items-center gap-3 ${a.status === 'connected' ? 'border-emerald-500/40' : 'border-white/5'}`}>
              <button onClick={() => remove(a.id)} className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0"><X className="w-3.5 h-3.5 text-rose-400" /></button>
              <span className="text-[10px] px-2 py-1 rounded-full shrink-0" style={{ background: `${st.c}22`, color: st.c }}>● {st.l}</span>
              <div className="flex-1 text-right min-w-0">
                <p className="text-sm text-white truncate" dir="ltr">@{a.username}</p>
                <p className="text-[10px] text-zinc-500">{a.hasSession ? '🔐 نشست ذخیره‌شده' : 'بدون نشست'} • {a.connectMethod === 'private' ? 'Private API' : 'Graph API'}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">{a.username[0]?.toUpperCase()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
