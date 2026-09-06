'use client';

import React, { useState } from 'react';
import { UserCircle, KeyRound, LogIn, Loader2 } from 'lucide-react';
import type { AuthUser } from './shared';
import { Btn } from './ui';

export function LoginScreen({ onLogin }: { onLogin: (u: AuthUser) => void }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const d = await res.json();
      if (d.success) onLogin(d.user);
      else setError(d.error || 'ورود ناموفق');
    } catch { setError('خطا در ارتباط با سرور'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0510] flex items-center justify-center px-6">
      <div className="w-full max-w-sm fade-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-500 via-purple-500 to-yellow-500 flex items-center justify-center text-4xl mb-4 glow-purple">📷</div>
          <h1 className="text-3xl font-black text-white">میلانو</h1>
          <p className="text-sm text-zinc-500 mt-1">استودیو هوشمند مدیریت اینستاگرام</p>
        </div>

        <div className="bg-[#14101c] border border-white/5 rounded-3xl p-6">
          <h2 className="font-bold text-white mb-6 text-center flex items-center gap-2 justify-center"><LogIn className="w-5 h-5 text-purple-400" /> ورود به پنل</h2>

          <label className="text-xs text-zinc-400 mb-2 block text-right">نام کاربری</label>
          <div className="relative mb-4">
            <UserCircle className="w-5 h-5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-[#0d0916] border border-white/10 rounded-2xl pr-11 pl-4 py-3.5 text-right text-white focus:outline-none focus:border-purple-500 text-sm" />
          </div>

          <label className="text-xs text-zinc-400 mb-2 block text-right">رمز عبور</label>
          <div className="relative mb-5">
            <KeyRound className="w-5 h-5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} className="w-full bg-[#0d0916] border border-white/10 rounded-2xl pr-11 pl-4 py-3.5 text-right text-white focus:outline-none focus:border-purple-500 text-sm" />
          </div>

          {error && <p className="text-rose-400 text-xs text-center mb-4">{error}</p>}

          <Btn
            variant="primary"
            size="lg"
            full
            loading={loading}
            iconRight={!loading ? <LogIn className="w-5 h-5" /> : undefined}
            onClick={submit}
          >
            {loading ? 'در حال ورود...' : 'ورود'}
          </Btn>

          <div className="mt-5 bg-[#0d0916] border border-white/5 rounded-2xl p-3 text-center">
            <p className="text-[11px] text-zinc-500">ورود مدیر پیش‌فرض: <span className="text-purple-300 font-bold" dir="ltr">admin / admin</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
