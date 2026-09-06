'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Palette, Save, Wand2 } from 'lucide-react';
import { templatePacks } from '../templates';

interface BrandKit {
  brandName: string | null; industry: string | null; audience: string | null;
  brandVoice: string | null; visualStyle: string | null; primaryColor: string | null;
  ctaStyle: string | null; forbiddenWords: string | null; keywords: string | null;
}

const VOICES = ['دوستانه', 'رسمی', 'طنز', 'انگیزشی', 'حرفه‌ای', 'احساسی'];
const STYLES = [
  { id: 'realistic', l: 'واقع‌گرا' }, { id: 'cinematic', l: 'سینمایی' }, { id: 'minimal', l: 'مینیمال' },
  { id: 'vibrant', l: 'رنگارنگ' }, { id: 'luxury', l: 'لوکس' }, { id: 'vintage', l: 'وینتیج' },
];

export function BrandKitManager({ toast }: { toast: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  const [kit, setKit] = useState<BrandKit | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch('/api/brand-kit').then((r) => r.json()).then((d) => { if (d.success) setKit(d.brandKit); }).catch(() => {}); }, []);

  const set = (k: keyof BrandKit, v: string) => setKit((p) => p ? { ...p, [k]: v } : p);

  const save = async () => {
    if (!kit) return;
    setSaving(true);
    try {
      const res = await fetch('/api/brand-kit', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(kit) });
      const d = await res.json();
      if (d.success) toast('حافظه برند ذخیره شد 🎨 (به همه تولیدها اعمال می‌شود)');
    } catch { toast('خطا'); }
    finally { setSaving(false); }
  };

  return (
    <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between mb-1">
        <ChevronLeft className={`w-4 h-4 text-zinc-500 transition ${open ? '-rotate-90' : ''}`} />
        <h3 className="font-bold text-white flex items-center gap-2">حافظه برند (Brand Kit) <Palette className="w-4 h-4 text-pink-400" /></h3>
      </button>
      {open && kit && (
        <div className="fade-up mt-4 space-y-3">
          <p className="text-[11px] text-zinc-500 text-right leading-relaxed">این اطلاعات به همه تولیدهای AI (کپشن، تصویر، ریلز) تزریق می‌شود تا خروجی هماهنگ با برند و کم‌خطا باشد.</p>

          {/* Onboarding: template packs عمودی */}
          <div className="bg-[#0d0916] rounded-2xl p-3">
            <p className="text-[11px] text-purple-300 mb-2 text-right flex items-center gap-1 justify-end">شروع سریع با بسته صنعت شما <Wand2 className="w-3 h-3" /></p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {templatePacks.map((p) => (
                <button key={p.id} onClick={() => {
                  setKit((k) => k ? { ...k, industry: p.industry, audience: p.audience, brandVoice: p.brandVoice, visualStyle: p.visualStyle, keywords: p.hashtagCluster.join('، ') } : k);
                  toast(`بسته «${p.name}» اعمال شد — ذخیره کن`);
                }} className="shrink-0 px-3 py-2 rounded-xl bg-[#14101c] border border-white/5 text-[11px] text-white hover:border-purple-500/40 transition">
                  {p.emoji} {p.name}
                </button>
              ))}
            </div>
          </div>

          <Field label="نام برند" value={kit.brandName || ''} onChange={(v) => set('brandName', v)} />
          <Field label="حوزه فعالیت" value={kit.industry || ''} onChange={(v) => set('industry', v)} ph="مثلا: پوشاک، کافه، آموزش" />
          <Field label="مخاطب هدف" value={kit.audience || ''} onChange={(v) => set('audience', v)} ph="مثلا: زنان ۲۵-۳۵ علاقه‌مند به مد" />

          <div>
            <p className="text-[11px] text-zinc-400 mb-1.5 text-right">لحن برند</p>
            <div className="flex flex-wrap gap-1.5 justify-end">
              {VOICES.map((v) => <button key={v} onClick={() => set('brandVoice', v)} className={`px-3 py-1.5 rounded-full text-[11px] transition ${kit.brandVoice === v ? 'bg-purple-600 text-white' : 'bg-[#241d33] text-zinc-400'}`}>{v}</button>)}
            </div>
          </div>

          <div>
            <p className="text-[11px] text-zinc-400 mb-1.5 text-right">سبک بصری</p>
            <div className="flex flex-wrap gap-1.5 justify-end">
              {STYLES.map((s) => <button key={s.id} onClick={() => set('visualStyle', s.id)} className={`px-3 py-1.5 rounded-full text-[11px] transition ${kit.visualStyle === s.id ? 'bg-purple-600 text-white' : 'bg-[#241d33] text-zinc-400'}`}>{s.l}</button>)}
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <input type="color" value={kit.primaryColor || '#a855f7'} onChange={(e) => set('primaryColor', e.target.value)} className="w-10 h-10 rounded-xl bg-transparent border border-white/10 cursor-pointer" />
            <span className="text-[11px] text-zinc-400">رنگ اصلی برند</span>
          </div>

          <Field label="کلمات کلیدی برند" value={kit.keywords || ''} onChange={(v) => set('keywords', v)} ph="کاما جدا" />
          <Field label="سبک کال‌تو‌اکشن" value={kit.ctaStyle || ''} onChange={(v) => set('ctaStyle', v)} ph="مثلا: دعوت به خرید مستقیم" />
          <Field label="⛔ کلمات ممنوع" value={kit.forbiddenWords || ''} onChange={(v) => set('forbiddenWords', v)} ph="کلماتی که نباید استفاده شوند (کاما جدا)" />

          <button onClick={save} disabled={saving} className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] font-bold text-white text-sm flex items-center justify-center gap-2 glow-purple disabled:opacity-60">
            <Save className="w-4 h-4" /> {saving ? 'در حال ذخیره...' : 'ذخیره حافظه برند'}
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, ph }: { label: string; value: string; onChange: (v: string) => void; ph?: string }) {
  return (
    <div>
      <p className="text-[11px] text-zinc-400 mb-1.5 text-right">{label}</p>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={ph} className="w-full bg-[#0d0916] border border-white/10 rounded-2xl px-4 py-2.5 text-right text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 text-sm" />
    </div>
  );
}
