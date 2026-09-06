'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send as SendIcon } from 'lucide-react';

interface ChatMsg { role: 'user' | 'bot'; text: string; grounded?: boolean; escalate?: boolean; }
export function ChatbotWidget({ toast }: { toast: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>([{ role: 'bot', text: 'سلام! 👋 من دستیار هوشمند پیج هستم. سوالت رو بپرس (قیمت، ارسال، تخفیف...)' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, open]);

  const send = async () => {
    if (!input.trim()) return;
    const q = input.trim();
    setMsgs((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chatbot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: q }) });
      const d = await res.json();
      if (d.success) setMsgs((m) => [...m, { role: 'bot', text: d.reply, grounded: d.grounded, escalate: d.escalate }]);
    } catch { setMsgs((m) => [...m, { role: 'bot', text: 'خطا در اتصال 😔' }]); }
    finally { setLoading(false); }
  };

  return (
    <>
      {/* Floating button */}
      <button onClick={() => setOpen(true)} className="fixed bottom-32 left-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a855f7] flex items-center justify-center glow-purple active:scale-95 transition">
        <Bot className="w-7 h-7 text-white" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-[480px] h-[80vh] bg-[#0d0916] rounded-t-3xl flex flex-col fade-up" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-[#241d33] flex items-center justify-center"><X className="w-4 h-4 text-zinc-400" /></button>
              <div className="flex items-center gap-2">
                <div className="text-right"><p className="font-bold text-white text-sm">دستیار هوشمند</p><p className="text-[10px] text-emerald-400">آنلاین • پایگاه دانش فعال</p></div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a855f7] flex items-center justify-center"><Bot className="w-5 h-5 text-white" /></div>
              </div>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed ${m.role === 'user' ? 'bg-purple-600 text-white' : 'bg-[#1a1524] text-zinc-200'}`}>
                    <p className="text-right whitespace-pre-line">{m.text}</p>
                    {m.role === 'bot' && m.grounded && <span className="text-[9px] text-emerald-400 mt-1 block">✓ بر اساس پایگاه دانش</span>}
                    {m.role === 'bot' && m.escalate && <span className="text-[9px] text-amber-400 mt-1 block">↗ ارجاع به اپراتور</span>}
                  </div>
                </div>
              ))}
              {loading && <div className="flex justify-end"><div className="bg-[#1a1524] rounded-2xl p-3 text-zinc-500 text-sm">در حال نوشتن...</div></div>}
              <div ref={endRef} />
            </div>
            {/* Input */}
            <div className="p-4 border-t border-white/5 flex gap-2">
              <button onClick={send} disabled={loading} className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] flex items-center justify-center shrink-0"><SendIcon className="w-5 h-5 text-white" /></button>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="پیامت رو بنویس..." className="flex-1 bg-[#1a1524] border border-white/10 rounded-2xl px-4 text-right text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 text-sm" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================ KNOWLEDGE MANAGER ============================ */
