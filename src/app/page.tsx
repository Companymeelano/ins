'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  Bell, MessageCircle, Heart, Users, Eye, Settings, Film, BarChart3, Home,
  Plus, TrendingUp, TrendingDown, Clock, BadgeCheck, Bookmark, Sparkles,
  ImagePlus, Send, Download, Type, Smile, Trash2, Palette, LogOut, ChevronLeft, Wand2,
  Music, Clapperboard, Lightbulb, Flame, Copy, RefreshCw, Video, Image as ImageIcon,
  CalendarDays, Target, Rocket, MessageSquareReply, Hash, Gauge, Zap, CheckCircle2, AlertCircle,
  FolderOpen, Layers, ScanEye, Trophy, Globe, FileDown, MessageSquare, Award, X, Plus as PlusIcon, ShoppingBag,
  Anchor, GripVertical, Bot, BrainCircuit, Workflow, Check, XCircle, Filter, Send as SendIcon,
  Shield, Wifi, Globe2, Zap as ZapIcon, RefreshCw as Refresh, Activity, ShieldCheck, ArrowDownUp, Timer, Power, ServerCog,
  History, Radar, MapPin, Lock, AlertTriangle, BellRing, ScanLine,
  UserCircle, KeyRound, LogIn, ShieldAlert, Loader2, Tag,
} from 'lucide-react';
import { UIContext } from './components/ui-context';
import { SideMenu } from './components/SideMenu';
import { BottomBar } from './components/BottomBar';
import { Splash } from './components/Splash';
import { ToolSheet } from './components/ToolSheet';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  engagementData, followerTrend, bestTimes, compareData, ageData, genderData,
  topPosts, storyBackgrounds, stickers, textColors,
} from './data';
import {
  postPrompts, storyIdeas, reelTemplates, contentCategories, contentTones,
  imageStyles, type ReelTemplate,
} from './prompts';
import { competitors, calendarPlan } from './data';
import { type Lang, languages, tr } from './i18n';
import { toFa, type Tab, type AuthUser, type AlertRow, TopHeader } from './components/shared';
import { LoginScreen } from './components/AuthGate';
import { ConnectionCenter } from './components/ConnectionCenter';
import { ChatbotWidget } from './components/ChatbotWidget';
import { AlertsPanel } from './components/AlertsPanel';
import { BrandKitManager } from './components/BrandKitManager';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  const [tab, setTab] = useState<Tab>(() => {
    if (typeof window === 'undefined') return 'home';
    const t = new URLSearchParams(window.location.search).get('tab');
    return (['home', 'analytics', 'story', 'create', 'library', 'settings'] as Tab[]).includes(t as Tab)
      ? (t as Tab)
      : 'home';
  });
  const [toast, setToast] = useState('');
  const [lang, setLang] = useState<Lang>('fa');
  const [connCenter, setConnCenter] = useState(false);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const loadAlerts = () => fetch('/api/alerts').then((r) => r.json()).then((d) => { if (d.success) setAlerts(d.alerts); }).catch(() => {});

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => { setAuthUser(d.user); setAuthChecked(true); }).catch(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (!authUser) return;
    const saved = (typeof window !== 'undefined' && localStorage.getItem('lang')) as Lang | null;
    if (saved && languages.some((l) => l.code === saved)) setLang(saved);
    loadAlerts();
    // مانیتور دوره‌ای اتصال (هر ۴۵ ثانیه) — تشخیص قطعی و افت پینگ
    const monitor = setInterval(() => {
      fetch('/api/alerts/monitor', { method: 'POST' }).then((r) => r.json()).then((d) => {
        if (d.success && d.created?.length) { loadAlerts(); const first = d.created[0]; setToast(`🔔 ${first.title}`); setTimeout(() => setToast(''), 3500); }
      }).catch(() => {});
    }, 45000);
    return () => clearInterval(monitor);
  }, [authUser]);

  const changeLang = (l: Lang) => {
    setLang(l);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', l);
      const dir = languages.find((x) => x.code === l)?.dir || 'rtl';
      document.documentElement.setAttribute('dir', dir);
      document.documentElement.setAttribute('lang', l);
    }
  };

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 2500);
  };

  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {}); setAuthUser(null); };

  // ====== وضعیت رابط کاربری اندرویدی ======
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1700);
    return () => clearTimeout(t);
  }, []);

  // ثبت‌نام ابزارهای هوشمند برای باز شدن در ورقه ابزار (از منوی کشویی)
  const TOOLS: Record<string, { title: string; icon: React.ElementType; render: () => React.ReactNode }> = {
    viral: { title: 'پیش‌بینی وایرال شدن', icon: Rocket, render: () => <ViralPredictor caption="" hasImage={false} toast={showToast} /> },
    hashtags: { title: 'هشتگ‌ساز هوشمند', icon: Hash, render: () => <HashtagGenerator topic="" toast={showToast} /> },
    comment: { title: 'دستیار پاسخ به کامنت', icon: MessageSquareReply, render: () => <CommentAssistant toast={showToast} /> },
    vision: { title: 'تحلیل هوشمند تصویر', icon: ScanEye, render: () => <VisionAnalyzer imageUrl="" onCaption={() => {}} toast={showToast} /> },
    hook: { title: 'قلاب و کاور ریلز', icon: Anchor, render: () => <HookGenerator topic="" toast={showToast} /> },
    reelprod: { title: 'پروداکشن ریلز', icon: Music, render: () => <ReelProducer topic="" toast={showToast} /> },
    besttime: { title: 'بهترین زمان انتشار', icon: Clock, render: () => <BestTimeDetector kind="post" toast={showToast} /> },
    autoreply: { title: 'پاسخ خودکار دایرکت', icon: MessageSquare, render: () => <AutoReplyManager toast={showToast} /> },
    engine: { title: 'موتور پاسخ هوشمند', icon: Bot, render: () => <AutoReplyEngine toast={showToast} /> },
    knowledge: { title: 'پایگاه دانش چت‌بات', icon: BrainCircuit, render: () => <KnowledgeManager toast={showToast} /> },
    team: { title: 'همکاری تیمی', icon: Users, render: () => <TeamManager toast={showToast} /> },
    shop: { title: 'فروشگاه و تگ محصول', icon: ShoppingBag, render: () => <ShopManager toast={showToast} /> },
    calendar: { title: 'تقویم هوشمند', icon: CalendarDays, render: () => <SmartCalendar toast={showToast} /> },
    approval: { title: 'گردش کار تأیید', icon: Workflow, render: () => <ApprovalWorkflow toast={showToast} /> },
    producttag: { title: 'تگ محصول روی پست', icon: Tag, render: () => <ProductTagger toast={showToast} /> },
  };

  // گیت احراز هویت
  if (!authChecked) {
    return <div className="min-h-screen bg-[#0a0510] flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>;
  }
  if (!authUser) {
    return <LoginScreen onLogin={(u) => setAuthUser(u)} />;
  }

  const unread = alerts.filter((a) => !a.read).length;

  return (
    <UIContext.Provider value={{ openMenu: () => setMenuOpen(true), openAlerts: () => setShowAlerts(true), alertCount: unread, online }}>
      <div className="min-h-screen bg-[#0a0510] flex justify-center">
        {/* Phone frame */}
        <div className="w-full max-w-[480px] min-h-screen bg-[#0a0510] relative pb-28">
          {tab === 'home' && <HomeTab go={setTab} lang={lang} openConn={() => setConnCenter(true)} />}
          {tab === 'analytics' && <AnalyticsTab toast={showToast} />}
          {tab === 'story' && <StoryTab toast={showToast} />}
          {tab === 'create' && <CreateTab toast={showToast} />}
          {tab === 'library' && <LibraryTab toast={showToast} />}
          {tab === 'settings' && <SettingsTab toast={showToast} lang={lang} changeLang={changeLang} openConn={() => setConnCenter(true)} authUser={authUser} onLogout={logout} />}

          {connCenter && <ConnectionCenter toast={showToast} onClose={() => setConnCenter(false)} />}

          {showAlerts && <AlertsPanel alerts={alerts} onClose={() => setShowAlerts(false)} reload={loadAlerts} />}

          {/* نوار پایین اختصاصی */}
          <BottomBar tab={tab} setTab={setTab} lang={lang} />

          {/* چت‌بات هوشمند با پایگاه دانش */}
          <ChatbotWidget toast={showToast} />

          {toast && (
            <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[60] bg-[#1a1524] border border-white/10 text-white text-sm px-6 py-3 rounded-2xl shadow-2xl fade-up whitespace-nowrap">
              {toast}
            </div>
          )}
        </div>
      </div>

      {/* صفحه افتتاحیه */}
      <Splash visible={showSplash} />

      {/* منوی کشویی سازمان‌یافته */}
      <AnimatePresence>
        {menuOpen && (
          <SideMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            onTab={(t) => { setTab(t); window.scrollTo({ top: 0 }); }}
            onTool={(k) => setActiveTool(k)}
            onSecure={() => setConnCenter(true)}
            onAlerts={() => setShowAlerts(true)}
            onLogout={logout}
            user={authUser}
            alertCount={unread}
            lang={lang}
            onLang={changeLang}
          />
        )}
      </AnimatePresence>

      {/* ورقه ابزار هوشمند */}
      <AnimatePresence>
        {activeTool && TOOLS[activeTool] && (() => {
          const Tool = TOOLS[activeTool];
          const ToolIcon = Tool.icon;
          return (
            <ToolSheet
              title={Tool.title}
              icon={<ToolIcon className="w-5 h-5 text-purple-300" />}
              onClose={() => setActiveTool(null)}
            >
              {Tool.render()}
            </ToolSheet>
          );
        })()}
      </AnimatePresence>
    </UIContext.Provider>
  );
}

/* ============================ HEADER ============================ */


/* ============================ HOME TAB ============================ */
function HomeTab({ go, lang, openConn }: { go: (t: Tab) => void; lang: Lang; openConn: () => void }) {
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (m: string) => { setToastMsg(m); setTimeout(() => setToastMsg(''), 2500); };
  return (
    <div className="fade-up">
      <TopHeader title={tr('dashboard', lang)} sub={tr('welcome', lang)} wave />

      {/* Secure connection quick access */}
      <div className="mx-5 mb-5">
        <button onClick={openConn} className="w-full rounded-3xl p-4 bg-gradient-to-l from-[#0f2a1e] to-[#0a1a14] border border-emerald-500/20 flex items-center gap-3 active:scale-[0.98] transition">
          <ChevronLeft className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex-1 text-right">
            <p className="text-sm font-bold text-white">مرکز اتصال امن (ضدبن)</p>
            <p className="text-[11px] text-emerald-300/70">پروکسی هوشمند • V2Ray/SOCKS • زمان‌بند ایمن</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 flex items-center justify-center shrink-0"><Shield className="w-6 h-6 text-emerald-400" /></div>
        </button>
      </div>

      {/* Multi-page switcher + Meta connect */}
      <PageSwitcher toast={showToast} />

      {/* Gamification strip */}
      <GamificationCard />

      {toastMsg && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[60] bg-[#1a1524] border border-white/10 text-white text-sm px-6 py-3 rounded-2xl shadow-2xl fade-up whitespace-nowrap">{toastMsg}</div>
      )}


      {/* Alert */}
      <div className="mx-5 mb-5 bg-gradient-to-l from-[#2a1e12] to-[#1c1508] border border-amber-500/20 rounded-3xl p-4 flex items-center gap-3">
        <p className="flex-1 text-sm text-amber-100/90 leading-relaxed text-right">
          پیج شما هنوز به <span className="font-bold">Instagram Graph API</span> متصل نشده.
          داده‌های زیر نمایشی (دمو) هستند.
        </p>
        <div className="w-11 h-11 rounded-2xl bg-amber-500/15 flex items-center justify-center text-2xl shrink-0">⚡</div>
      </div>

      {/* Followers big card */}
      <div className="mx-5 mb-5 rounded-[28px] p-6 bg-gradient-to-br from-[#3b1a5c] via-[#25123d] to-[#160a24] border border-white/5 overflow-hidden relative">
        <div className="flex items-start justify-between">
          <span className="text-emerald-400 text-sm font-bold flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> ۳.۸٪
          </span>
          <p className="text-zinc-300 text-sm">مجموع فالوورها</p>
        </div>
        <p className="text-6xl font-black text-white mt-3 tracking-tight text-right" dir="ltr">۴۸,۲۱۰</p>
        <p className="text-zinc-400 text-sm mt-2 text-right">+۲۱۴ فالوور جدید امروز</p>

        <div className="h-32 mt-4 -mx-6 -mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={followerTrend} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pinkFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#f472b6" strokeWidth={3} fill="url(#pinkFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2x2 stat cards */}
      <div className="mx-5 grid grid-cols-2 gap-4 mb-5">
        <StatCard icon={MessageCircle} value="۳۴۲" label="کامنت امروز" change="۲.۱٪" up={false} tint="#a855f7" />
        <StatCard icon={Heart} value="۵,۶۸۰" label="لایک امروز" change="۱۲.۴٪" up tint="#ec4899" />
        <StatCard icon={Users} value="۲,۱۴۰" label="بازدید پروفایل" change="۵.۳٪" up tint="#f59e0b" />
        <StatCard icon={Eye} value="۳۸,۰۰۰" label="بازدید (Reach)" change="۸.۹٪" up tint="#38bdf8" />
      </div>

      {/* Weekly engagement */}
      <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-emerald-400 font-bold">۶.۷٪</span>
          <h3 className="font-bold text-white">نرخ تعامل هفتگی</h3>
        </div>
        <div className="h-44 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={engagementData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="purpFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} reversed />
              <Tooltip
                contentStyle={{ background: '#251a3d', border: 'none', borderRadius: 14, color: '#fff' }}
                labelStyle={{ color: '#c4b5fd' }}
                formatter={(v) => [`likes : ${v}`, '']}
              />
              <Area type="monotone" dataKey="likes" stroke="#a78bfa" strokeWidth={3} fill="url(#purpFill)" dot={{ r: 0 }} activeDot={{ r: 6, fill: '#fff', stroke: '#a78bfa', strokeWidth: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Best times */}
      <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
        <h3 className="font-bold text-white mb-5 flex items-center gap-2 justify-end">
          بهترین زمان انتشار (الگوریتم اکسپلور) <span>🗓️</span>
        </h3>
        <div className="space-y-4">
          {bestTimes.map((t) => (
            <div key={t.day} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold w-8">{toFa(t.score)}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-[#241d33] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-l from-[#ec4899] via-[#f97316] to-[#fbbf24]" style={{ width: `${t.score}%` }} />
                  </div>
                </div>
              </div>
              <div className="text-right w-28">
                <p className="text-white font-bold text-sm">{t.day}</p>
                <p className="text-zinc-500 text-xs">{t.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top posts */}
      <div className="mx-5 mb-5">
        <h3 className="font-bold text-white mb-4 text-right">برترین پست‌ها این هفته</h3>
        <div className="grid grid-cols-2 gap-4">
          {topPosts.slice(0, 2).map((p) => (
            <div key={p.id} className="bg-[#14101c] border border-white/5 rounded-3xl overflow-hidden">
              <img src={p.img} alt="" className="w-full h-40 object-cover" />
              <div className="p-3">
                <p className="text-xs text-zinc-200 leading-relaxed text-right line-clamp-2 h-9">{p.caption}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-emerald-400 text-xs font-bold">{toFa(p.score)}٪</span>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    <span className="flex items-center gap-0.5">{p.comments} <MessageCircle className="w-3 h-3" /></span>
                    <span className="flex items-center gap-0.5">{p.likes} <Heart className="w-3 h-3" /></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA buttons */}
      <div className="mx-5 mb-4">
        <button
          onClick={() => go('create')}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] font-bold text-white flex items-center justify-center gap-2 glow-purple active:scale-[0.98] transition"
        >
          <Sparkles className="w-5 h-5" /> ساخت پست جدید با هوش مصنوعی
        </button>
      </div>

      <div className="mx-5">
        <button
          onClick={() => go('settings')}
          className="w-full py-4 rounded-2xl bg-[#1e1330] border border-purple-500/20 text-purple-200 flex items-center justify-between px-5 active:scale-[0.98] transition"
        >
          <span className="text-sm flex items-center gap-1">مشاهده <ChevronLeft className="w-4 h-4" /></span>
          <span className="font-bold flex items-center gap-2">نقشه راه ارتقا به نسخه بی‌حد و مرز <span>🚀</span></span>
        </button>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, change, up, tint }: {
  icon: React.ElementType; value: string; label: string; change: string; up: boolean; tint: string;
}) {
  return (
    <div className="bg-[#14101c] border border-white/5 rounded-3xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-bold flex items-center gap-1 ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
          {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />} {change}
        </span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${tint}22` }}>
          <Icon className="w-5 h-5" style={{ color: tint }} />
        </div>
      </div>
      <p className="text-3xl font-black text-white text-right" dir="ltr">{value}</p>
      <p className="text-zinc-500 text-xs mt-1 text-right">{label}</p>
    </div>
  );
}

/* ============================ ANALYTICS TAB ============================ */
function AnalyticsTab({ toast }: { toast: (m: string) => void }) {
  const exportReport = async () => {
    try {
      const res = await fetch('/api/report');
      const data = await res.json();
      if (data.success) { openReportWindow(data.report); toast('گزارش آماده چاپ/PDF شد 📄'); }
    } catch { toast('خطا در تولید گزارش'); }
  };

  return (
    <div className="fade-up">
      <TopHeader title="آنالیز عملکرد" sub="گزارش دقیق پیج" />

      {/* Export report */}
      <div className="mx-5 mb-5">
        <button onClick={exportReport} className="w-full py-3.5 rounded-2xl bg-[#14101c] border border-white/10 font-bold text-white flex items-center justify-center gap-2 active:scale-[0.98] transition">
          <FileDown className="w-4 h-4 text-emerald-400" /> خروجی گزارش تحلیلی (PDF)
        </button>
      </div>


      {/* Health score */}
      <div className="mx-5 mb-5 rounded-3xl p-5 bg-gradient-to-br from-[#2e1650] to-[#160a24] border border-white/5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#3b1f66] flex items-center justify-center">
          <BadgeCheck className="w-7 h-7 text-purple-300" />
        </div>
        <div className="flex-1 text-right">
          <h3 className="font-bold text-white">امتیاز سلامت پیج: ۸۷ از ۱۰۰</h3>
          <p className="text-zinc-400 text-xs mt-1">بر اساس نرخ تعامل، رشد فالوور و کیفیت محتوا</p>
        </div>
      </div>

      {/* 2x2 metrics */}
      <div className="mx-5 grid grid-cols-2 gap-4 mb-5">
        <MetricCard icon={Heart} value="۶.۷٪" label="نرخ تعامل" tint="#ec4899" />
        <MetricCard icon={Users} value="۴۸,۲۱۰" label="کل فالوورها" tint="#a855f7" />
        <MetricCard icon={Bookmark} value="۹۸۰" label="ذخیره پست‌ها" tint="#fbbf24" />
        <MetricCard icon={MessageCircle} value="۲,۱۴۰" label="کامنت این هفته" tint="#38bdf8" />
      </div>

      {/* Follower growth line */}
      <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2 justify-end">
          روند رشد فالوور (۷ روز اخیر) <TrendingUp className="w-4 h-4 text-emerald-400" />
        </h3>
        <div className="h-52 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={followerTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#241d33" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} reversed />
              <Tooltip contentStyle={{ background: '#251a3d', border: 'none', borderRadius: 14, color: '#fff' }} />
              <Line type="monotone" dataKey="v" stroke="#34d399" strokeWidth={4} dot={{ r: 5, fill: '#34d399' }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Compare bar */}
      <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
        <h3 className="font-bold text-white mb-5 text-center">مقایسه لایک، کامنت و ذخیره</h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={compareData} barGap={2} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} reversed />
              <Tooltip contentStyle={{ background: '#251a3d', border: 'none', borderRadius: 14, color: '#fff' }} cursor={{ fill: '#ffffff08' }} />
              <Bar dataKey="likes" fill="#ec4899" radius={[4, 4, 0, 0]} />
              <Bar dataKey="comment" fill="#a855f7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="save" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-5 mt-4 text-xs">
          <Legend color="#fbbf24" label="ذخیره" />
          <Legend color="#a855f7" label="کامنت" />
          <Legend color="#ec4899" label="لایک" />
        </div>
      </div>

      {/* Demographics */}
      <div className="mx-5 grid grid-cols-2 gap-4 mb-5">
        <DonutCard title="رده سنی مخاطبان" data={ageData} centerLabel="" />
        <DonutCard title="جنسیت مخاطبان" data={genderData} centerLabel="مردان : ۳۹" />
      </div>

      {/* Best posts analysis */}
      <div className="mx-5 mb-5">
        <h3 className="font-bold text-white mb-4 text-right">تحلیل بهترین پست‌ها</h3>
        <div className="space-y-4">
          {topPosts.map((p) => (
            <div key={p.id} className="bg-[#14101c] border border-white/5 rounded-3xl p-3 flex items-center gap-3">
              <span className="text-emerald-400 font-black text-lg w-8 text-center">{toFa(p.score)}</span>
              <div className="flex-1 text-right">
                <p className="text-sm text-white line-clamp-1">{p.caption}</p>
                <div className="flex items-center gap-3 mt-2 justify-end text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1">{p.reach} <Eye className="w-3 h-3" /></span>
                  <span className="flex items-center gap-1">{p.comments} <MessageCircle className="w-3 h-3" /></span>
                  <span className="flex items-center gap-1">{p.likes} <Heart className="w-3 h-3" /></span>
                </div>
              </div>
              <img src={p.img} className="w-14 h-14 rounded-2xl object-cover" alt="" />
              <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center text-white font-bold text-sm">{toFa(p.rank)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Competitor analysis */}
      <div className="mx-5 mb-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2 justify-end">تحلیل رقبا <Target className="w-4 h-4 text-rose-400" /></h3>
        <div className="space-y-3">
          {competitors.map((c) => (
            <div key={c.handle} className={`rounded-3xl p-4 border ${c.isYou ? 'bg-gradient-to-br from-[#2e1650] to-[#160a24] border-purple-500/40' : 'bg-[#14101c] border-white/5'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold flex items-center gap-1 ${c.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <TrendingUp className="w-3.5 h-3.5" /> {c.growth}
                </span>
                <div className="text-right">
                  <p className="text-sm font-bold text-white flex items-center gap-2 justify-end">
                    {c.name} {c.isYou && <span className="text-[9px] bg-purple-500 px-2 py-0.5 rounded-full">شما</span>}
                  </p>
                  <p className="text-[11px] text-zinc-500" dir="ltr">{c.handle}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                <div className="bg-[#0d0916]/60 rounded-xl py-2">
                  <p className="text-sm font-bold text-white">{c.followers}</p>
                  <p className="text-[10px] text-zinc-500">فالوور</p>
                </div>
                <div className="bg-[#0d0916]/60 rounded-xl py-2">
                  <p className="text-sm font-bold text-white">{c.engagement}</p>
                  <p className="text-[10px] text-zinc-500">تعامل</p>
                </div>
                <div className="bg-[#0d0916]/60 rounded-xl py-2">
                  <p className="text-sm font-bold text-white">{toFa(c.postsWeek)}</p>
                  <p className="text-[10px] text-zinc-500">پست/هفته</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Calendar */}
      <div className="mx-5 mb-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2 justify-end">تقویم محتوایی پیشنهادی هفته <CalendarDays className="w-4 h-4 text-sky-400" /></h3>
        <div className="bg-[#14101c] border border-white/5 rounded-3xl p-4 space-y-2">
          {calendarPlan.map((c) => (
            <div key={c.day} className="flex items-center gap-3 bg-[#0d0916]/50 rounded-2xl p-3">
              <span className="text-[11px] text-zinc-400 w-12 text-center shrink-0">{c.time}</span>
              <div className="flex-1 text-right">
                <p className="text-sm text-white">{c.idea}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${c.color}22`, color: c.color }}>{c.emoji} {c.type}</span>
              </div>
              <span className="text-sm font-bold text-white w-16 text-left shrink-0">{c.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, value, label, tint }: { icon: React.ElementType; value: string; label: string; tint: string }) {
  return (
    <div className="bg-[#14101c] border border-white/5 rounded-3xl p-4">
      <div className="flex justify-end mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${tint}22` }}>
          <Icon className="w-5 h-5" style={{ color: tint }} />
        </div>
      </div>
      <p className="text-3xl font-black text-white text-right" dir="ltr">{value}</p>
      <p className="text-zinc-500 text-xs mt-1 text-right">{label}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-zinc-300">
      {label} <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
    </span>
  );
}

function DonutCard({ title, data, centerLabel }: { title: string; data: { name: string; value: number; color: string }[]; centerLabel: string }) {
  return (
    <div className="bg-[#14101c] border border-white/5 rounded-3xl p-4">
      <h4 className="font-bold text-white text-center text-sm mb-2">{title}</h4>
      <div className="h-32 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={38} outerRadius={55} paddingAngle={3} startAngle={90} endAngle={-270}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {centerLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-[#2a1c45] text-purple-200 text-[11px] px-2 py-1 rounded-lg">{centerLabel}</span>
          </div>
        )}
      </div>
      <div className="mt-2 space-y-1">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-end gap-1.5 text-[11px] text-zinc-300">
            <span>{toFa(d.value)}٪ {d.name}</span>
            <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================ STORY TAB ============================ */
function StoryTab({ toast }: { toast: (m: string) => void }) {
  const [text, setText] = useState('متن استوری شما');
  const [size, setSize] = useState(50);
  const [color, setColor] = useState('#fff');
  const [bg, setBg] = useState(storyBackgrounds[0]);
  const [placed, setPlaced] = useState<{ text: string; color: string; size: number }[]>([]);
  const [stickerList, setStickerList] = useState<string[]>([]);
  const [idea, setIdea] = useState(storyIdeas[0]);
  const [loadingIdea, setLoadingIdea] = useState(false);
  const [aiBg, setAiBg] = useState('');
  const [loadingBg, setLoadingBg] = useState(false);

  const newIdea = async () => {
    setLoadingIdea(true);
    try {
      const res = await fetch('/api/ai/ideas', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'story', niche: 'عمومی' }),
      });
      const data = await res.json();
      if (data.success && data.ideas?.length) {
        const pick = data.ideas[Math.floor(Math.random() * data.ideas.length)];
        setIdea({ emoji: '💡', text: pick.replace(/^[💡📊❓🎁⭐🔥🎬🏆]\s*/, '') });
        toast('ایده جدید تولید شد ✨');
      }
    } catch { toast('خطا در دریافت ایده'); }
    finally { setLoadingIdea(false); }
  };

  const genAiBg = async () => {
    setLoadingBg(true);
    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'abstract aesthetic instagram story background, gradient, dreamy', style: 'vibrant' }),
      });
      const data = await res.json();
      if (data.success) { setAiBg(data.imageUrl); setBg(`url(${data.imageUrl}) center/cover`); toast('پس‌زمینه با AI ساخته شد 🎨'); }
    } catch { toast('خطا در ساخت پس‌زمینه'); }
    finally { setLoadingBg(false); }
  };

  return (
    <div className="fade-up">
      <TopHeader title="استودیو استوری" sub="ساخت استوری حرفه‌ای" />

      {/* Preview */}
      <div className="mx-5 mb-5 flex justify-center">
        <div className="w-48 rounded-3xl overflow-hidden border border-white/10 relative flex items-center justify-center" style={{ aspectRatio: '9/16', background: bg }}>
          {placed.map((p, i) => (
            <p key={i} className="absolute font-black text-center px-2" style={{ color: p.color, fontSize: `${12 + p.size / 4}px`, top: `${20 + i * 15}%` }}>{p.text}</p>
          ))}
          {stickerList.map((s, i) => (
            <span key={i} className="absolute text-3xl" style={{ top: `${55 + i * 8}%`, left: `${20 + i * 12}%` }}>{s}</span>
          ))}
          {placed.length === 0 && stickerList.length === 0 && (
            <p className="text-white/80 font-bold text-center px-3">پیش‌نمایش استوری</p>
          )}
        </div>
      </div>

      {/* Edit selected element */}
      <div className="mx-5 mb-4 bg-[#14101c] border border-white/5 rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => { setPlaced([]); setStickerList([]); }} className="text-rose-400 text-sm flex items-center gap-1">
            <Trash2 className="w-4 h-4" /> حذف
          </button>
          <h3 className="font-bold text-white">ویرایش عنصر انتخابی</h3>
        </div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-[#0d0916] border border-white/10 rounded-2xl px-4 py-3 text-right text-white mb-4 focus:outline-none focus:border-purple-500"
        />
        <div className="flex items-center gap-3 mb-4">
          <input type="range" min={0} max={100} value={size} onChange={(e) => setSize(+e.target.value)} className="flex-1" />
          <span className="text-zinc-400 text-sm">اندازه</span>
        </div>
        <div className="flex items-center gap-3 justify-end">
          {textColors.map((c) => (
            <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-white scale-110' : 'border-transparent'} transition`} style={{ background: c }} />
          ))}
        </div>
      </div>

      {/* Background */}
      <div className="mx-5 mb-4 bg-[#14101c] border border-white/5 rounded-3xl p-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2 justify-end">
          پس‌زمینه استوری <Palette className="w-4 h-4 text-purple-400" />
        </h3>
        <div className="flex items-center gap-3 justify-end flex-wrap">
          <button onClick={genAiBg} disabled={loadingBg} className="w-16 h-16 rounded-2xl border-2 border-dashed border-purple-500/40 flex flex-col items-center justify-center text-purple-300 gap-0.5">
            <Wand2 className="w-5 h-5" />
            <span className="text-[8px]">{loadingBg ? '...' : 'AI'}</span>
          </button>
          {aiBg && (
            <button onClick={() => setBg(`url(${aiBg}) center/cover`)} className="w-16 h-16 rounded-2xl border-2 border-white overflow-hidden">
              <img src={aiBg} className="w-full h-full object-cover" alt="" />
            </button>
          )}
          {[...storyBackgrounds].reverse().map((g) => (
            <button key={g} onClick={() => setBg(g)} className={`w-16 h-16 rounded-2xl border-2 ${bg === g ? 'border-white' : 'border-transparent'}`} style={{ background: g }} />
          ))}
        </div>
      </div>

      {/* Add text / sticker */}
      <div className="mx-5 mb-4 grid grid-cols-2 gap-3">
        <button onClick={() => setPlaced([...placed, { text, color, size }])} className="py-4 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] font-bold text-white flex items-center justify-center gap-2 glow-purple">
          <Type className="w-4 h-4" /> افزودن متن
        </button>
        <button onClick={() => toast('حالت استیکر فعال شد')} className="py-4 rounded-2xl bg-[#14101c] border border-white/10 font-bold text-white flex items-center justify-center gap-2">
          <Smile className="w-4 h-4" /> افزودن استیکر
        </button>
      </div>

      {/* Stickers row */}
      <div className="mx-5 mb-4 flex gap-2 overflow-x-auto no-scrollbar pb-1" dir="ltr">
        {stickers.map((s) => (
          <button key={s} onClick={() => setStickerList([...stickerList, s])} className="w-12 h-12 shrink-0 rounded-2xl bg-[#14101c] border border-white/5 flex items-center justify-center text-2xl active:scale-90 transition">
            {s}
          </button>
        ))}
      </div>

      {/* Smart story idea */}
      <div className="mx-5 mb-5 rounded-3xl p-5 bg-gradient-to-br from-[#2a1650] to-[#1a1030] border border-purple-500/20">
        <h3 className="font-bold text-white mb-2 flex items-center gap-2 justify-end">
          ایده‌ی هوشمند استوری <Wand2 className="w-4 h-4 text-purple-300" />
        </h3>
        <p className="text-sm text-zinc-300 text-right leading-relaxed">{idea.emoji} {idea.text}</p>
        <button onClick={newIdea} disabled={loadingIdea} className="text-purple-300 text-sm mt-2 flex items-center gap-1 mr-auto">
          <RefreshCw className={`w-3 h-3 ${loadingIdea ? 'animate-spin' : ''}`} /> {loadingIdea ? 'در حال تولید...' : 'ایده‌ی دیگر پیشنهاد بده'}
        </button>
      </div>

      {/* Download */}
      <div className="mx-5 mb-4">
        <button onClick={() => toast('استوری با کیفیت ۱۹۲۰×۱۰۸۰ دانلود شد ⬇️')} className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 font-bold text-white flex items-center justify-center gap-3 glow-green active:scale-[0.98] transition">
          <Download className="w-5 h-5" />
          <span className="text-center leading-tight">دانلود استوری با کیفیت اکسپلور<br /><span className="text-xs font-normal">(۱۹۲۰×۱۰۸۰)</span></span>
        </button>
      </div>
    </div>
  );
}

/* ============================ CREATE TAB (STUDIO) ============================ */
function CreateTab({ toast }: { toast: (m: string) => void }) {
  const [mode, setMode] = useState<'post' | 'reel' | 'carousel'>('post');
  const subtitle = mode === 'post' ? 'ساخت پست با AI' : mode === 'reel' ? 'ساخت ریلز با AI' : 'ساخت کاروسل با AI';
  return (
    <div className="fade-up">
      <TopHeader title="استودیو هوشمند" sub={subtitle} />

      {/* Mode switch */}
      <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-1.5 flex gap-1.5">
        <button onClick={() => setMode('post')} className={`flex-1 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${mode === 'post' ? 'bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white glow-purple' : 'text-zinc-400'}`}>
          <ImageIcon className="w-4 h-4" /> پست
        </button>
        <button onClick={() => setMode('carousel')} className={`flex-1 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${mode === 'carousel' ? 'bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white glow-purple' : 'text-zinc-400'}`}>
          <Layers className="w-4 h-4" /> کاروسل
        </button>
        <button onClick={() => setMode('reel')} className={`flex-1 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${mode === 'reel' ? 'bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white glow-purple' : 'text-zinc-400'}`}>
          <Clapperboard className="w-4 h-4" /> ریلز
        </button>
      </div>

      {mode === 'post' && <PostStudio toast={toast} />}
      {mode === 'reel' && <ReelStudio toast={toast} />}
      {mode === 'carousel' && <CarouselStudio toast={toast} />}
    </div>
  );
}

/* ---------------- POST STUDIO ---------------- */
function PostStudio({ toast }: { toast: (m: string) => void }) {
  const [image, setImage] = useState('');
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('عمومی');
  const [tone, setTone] = useState('دوستانه');
  const [imgStyle, setImgStyle] = useState('cinematic');
  const [caption, setCaption] = useState('');
  const [loadingImg, setLoadingImg] = useState(false);
  const [loadingCap, setLoadingCap] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [qaWarnings, setQaWarnings] = useState<string[]>([]);
  const [promptVersion, setPromptVersion] = useState('');
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const sendFeedback = async (rating: string) => {
    setFeedbackGiven(true);
    await fetch('/api/ai/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'caption', promptVersion, rating }) }).catch(() => {});
    toast(rating === 'good' ? 'ممنون! بازخوردت ثبت شد 👍' : 'بازخوردت برای بهبود ثبت شد 🙏');
  };

  const genImage = async () => {
    if (!topic) return toast('ابتدا موضوع یا پرامپت را وارد کنید');
    setLoadingImg(true);
    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: topic, keywords: category, style: imgStyle }),
      });
      const data = await res.json();
      if (data.success) { setImage(data.imageUrl); toast('تصویر با AI ساخته شد 🎨'); }
      else toast(data.error || 'خطا در تولید تصویر');
    } catch { toast('خطای شبکه در تولید تصویر'); }
    finally { setLoadingImg(false); }
  };

  const genCaption = async () => {
    if (!topic) return toast('موضوع پست را وارد کنید');
    setLoadingCap(true);
    try {
      const res = await fetch('/api/ai/caption', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, category, tone }),
      });
      const data = await res.json();
      if (data.success) {
        setCaption(data.caption);
        setQaWarnings(data.qa?.warnings || []);
        setPromptVersion(data.promptVersion || '');
        setFeedbackGiven(false);
        toast(`کپشن با ${data.model} تولید شد ✨${data.cached ? ' (کش)' : ''}`);
      }
      else toast(data.error || 'خطا در تولید کپشن');
    } catch { toast('خطای شبکه'); }
    finally { setLoadingCap(false); }
  };

  const oneClick = async () => {
    if (!topic) return toast('موضوع پست را وارد کنید');
    toast('در حال ساخت کامل پست... 🚀');
    await Promise.all([genImage(), genCaption()]);
  };

  const publish = async (schedule = false) => {
    if (!caption) return toast('ابتدا کپشن بسازید');
    await fetch('/api/projects', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'post', title: topic.slice(0, 40), caption, imageUrl: image, status: schedule ? 'scheduled' : 'draft', scheduledFor: schedule ? new Date(Date.now() + 86400000) : null }),
    }).catch(() => {});
    fetch('/api/gamification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ points: 20 }) }).catch(() => {});
    toast(schedule ? 'پست زمان‌بندی و ذخیره شد ⏰ (+۲۰ امتیاز)' : 'پیش‌نویس در کتابخانه ذخیره شد 💾 (+۲۰ امتیاز)');
  };

  return (
    <>
      {/* Trending prompts */}
      <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
        <button onClick={() => setShowPrompts((s) => !s)} className="w-full flex items-center justify-between">
          <ChevronLeft className={`w-4 h-4 text-zinc-500 transition ${showPrompts ? '-rotate-90' : ''}`} />
          <h3 className="font-bold text-white flex items-center gap-2">پرامپت‌های ترند و آماده <Flame className="w-4 h-4 text-orange-400" /></h3>
        </button>
        {showPrompts && (
          <div className="grid grid-cols-2 gap-2 mt-4 fade-up">
            {postPrompts.map((p) => (
              <button key={p.id} onClick={() => { setTopic(p.prompt); toast(`پرامپت «${p.title}» انتخاب شد`); }} className="bg-[#0d0916] border border-white/5 rounded-2xl p-3 text-right hover:border-purple-500/40 transition">
                <div className="text-2xl mb-1">{p.emoji}</div>
                <p className="text-xs font-bold text-white">{p.title}</p>
                <p className="text-[10px] text-zinc-500 line-clamp-2 mt-1">{p.prompt}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Image */}
      <div className="mx-5 mb-5">
        <button onClick={genImage} disabled={loadingImg} className="w-full bg-[#14101c] border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-3">
          {image ? (
            <img src={image} className="w-full aspect-[4/5] object-cover rounded-2xl" alt="" />
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-[#241d33] flex items-center justify-center">
                <ImagePlus className="w-8 h-8 text-zinc-400" />
              </div>
              <p className="font-bold text-white mt-2">{loadingImg ? 'در حال ساخت تصویر با AI...' : 'ساخت عکس پست با هوش مصنوعی'}</p>
              <p className="text-xs text-zinc-500">فرمت ۱۰۸۰×۱۳۵۰ برای اکسپلور بهتر</p>
            </>
          )}
        </button>
        {/* Image styles */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3" dir="rtl">
          {imageStyles.map((s) => (
            <button key={s.id} onClick={() => setImgStyle(s.id)} className={`px-3 py-2 shrink-0 rounded-full text-xs font-medium transition ${imgStyle === s.id ? 'bg-purple-600 text-white' : 'bg-[#241d33] text-zinc-400'}`}>
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Caption */}
      <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2 justify-end">
          تولید کپشن و سئوی هوشمند <Wand2 className="w-4 h-4 text-purple-400" />
        </h3>
        <textarea
          value={caption || topic}
          onChange={(e) => (caption ? setCaption(e.target.value) : setTopic(e.target.value))}
          rows={caption ? 7 : 2}
          placeholder="موضوع پست را بنویسید (مثلا: تخفیف ویژه محصول)"
          className="w-full bg-[#0d0916] border border-white/10 rounded-2xl px-4 py-3 text-right text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 resize-none text-sm leading-relaxed"
        />
        {caption && (
          <div className="flex items-center justify-between mt-2">
            {!feedbackGiven ? (
              <div className="flex items-center gap-2">
                <button onClick={() => sendFeedback('good')} className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">👍 خوب بود</button>
                <button onClick={() => sendFeedback('needs_edit')} className="text-[11px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400">✏️ نیاز به اصلاح</button>
              </div>
            ) : <span className="text-[11px] text-zinc-500">بازخورد ثبت شد ✓</span>}
            <button onClick={() => { navigator.clipboard?.writeText(caption); toast('کپشن کپی شد 📋'); }} className="text-purple-300 text-xs flex items-center gap-1">
              <Copy className="w-3 h-3" /> کپی
            </button>
          </div>
        )}

        {/* AI QA warnings */}
        {qaWarnings.length > 0 && (
          <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 space-y-1">
            <p className="text-[11px] text-amber-400 font-bold text-right flex items-center gap-1 justify-end">بررسی کیفیت (QA) <AlertCircle className="w-3 h-3" /></p>
            {qaWarnings.map((w, i) => <p key={i} className="text-[11px] text-amber-200 text-right">• {w}</p>)}
          </div>
        )}

        <p className="text-zinc-500 text-xs mt-4 mb-2 text-right">دسته‌بندی محتوا</p>
        <div className="flex flex-wrap gap-2 justify-end">
          {contentCategories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${category === c ? 'bg-purple-600 text-white' : 'bg-[#241d33] text-zinc-400'}`}>{c}</button>
          ))}
        </div>

        <p className="text-zinc-500 text-xs mt-4 mb-2 text-right">لحن نوشتار</p>
        <div className="flex flex-wrap gap-2 justify-end">
          {contentTones.map((t) => (
            <button key={t} onClick={() => setTone(t)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${tone === t ? 'bg-purple-600 text-white' : 'bg-[#241d33] text-zinc-400'}`}>{t}</button>
          ))}
        </div>

        <button onClick={genCaption} disabled={loadingCap} className="w-full mt-5 py-4 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] font-bold text-white flex items-center justify-center gap-2 glow-purple active:scale-[0.98] transition disabled:opacity-60">
          <Wand2 className="w-5 h-5" /> {loadingCap ? 'در حال تولید...' : 'تولید کپشن با Gemini'}
        </button>
      </div>

      {/* One-click magic */}
      <div className="mx-5 mb-5">
        <button onClick={oneClick} className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#f43f7f] to-[#e11d74] font-bold text-white flex items-center justify-center gap-2 glow-pink active:scale-[0.98] transition">
          <Sparkles className="w-5 h-5" /> ساخت کامل پست با یک کلیک (عکس + کپشن)
        </button>
      </div>

      {/* AI Toolbox */}
      <ViralPredictor caption={caption} hasImage={!!image} toast={toast} />
      <VisionAnalyzer imageUrl={image} onCaption={(c) => setCaption(c)} toast={toast} />
      <div className="-mx-5"><BestTimeDetector kind="post" toast={toast} /></div>
      <ProductTagger toast={toast} />
      <HashtagGenerator topic={topic} toast={toast} />
      <CommentAssistant toast={toast} />

      {/* Actions */}
      <div className="mx-5 mb-4 grid grid-cols-2 gap-3">
        <button onClick={() => publish(false)} className="py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 font-bold text-white flex items-center justify-center gap-2 glow-green active:scale-[0.98] transition">
          <Send className="w-4 h-4" /> ذخیره پیش‌نویس
        </button>
        <button onClick={() => publish(true)} className="py-4 rounded-2xl bg-[#14101c] border border-white/10 font-bold text-white flex items-center justify-center gap-2 active:scale-[0.98] transition">
          <Clock className="w-4 h-4" /> زمان‌بندی پست
        </button>
      </div>
    </>
  );
}

/* ---------------- REEL STUDIO ---------------- */
interface Scenario {
  hook: string;
  scenes: string[];
  music: string;
  onScreenText?: string[];
  hashtags: string[];
  tip: string;
}

function ReelStudio({ toast }: { toast: (m: string) => void }) {
  const [topic, setTopic] = useState('');
  const [selected, setSelected] = useState<ReelTemplate | null>(null);
  const [duration, setDuration] = useState('۱۵ ثانیه');
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic) return toast('موضوع ریلز را وارد کنید');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/reel', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, templateType: selected?.title || 'عمومی', duration }),
      });
      const data = await res.json();
      if (data.success) { setScenario(data.scenario as Scenario); toast(`سناریو با ${data.model} ساخته شد 🎬`); }
      else toast(data.error || 'خطا در تولید سناریو');
    } catch { toast('خطای شبکه'); }
    finally { setLoading(false); }
  };

  const copyAll = () => {
    if (!scenario) return;
    const txt = `🎬 ${scenario.hook}\n\n${scenario.scenes.join('\n')}\n\n🎵 ${scenario.music}\n\n${scenario.hashtags.join(' ')}\n\n💡 ${scenario.tip}`;
    navigator.clipboard?.writeText(txt);
    toast('سناریوی کامل کپی شد 📋');
  };

  return (
    <>
      {/* Templates */}
      <div className="mx-5 mb-5">
        <h3 className="font-bold text-white mb-3 text-right flex items-center gap-2 justify-end">قالب‌های ریلز ترند <Flame className="w-4 h-4 text-orange-400" /></h3>
        <div className="grid grid-cols-2 gap-3">
          {reelTemplates.map((t) => (
            <button key={t.id} onClick={() => setSelected(t)} className={`text-right rounded-3xl p-4 border transition ${selected?.id === t.id ? 'bg-gradient-to-br from-[#2e1650] to-[#160a24] border-purple-500' : 'bg-[#14101c] border-white/5'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">{toFa(t.viralScore)}٪ وایرال</span>
                <span className="text-2xl">{t.emoji}</span>
              </div>
              <p className="text-sm font-bold text-white">{t.title}</p>
              <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1 justify-end"><Clock className="w-3 h-3" /> {t.duration}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Selected template detail */}
      {selected && (
        <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5 fade-up">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-emerald-400 font-bold">امتیاز وایرال {toFa(selected.viralScore)}٪</span>
            <h4 className="font-bold text-white flex items-center gap-2">{selected.title} {selected.emoji}</h4>
          </div>
          <div className="bg-[#0d0916] rounded-2xl p-3 mb-3">
            <p className="text-xs text-purple-300 mb-1 text-right">قلاب پیشنهادی:</p>
            <p className="text-sm text-white text-right">{selected.hook}</p>
          </div>
          <div className="space-y-2">
            {selected.structure.map((s, i) => (
              <div key={i} className="flex items-start gap-2 justify-end">
                <p className="text-xs text-zinc-300 text-right flex-1 leading-relaxed">{s}</p>
                <span className="w-5 h-5 rounded-lg bg-purple-500/20 text-purple-300 text-[10px] flex items-center justify-center shrink-0 mt-0.5">{toFa(i + 1)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 justify-end text-xs text-zinc-400">
            <span className="flex items-center gap-1"><Music className="w-3 h-3" /> {selected.music}</span>
          </div>
        </div>
      )}

      {/* Topic input */}
      <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2 justify-end">دستیار سناریوی ریلز <Video className="w-4 h-4 text-purple-400" /></h3>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={2}
          placeholder="موضوع ریلز را بنویسید (مثلا: معرفی محصول جدید فروشگاه)"
          className="w-full bg-[#0d0916] border border-white/10 rounded-2xl px-4 py-3 text-right text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 resize-none text-sm"
        />
        <p className="text-zinc-500 text-xs mt-4 mb-2 text-right">مدت زمان ریلز</p>
        <div className="flex gap-2 justify-end">
          {['۱۵ ثانیه', '۳۰ ثانیه', '۶۰ ثانیه'].map((d) => (
            <button key={d} onClick={() => setDuration(d)} className={`px-4 py-2 rounded-full text-xs font-medium transition ${duration === d ? 'bg-purple-600 text-white' : 'bg-[#241d33] text-zinc-400'}`}>{d}</button>
          ))}
        </div>
        <button onClick={generate} disabled={loading} className="w-full mt-5 py-4 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] font-bold text-white flex items-center justify-center gap-2 glow-purple active:scale-[0.98] transition disabled:opacity-60">
          <Clapperboard className="w-5 h-5" /> {loading ? 'در حال کارگردانی...' : 'تولید سناریوی کامل ریلز با AI'}
        </button>
      </div>

      {/* Generated scenario */}
      {scenario && (
        <div className="mx-5 mb-5 rounded-3xl p-5 bg-gradient-to-br from-[#2a1650] to-[#160a24] border border-purple-500/20 fade-up">
          <div className="flex items-center justify-between mb-4">
            <button onClick={copyAll} className="text-purple-300 text-xs flex items-center gap-1"><Copy className="w-3 h-3" /> کپی همه</button>
            <h4 className="font-bold text-white flex items-center gap-2">سناریوی آماده انتشار 🎬</h4>
          </div>

          <div className="bg-[#0d0916]/60 rounded-2xl p-3 mb-3">
            <p className="text-xs text-orange-300 mb-1 text-right">🔥 قلاب:</p>
            <p className="text-sm text-white text-right leading-relaxed">{scenario.hook}</p>
          </div>

          <p className="text-xs text-purple-300 mb-2 text-right">🎞️ صحنه‌ها:</p>
          <div className="space-y-2 mb-3">
            {scenario.scenes.map((s, i) => (
              <div key={i} className="flex items-start gap-2 justify-end">
                <p className="text-xs text-zinc-200 text-right flex-1 leading-relaxed">{s}</p>
                <span className="w-5 h-5 rounded-lg bg-pink-500/20 text-pink-300 text-[10px] flex items-center justify-center shrink-0 mt-0.5">{toFa(i + 1)}</span>
              </div>
            ))}
          </div>

          {scenario.onScreenText && scenario.onScreenText.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-purple-300 mb-2 text-right">✍️ متن روی ویدیو:</p>
              <div className="flex flex-wrap gap-2 justify-end">
                {scenario.onScreenText.map((t, i) => (
                  <span key={i} className="text-xs bg-[#241d33] text-white px-3 py-1.5 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[#0d0916]/60 rounded-2xl p-3 mb-3 flex items-center gap-2 justify-end">
            <p className="text-sm text-white text-right">{scenario.music}</p>
            <Music className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>

          <div className="flex flex-wrap gap-1.5 justify-end mb-3">
            {scenario.hashtags.map((h, i) => (
              <span key={i} className="text-[11px] text-purple-300 bg-purple-500/10 px-2 py-1 rounded-lg">{h}</span>
            ))}
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-start gap-2 justify-end">
            <p className="text-xs text-amber-200 text-right flex-1 leading-relaxed">{scenario.tip}</p>
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          </div>
        </div>
      )}

      {/* Reel cover: Hook generator */}
      <div className="-mx-5"><HookGenerator topic={topic} toast={toast} /></div>

      {/* Reel production: music, voiceover, effects */}
      <div className="-mx-5"><ReelProducer topic={topic} toast={toast} /></div>

      {/* Best time for reels */}
      <div className="-mx-5"><BestTimeDetector kind="reel" toast={toast} /></div>
    </>
  );
}

/* ============================ SETTINGS TAB ============================ */
function SettingsTab({ toast, lang, changeLang, openConn, authUser, onLogout }: { toast: (m: string) => void; lang: Lang; changeLang: (l: Lang) => void; openConn: () => void; authUser: AuthUser; onLogout: () => void }) {
  const [toggles, setToggles] = useState({ follower: true, comment: true, like: false, autoSchedule: true, dark: true });
  const t = (k: keyof typeof toggles) => setToggles((s) => ({ ...s, [k]: !s[k] }));

  const roadmap = [
    'اتصال کامل به Meta Graph API برای پاسخ خودکار به دایرکت و کامنت با هوش مصنوعی',
    'استودیو ریلز با تولید موزیک، صداگذاری و افکت پیشنهادی هوش مصنوعی',
    'همکاری تیمی و مدیریت چند پیج به‌صورت هم‌زمان',
    'اتصال به فروشگاه و تگ محصول مستقیم روی پست‌ها',
  ];

  return (
    <div className="fade-up">
      <TopHeader title={tr('settings', lang)} sub="مدیریت حساب و ترجیحات" />

      {/* User profile card */}
      <div className="mx-5 mb-5 rounded-3xl p-5 bg-gradient-to-br from-[#2e1650] to-[#160a24] border border-white/5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] flex items-center justify-center text-white text-xl font-black shrink-0">{authUser.displayName?.[0] || authUser.username[0].toUpperCase()}</div>
        <div className="flex-1 text-right">
          <p className="font-bold text-white flex items-center gap-2 justify-end">{authUser.displayName || authUser.username}
            {authUser.role === 'admin' && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> مدیر</span>}
          </p>
          <p className="text-[11px] text-zinc-400" dir="ltr">@{authUser.username}</p>
        </div>
      </div>

      {/* Admin Panel (only for admin) */}
      {authUser.role === 'admin' && <AdminPanel toast={toast} />}

      {/* Brand Kit */}
      <BrandKitManager toast={toast} />

      {/* Language selector */}
      <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2 justify-end">
          {tr('language', lang)} <Globe className="w-4 h-4 text-sky-400" />
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {languages.map((l) => (
            <button key={l.code} onClick={() => { changeLang(l.code); toast(`زبان به ${l.label} تغییر کرد`); }}
              className={`py-3 rounded-2xl text-sm font-medium flex flex-col items-center gap-1 transition ${lang === l.code ? 'bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-white glow-purple' : 'bg-[#241d33] text-zinc-400'}`}>
              <span className="text-2xl">{l.flag}</span>{l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Secure connection center */}
      <div className="mx-5 mb-5">
        <button onClick={openConn} className="w-full rounded-3xl p-5 bg-gradient-to-br from-[#0f2a1e] to-[#0a1a14] border border-emerald-500/20 flex items-center gap-3 active:scale-[0.98] transition">
          <ChevronLeft className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex-1 text-right">
            <p className="text-sm font-bold text-white">مرکز اتصال امن و ضدبن</p>
            <p className="text-[11px] text-emerald-300/70 mt-0.5">مدیریت پروکسی، تونل V2Ray/SOCKS و زمان‌بند فعالیت ایمن</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 flex items-center justify-center shrink-0"><Shield className="w-6 h-6 text-emerald-400" /></div>
        </button>
      </div>

      {/* Auto DM reply */}
      <AutoReplyManager toast={toast} />

      {/* Auto-reply engine tester (keyword → intent → action) */}
      <AutoReplyEngine toast={toast} />

      {/* Knowledge base for chatbot */}
      <KnowledgeManager toast={toast} />

      {/* Team collaboration */}
      <TeamManager toast={toast} />

      {/* Shop */}
      <ShopManager toast={toast} />

      {/* Notifications */}
      <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
        <h3 className="font-bold text-white mb-5 flex items-center gap-2 justify-end">
          اعلان‌ها و ترجیحات <Bell className="w-4 h-4 text-amber-400" />
        </h3>
        <div className="space-y-1">
          <ToggleRow label="اطلاع‌رسانی فالوور جدید" on={toggles.follower} onClick={() => t('follower')} />
          <ToggleRow label="اطلاع‌رسانی کامنت جدید" on={toggles.comment} onClick={() => t('comment')} />
          <ToggleRow label="اطلاع‌رسانی لایک‌های جدید" on={toggles.like} onClick={() => t('like')} />
          <ToggleRow label="زمان‌بندی خودکار در بهترین ساعت" on={toggles.autoSchedule} onClick={() => t('autoSchedule')} />
          <ToggleRow label={tr('darkTheme', lang)} on={toggles.dark} onClick={() => t('dark')} icon="🌙" />
        </div>
      </div>

      {/* Roadmap */}
      <div className="mx-5 mb-5 rounded-3xl p-5 bg-gradient-to-br from-[#2a1650] to-[#1a1030] border border-purple-500/20">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2 justify-end">
          پیشنهاد ارتقا به نسخه‌ی بی‌حد و مرز <span>🚀</span>
        </h3>
        <div className="space-y-3 mb-5">
          {roadmap.map((r, i) => (
            <div key={i} className="flex items-start gap-2 justify-end">
              <p className="text-sm text-zinc-300 text-right leading-relaxed flex-1">{r}</p>
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-2 shrink-0" />
            </div>
          ))}
        </div>
        <button onClick={() => toast('نقشه راه کامل به‌زودی 🚀')} className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] font-bold text-white glow-purple active:scale-[0.98] transition">
          مشاهده نقشه راه کامل ارتقا ←
        </button>
      </div>

      {/* Logout */}
      <div className="mx-5 mb-4">
        <button onClick={onLogout} className="w-full py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 font-bold text-rose-400 flex items-center justify-center gap-2 active:scale-[0.98] transition">
          <LogOut className="w-4 h-4" /> خروج از حساب
        </button>
      </div>
    </div>
  );
}

function ToggleRow({ label, on, onClick, icon }: { label: string; on: boolean; onClick: () => void; icon?: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <button onClick={onClick} className={`w-14 h-8 rounded-full p-1 transition-colors ${on ? 'bg-gradient-to-r from-[#ec4899] to-[#a855f7]' : 'bg-[#2a2437]'}`}>
        <div className={`w-6 h-6 rounded-full bg-white transition-transform ${on ? 'translate-x-0' : 'translate-x-6'}`} />
      </button>
      <span className="text-zinc-200 text-sm flex items-center gap-2">{label} {icon && <span>{icon}</span>}</span>
    </div>
  );
}

/* ============================ AI TOOLBOX ============================ */
interface ViralAnalysis {
  score: number;
  strengths: string[];
  improvements: string[];
  bestTime: string;
  verdict: string;
}

function ViralPredictor({ caption, hasImage, toast }: { caption: string; hasImage: boolean; toast: (m: string) => void }) {
  const [analysis, setAnalysis] = useState<ViralAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!caption) return toast('ابتدا کپشن بسازید تا تحلیل شود');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/viral-predict', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption, hasImage }),
      });
      const data = await res.json();
      if (data.success) { setAnalysis(data.analysis as ViralAnalysis); toast('تحلیل انجام شد 🎯'); }
      else toast(data.error || 'خطا');
    } catch { toast('خطای شبکه'); }
    finally { setLoading(false); }
  };

  const color = !analysis ? '#a855f7' : analysis.score >= 75 ? '#10b981' : analysis.score >= 55 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={run} disabled={loading} className="text-xs px-4 py-2 rounded-full bg-purple-600 text-white font-medium flex items-center gap-1.5 active:scale-95 transition disabled:opacity-60">
          <Gauge className="w-3.5 h-3.5" /> {loading ? 'تحلیل...' : 'تحلیل کن'}
        </button>
        <h3 className="font-bold text-white flex items-center gap-2">پیش‌بینی وایرال شدن <Rocket className="w-4 h-4 text-pink-400" /></h3>
      </div>

      {analysis ? (
        <div className="fade-up">
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#241d33" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(analysis.score / 100) * 264} 264`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{toFa(analysis.score)}</span>
                <span className="text-[10px] text-zinc-500">از ۱۰۰</span>
              </div>
            </div>
          </div>
          <p className="text-center text-sm font-bold mb-4" style={{ color }}>{analysis.verdict}</p>

          <div className="space-y-1.5 mb-3">
            {analysis.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2 justify-end">
                <p className="text-xs text-zinc-300 text-right flex-1">{s}</p>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
          <div className="space-y-1.5 mb-3">
            {analysis.improvements.map((s, i) => (
              <div key={i} className="flex items-start gap-2 justify-end">
                <p className="text-xs text-zinc-300 text-right flex-1">{s}</p>
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
          <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-3 flex items-center gap-2 justify-end">
            <p className="text-xs text-sky-200 text-right flex-1">بهترین زمان: {analysis.bestTime}</p>
            <Clock className="w-4 h-4 text-sky-400 shrink-0" />
          </div>
        </div>
      ) : (
        <p className="text-xs text-zinc-500 text-right leading-relaxed">قبل از انتشار، کپشن را تحلیل کن تا شانس اکسپلور شدن و نکات بهبود را ببینی.</p>
      )}
    </div>
  );
}

function HashtagGenerator({ topic, toast }: { topic: string; toast: (m: string) => void }) {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!topic) return toast('ابتدا موضوع را وارد کنید');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/hashtags', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (data.success) { setTags(data.hashtags); toast('۳۰ هشتگ بهینه ساخته شد #️⃣'); }
    } catch { toast('خطای شبکه'); }
    finally { setLoading(false); }
  };

  return (
    <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={run} disabled={loading} className="text-xs px-4 py-2 rounded-full bg-purple-600 text-white font-medium flex items-center gap-1.5 active:scale-95 transition disabled:opacity-60">
          <Hash className="w-3.5 h-3.5" /> {loading ? 'ساخت...' : 'تولید هشتگ'}
        </button>
        <h3 className="font-bold text-white flex items-center gap-2">هشتگ‌ساز هوشمند <Hash className="w-4 h-4 text-emerald-400" /></h3>
      </div>
      {tags.length > 0 ? (
        <div className="fade-up">
          <div className="flex flex-wrap gap-1.5 justify-end mb-3">
            {tags.map((t, i) => (
              <span key={i} className="text-[11px] text-purple-300 bg-purple-500/10 px-2 py-1 rounded-lg">{t}</span>
            ))}
          </div>
          <button onClick={() => { navigator.clipboard?.writeText(tags.join(' ')); toast('هشتگ‌ها کپی شد 📋'); }} className="text-purple-300 text-xs flex items-center gap-1 mr-auto">
            <Copy className="w-3 h-3" /> کپی همه هشتگ‌ها
          </button>
        </div>
      ) : (
        <p className="text-xs text-zinc-500 text-right leading-relaxed">۳۰ هشتگ بهینه (ترکیب پرمخاطب + متوسط + تخصصی) برای اکسپلور بهتر بساز.</p>
      )}
    </div>
  );
}

function CommentAssistant({ toast }: { toast: (m: string) => void }) {
  const [comment, setComment] = useState('');
  const [replies, setReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!comment) return toast('کامنت مخاطب را وارد کنید');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/comment-reply', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment, tone: 'دوستانه' }),
      });
      const data = await res.json();
      if (data.success) { setReplies(data.replies); toast('۳ پاسخ آماده شد 💬'); }
    } catch { toast('خطای شبکه'); }
    finally { setLoading(false); }
  };

  return (
    <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
      <h3 className="font-bold text-white mb-4 flex items-center gap-2 justify-end">دستیار پاسخ به کامنت <MessageSquareReply className="w-4 h-4 text-purple-400" /></h3>
      <input
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="کامنت مخاطب را اینجا بنویسید..."
        className="w-full bg-[#0d0916] border border-white/10 rounded-2xl px-4 py-3 text-right text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 text-sm mb-3"
      />
      <button onClick={run} disabled={loading} className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] font-bold text-white flex items-center justify-center gap-2 glow-purple active:scale-[0.98] transition disabled:opacity-60">
        <Zap className="w-4 h-4" /> {loading ? 'در حال تولید...' : 'تولید ۳ پاسخ هوشمند'}
      </button>
      {replies.length > 0 && (
        <div className="mt-4 space-y-2 fade-up">
          {replies.map((r, i) => (
            <button key={i} onClick={() => { navigator.clipboard?.writeText(r); toast('پاسخ کپی شد 📋'); }}
              className="w-full text-right bg-[#0d0916] border border-white/5 rounded-2xl p-3 text-xs text-zinc-200 hover:border-purple-500/40 transition flex items-start gap-2 justify-end">
              <span className="flex-1 leading-relaxed">{r}</span>
              <Copy className="w-3 h-3 text-zinc-500 shrink-0 mt-0.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================ GAMIFICATION ============================ */
interface Badge { id: string; label: string; emoji: string; unlocked: boolean; }
function GamificationCard() {
  const [points, setPoints] = useState(120);
  const [streak, setStreak] = useState(5);
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    fetch('/api/gamification').then((r) => r.json()).then((d) => {
      if (d.success) { setPoints(d.data.points ?? 0); setStreak(d.data.streak ?? 0); setBadges(d.badges || []); }
    }).catch(() => {});
  }, []);

  const nextBadge = badges.find((b) => !b.unlocked);
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="mx-5 mb-5 rounded-3xl p-5 bg-gradient-to-br from-[#2e1650] to-[#160a24] border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-amber-300 font-bold"><Flame className="w-4 h-4" /> {toFa(streak)} روز</span>
          <span className="text-zinc-500 text-xs">استریک</span>
        </div>
        <h3 className="font-bold text-white flex items-center gap-2">امتیاز شما <Trophy className="w-4 h-4 text-amber-400" /></h3>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {badges.slice(0, 5).map((b) => (
            <span key={b.id} title={b.label} className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${b.unlocked ? 'bg-amber-500/20' : 'bg-[#241d33] grayscale opacity-40'}`}>{b.emoji}</span>
          ))}
        </div>
        <p className="text-4xl font-black text-white" dir="ltr">{toFa(points)}</p>
      </div>
      <p className="text-xs text-zinc-400 text-right mt-3">
        {nextBadge ? `${toFa(unlockedCount)} نشان کسب کردی • نشان بعدی: ${nextBadge.emoji} ${nextBadge.label}` : 'همه نشان‌ها را کسب کردی! 👑'}
      </p>
    </div>
  );
}

/* ============================ VISION ANALYZER ============================ */
interface VisionResult { score: number; quality: string; composition: string; tips: string[]; caption: string; }
function VisionAnalyzer({ imageUrl, onCaption, toast }: { imageUrl: string; onCaption: (c: string) => void; toast: (m: string) => void }) {
  const [result, setResult] = useState<VisionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!imageUrl) return toast('ابتدا یک تصویر بسازید یا انتخاب کنید');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/vision', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await res.json();
      if (data.success) { setResult(data.analysis as VisionResult); toast('تصویر تحلیل شد 👁️'); }
    } catch { toast('خطای شبکه'); }
    finally { setLoading(false); }
  };

  return (
    <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={run} disabled={loading} className="text-xs px-4 py-2 rounded-full bg-purple-600 text-white font-medium flex items-center gap-1.5 active:scale-95 transition disabled:opacity-60">
          <ScanEye className="w-3.5 h-3.5" /> {loading ? 'تحلیل...' : 'تحلیل تصویر'}
        </button>
        <h3 className="font-bold text-white flex items-center gap-2">تحلیل هوشمند تصویر <ScanEye className="w-4 h-4 text-sky-400" /></h3>
      </div>
      {result ? (
        <div className="fade-up space-y-3">
          <div className="flex items-center justify-between bg-[#0d0916] rounded-2xl p-3">
            <span className="text-2xl font-black text-emerald-400">{toFa(result.score)}<span className="text-xs text-zinc-500">/۱۰۰</span></span>
            <p className="text-xs text-zinc-300 text-right flex-1 mr-3">{result.quality}</p>
          </div>
          <p className="text-xs text-zinc-400 text-right leading-relaxed">{result.composition}</p>
          <div className="space-y-1.5">
            {result.tips.map((t, i) => (
              <div key={i} className="flex items-start gap-2 justify-end">
                <p className="text-xs text-zinc-300 text-right flex-1">{t}</p>
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
          <button onClick={() => { onCaption(result.caption); toast('کپشن پیشنهادی اعمال شد ✨'); }} className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] font-bold text-white text-sm flex items-center justify-center gap-2">
            <Wand2 className="w-4 h-4" /> استفاده از کپشن پیشنهادی تصویر
          </button>
        </div>
      ) : (
        <p className="text-xs text-zinc-500 text-right leading-relaxed">تصویر پست را با AI نقد کن؛ کیفیت، ترکیب‌بندی و کپشن متناسب دریافت کن.</p>
      )}
    </div>
  );
}

/* ============================ CAROUSEL STUDIO ============================ */
function CarouselStudio({ toast }: { toast: (m: string) => void }) {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [slides, setSlides] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic) return toast('موضوع کاروسل را وارد کنید');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/carousel', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, slides: count }),
      });
      const data = await res.json();
      if (data.success) { setSlides(data.slides); setImages(data.images); setActive(0); toast(`کاروسل ${toFa(data.slides.length)} اسلایدی ساخته شد 🎠`); }
      else toast(data.error || 'خطا');
    } catch { toast('خطای شبکه'); }
    finally { setLoading(false); }
  };

  const save = async () => {
    if (!slides.length) return toast('ابتدا کاروسل بسازید');
    await fetch('/api/projects', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'post', title: `کاروسل: ${topic.slice(0, 30)}`, caption: slides.join('\n\n---\n\n'), imageUrl: images[0], status: 'draft' }),
    }).catch(() => {});
    toast('کاروسل در کتابخانه ذخیره شد 💾');
  };

  return (
    <>
      <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2 justify-end">ساخت کاروسل چند-اسلایدی <Layers className="w-4 h-4 text-purple-400" /></h3>
        <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={2}
          placeholder="موضوع کاروسل (مثلا: ۵ نکته برای رشد پیج)"
          className="w-full bg-[#0d0916] border border-white/10 rounded-2xl px-4 py-3 text-right text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 resize-none text-sm" />
        <p className="text-zinc-500 text-xs mt-4 mb-2 text-right">تعداد اسلایدها</p>
        <div className="flex gap-2 justify-end">
          {[3, 4, 5, 6, 7].map((n) => (
            <button key={n} onClick={() => setCount(n)} className={`w-10 h-10 rounded-xl text-sm font-bold transition ${count === n ? 'bg-purple-600 text-white' : 'bg-[#241d33] text-zinc-400'}`}>{toFa(n)}</button>
          ))}
        </div>
        <button onClick={generate} disabled={loading} className="w-full mt-5 py-4 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] font-bold text-white flex items-center justify-center gap-2 glow-purple active:scale-[0.98] transition disabled:opacity-60">
          <Layers className="w-5 h-5" /> {loading ? 'در حال ساخت اسلایدها...' : 'تولید کامل کاروسل با AI'}
        </button>
      </div>

      {slides.length > 0 && (
        <div className="mx-5 mb-5 fade-up">
          {/* Slide preview */}
          <div className="relative rounded-3xl overflow-hidden aspect-square bg-[#14101c] border border-white/5">
            {images[active] && <img src={images[active]} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <p className="text-white text-center font-bold text-lg leading-relaxed whitespace-pre-line">{slides[active]}</p>
            </div>
            <span className="absolute top-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full">{toFa(active + 1)}/{toFa(slides.length)}</span>
          </div>
          {/* Dots + nav */}
          <div className="flex gap-1.5 justify-center mt-3">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} className={`h-2 rounded-full transition-all ${i === active ? 'w-6 bg-purple-500' : 'w-2 bg-zinc-600'}`} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button onClick={save} className="py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 font-bold text-white flex items-center justify-center gap-2 glow-green">
              <Send className="w-4 h-4" /> ذخیره کاروسل
            </button>
            <button onClick={() => { navigator.clipboard?.writeText(slides.join('\n\n')); toast('متن اسلایدها کپی شد 📋'); }} className="py-3.5 rounded-2xl bg-[#14101c] border border-white/10 font-bold text-white flex items-center justify-center gap-2">
              <Copy className="w-4 h-4" /> کپی متن‌ها
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================ LIBRARY TAB ============================ */
interface ProjectRow { id: number; kind: string; title: string | null; caption: string | null; imageUrl: string | null; status: string | null; createdAt: string | null; }
function LibraryTab({ toast }: { toast: (m: string) => void }) {
  const [view, setView] = useState<'projects' | 'calendar' | 'approval'>('projects');
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [filter, setFilter] = useState<'all' | 'post' | 'story' | 'reel'>('all');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch('/api/projects').then((r) => r.json()).then((d) => {
      if (d.success) setProjects(d.projects);
    }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const remove = async (id: number) => {
    await fetch(`/api/projects?id=${id}`, { method: 'DELETE' }).catch(() => {});
    setProjects((p) => p.filter((x) => x.id !== id));
    toast('پروژه حذف شد 🗑️');
  };

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.kind === filter);
  const kindLabel: Record<string, string> = { post: '🖼️ پست', story: '📱 استوری', reel: '🎬 ریلز' };

  return (
    <div className="fade-up">
      <TopHeader title="کتابخانه محتوا" sub={view === 'calendar' ? 'تقویم هوشمند' : view === 'approval' ? 'گردش کار تأیید' : 'پروژه‌های ذخیره‌شده'} />

      {/* View switch */}
      <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-1.5 flex gap-1.5">
        <button onClick={() => setView('projects')} className={`flex-1 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${view === 'projects' ? 'bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white glow-purple' : 'text-zinc-400'}`}><FolderOpen className="w-4 h-4" /> پروژه‌ها</button>
        <button onClick={() => setView('calendar')} className={`flex-1 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${view === 'calendar' ? 'bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white glow-purple' : 'text-zinc-400'}`}><CalendarDays className="w-4 h-4" /> تقویم</button>
        <button onClick={() => setView('approval')} className={`flex-1 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${view === 'approval' ? 'bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white glow-purple' : 'text-zinc-400'}`}><Workflow className="w-4 h-4" /> تأیید</button>
      </div>

      {view === 'calendar' && <SmartCalendar toast={toast} />}
      {view === 'approval' && <ApprovalWorkflow toast={toast} />}
      {view === 'projects' && <>

      {/* Filters */}
      <div className="mx-5 mb-5 flex gap-2 justify-end">
        {([['all', 'همه'], ['post', 'پست'], ['story', 'استوری'], ['reel', 'ریلز']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-4 py-2 rounded-full text-xs font-medium transition ${filter === k ? 'bg-purple-600 text-white' : 'bg-[#241d33] text-zinc-400'}`}>{l}</button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-zinc-500 text-sm py-10">در حال بارگذاری...</p>
      ) : filtered.length === 0 ? (
        <div className="mx-5 bg-[#14101c] border border-dashed border-white/10 rounded-3xl py-16 flex flex-col items-center gap-3">
          <FolderOpen className="w-12 h-12 text-zinc-600" />
          <p className="text-zinc-400 text-sm">هنوز پروژه‌ای ذخیره نشده</p>
          <p className="text-zinc-600 text-xs">از استودیو محتوا بساز و ذخیره کن</p>
        </div>
      ) : (
        <div className="mx-5 space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="bg-[#14101c] border border-white/5 rounded-3xl p-3 flex items-center gap-3">
              {p.imageUrl ? <img src={p.imageUrl} className="w-16 h-16 rounded-2xl object-cover shrink-0" alt="" /> : <div className="w-16 h-16 rounded-2xl bg-[#241d33] flex items-center justify-center shrink-0 text-2xl">{kindLabel[p.kind]?.[0] || '📄'}</div>}
              <div className="flex-1 text-right min-w-0">
                <p className="text-sm font-bold text-white line-clamp-1">{p.title || 'بدون عنوان'}</p>
                <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{p.caption?.slice(0, 60)}</p>
                <div className="flex items-center gap-2 mt-2 justify-end">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.status === 'scheduled' ? 'bg-amber-500/15 text-amber-400' : 'bg-zinc-700/40 text-zinc-400'}`}>{p.status === 'scheduled' ? 'زمان‌بندی' : 'پیش‌نویس'}</span>
                  <span className="text-[10px] text-zinc-500">{kindLabel[p.kind] || p.kind}</span>
                </div>
              </div>
              <button onClick={() => remove(p.id)} className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4 text-rose-400" />
              </button>
            </div>
          ))}
        </div>
      )}
      </>}
    </div>
  );
}

/* ============================ AUTO REPLY MANAGER ============================ */
interface ReplyRule { id: number; keyword: string; reply: string; enabled: boolean | null; }
function AutoReplyManager({ toast }: { toast: (m: string) => void }) {
  const [rules, setRules] = useState<ReplyRule[]>([]);
  const [keyword, setKeyword] = useState('');
  const [reply, setReply] = useState('');
  const [open, setOpen] = useState(false);

  const load = () => { fetch('/api/auto-reply').then((r) => r.json()).then((d) => { if (d.success) setRules(d.rules); }).catch(() => {}); };
  useEffect(load, []);

  const add = async () => {
    if (!keyword || !reply) return toast('کلمه کلیدی و پاسخ را وارد کنید');
    const res = await fetch('/api/auto-reply', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, reply }),
    });
    const data = await res.json();
    if (data.success) { setRules((r) => [data.rule, ...r]); setKeyword(''); setReply(''); toast('قانون پاسخ خودکار اضافه شد 🤖'); }
  };

  const remove = async (id: number) => {
    await fetch(`/api/auto-reply?id=${id}`, { method: 'DELETE' }).catch(() => {});
    setRules((r) => r.filter((x) => x.id !== id));
  };

  return (
    <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between mb-1">
        <ChevronLeft className={`w-4 h-4 text-zinc-500 transition ${open ? '-rotate-90' : ''}`} />
        <h3 className="font-bold text-white flex items-center gap-2">پاسخ خودکار دایرکت <MessageSquare className="w-4 h-4 text-emerald-400" /></h3>
      </button>
      {open && (
        <div className="fade-up mt-4">
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="کلمه کلیدی (مثلا: قیمت)"
            className="w-full bg-[#0d0916] border border-white/10 rounded-2xl px-4 py-3 text-right text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 text-sm mb-2" />
          <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={2} placeholder="پاسخ خودکار..."
            className="w-full bg-[#0d0916] border border-white/10 rounded-2xl px-4 py-3 text-right text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 text-sm resize-none mb-3" />
          <button onClick={add} className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] font-bold text-white text-sm flex items-center justify-center gap-2 mb-4">
            <PlusIcon className="w-4 h-4" /> افزودن قانون
          </button>
          <div className="space-y-2">
            {rules.map((r) => (
              <div key={r.id} className="flex items-center gap-2 bg-[#0d0916] rounded-2xl p-3">
                <button onClick={() => remove(r.id)} className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0"><X className="w-3.5 h-3.5 text-rose-400" /></button>
                <div className="flex-1 text-right min-w-0">
                  <p className="text-xs font-bold text-purple-300">#{r.keyword}</p>
                  <p className="text-xs text-zinc-400 line-clamp-1">{r.reply}</p>
                </div>
              </div>
            ))}
            {rules.length === 0 && <p className="text-xs text-zinc-600 text-center py-2">هنوز قانونی تعریف نشده</p>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================ REPORT WINDOW ============================ */
interface ReportData {
  period: string;
  summary: Record<string, string | number>;
  highlights: string[];
  recommendations: string[];
}
function openReportWindow(report: ReportData) {
  const w = window.open('', '_blank');
  if (!w) return;
  const s = report.summary;
  w.document.write(`<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>گزارش تحلیلی</title>
  <style>
    body{font-family:Tahoma,sans-serif;background:#0a0510;color:#fff;padding:40px;max-width:800px;margin:auto}
    h1{background:linear-gradient(90deg,#f43f7f,#a855f7);-webkit-background-clip:text;background-clip:text;color:transparent}
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:24px 0}
    .card{background:#14101c;border:1px solid #ffffff11;border-radius:20px;padding:20px;text-align:center}
    .card b{font-size:28px;display:block}.card span{color:#a1a1aa;font-size:13px}
    ul{line-height:2;color:#d4d4d8}h2{color:#a855f7;margin-top:32px}
    @media print{body{background:#fff;color:#000}.card{border-color:#ddd}}
  </style></head><body>
  <h1>📊 گزارش تحلیلی پیج — میلانو</h1><p style="color:#a1a1aa">${report.period}</p>
  <div class="grid">
    <div class="card"><b>${toFa(String(s.followers))}</b><span>فالوور</span></div>
    <div class="card"><b>${s.followerGrowth}</b><span>رشد</span></div>
    <div class="card"><b>${s.engagementRate}</b><span>تعامل</span></div>
    <div class="card"><b>${toFa(String(s.totalLikes))}</b><span>لایک</span></div>
    <div class="card"><b>${toFa(String(s.totalComments))}</b><span>کامنت</span></div>
    <div class="card"><b>${toFa(String(s.healthScore))}</b><span>سلامت پیج</span></div>
  </div>
  <h2>✨ نکات برجسته</h2><ul>${report.highlights.map((h) => `<li>${h}</li>`).join('')}</ul>
  <h2>🚀 پیشنهادها</h2><ul>${report.recommendations.map((r) => `<li>${r}</li>`).join('')}</ul>
  <p style="margin-top:40px;text-align:center;color:#71717a">برای ذخیره PDF، از منوی چاپ مرورگر «Save as PDF» را انتخاب کنید.</p>
  <script>setTimeout(()=>window.print(),600)</script>
  </body></html>`);
  w.document.close();
}

/* ============================ PAGE SWITCHER + META CONNECT ============================ */
interface PageRow { id: number; handle: string; displayName: string | null; avatarColor: string | null; followers: number | null; connected: boolean | null; isActive: boolean | null; }
function PageSwitcher({ toast }: { toast: (m: string) => void }) {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [open, setOpen] = useState(false);

  const load = () => { fetch('/api/pages').then((r) => r.json()).then((d) => { if (d.success) setPages(d.pages); }).catch(() => {}); };
  useEffect(() => {
    load();
    // نمایش پیام موفقیت اتصال Meta پس از بازگشت از OAuth
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('meta') === 'connected') { toast('✅ اتصال به اینستاگرام برقرار شد'); window.history.replaceState({}, '', '/'); setTimeout(load, 500); }
      else if (p.get('meta') === 'error') { toast('خطا در اتصال به Meta'); window.history.replaceState({}, '', '/'); }
    }
  }, []);

  const active = pages.find((p) => p.isActive) || pages[0];
  const anyConnected = pages.some((p) => p.connected);

  const switchPage = async (id: number) => {
    await fetch('/api/pages', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).catch(() => {});
    setPages((ps) => ps.map((p) => ({ ...p, isActive: p.id === id })));
    setOpen(false);
    toast('پیج فعال تغییر کرد');
  };

  const addDemo = async () => {
    const names = [['@shop_style', 'فروشگاه استایل', 21400], ['@food_lab', 'کافه فودلب', 15800], ['@tech_ir', 'تک ایران', 34200]];
    const [handle, name, f] = names[pages.length % names.length];
    const res = await fetch('/api/pages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ handle, displayName: name, followers: f, avatarColor: ['#ec4899', '#38bdf8', '#f59e0b'][pages.length % 3] }) });
    const d = await res.json();
    if (d.success) { setPages((ps) => [...ps, d.page]); toast('پیج جدید اضافه شد'); }
  };

  if (!anyConnected) {
    return (
      <div className="mx-5 mb-5 rounded-3xl p-5 bg-gradient-to-br from-[#2e1650] to-[#160a24] border border-purple-500/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-yellow-500 flex items-center justify-center text-xl shrink-0">📷</div>
          <div className="flex-1 text-right">
            <p className="text-sm font-bold text-white">اتصال به اینستاگرام</p>
            <p className="text-xs text-zinc-400">برای انتشار مستقیم و آمار واقعی متصل شوید</p>
          </div>
        </div>
        <a href="/api/meta/oauth" className="block w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] font-bold text-white text-center glow-purple active:scale-[0.98] transition">
          اتصال با Meta Graph API
        </a>
      </div>
    );
  }

  return (
    <div className="mx-5 mb-5">
      <button onClick={() => setOpen((o) => !o)} className="w-full bg-[#14101c] border border-white/5 rounded-3xl p-3 flex items-center gap-3">
        <ChevronLeft className={`w-4 h-4 text-zinc-500 transition ${open ? '-rotate-90' : ''}`} />
        <div className="flex-1 text-right">
          <p className="text-sm font-bold text-white">{active?.displayName}</p>
          <p className="text-[11px] text-zinc-500" dir="ltr">{active?.handle} • {toFa((active?.followers || 0).toLocaleString('en-US'))}</p>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ background: active?.avatarColor || '#a855f7' }}>{active?.displayName?.[0] || 'P'}</div>
      </button>
      {open && (
        <div className="mt-2 bg-[#14101c] border border-white/5 rounded-3xl p-2 fade-up">
          {pages.map((p) => (
            <button key={p.id} onClick={() => switchPage(p.id)} className={`w-full flex items-center gap-3 p-2.5 rounded-2xl transition ${p.isActive ? 'bg-purple-500/15' : 'hover:bg-white/5'}`}>
              {p.isActive && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
              <div className="flex-1 text-right">
                <p className="text-sm text-white">{p.displayName}</p>
                <p className="text-[11px] text-zinc-500" dir="ltr">{p.handle}</p>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: p.avatarColor || '#a855f7' }}>{p.displayName?.[0]}</div>
            </button>
          ))}
          <button onClick={addDemo} className="w-full flex items-center justify-center gap-2 p-3 mt-1 rounded-2xl border border-dashed border-white/10 text-zinc-400 text-sm">
            <PlusIcon className="w-4 h-4" /> افزودن پیج جدید
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================ BEST TIME DETECTOR ============================ */
interface BestTime { recommended: { day: string; time: string; score: number }; slots: { day: string; time: string; score: number }[]; insight: string; confidence?: string; basedOn?: string; }
function BestTimeDetector({ kind, toast }: { kind: 'post' | 'story' | 'reel'; toast: (m: string) => void }) {
  const [data, setData] = useState<BestTime | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/best-time', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind }) });
      const d = await res.json();
      if (d.success) { setData(d); toast('بهترین زمان محاسبه شد ⏰'); }
    } catch { toast('خطا'); }
    finally { setLoading(false); }
  };

  return (
    <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={run} disabled={loading} className="text-xs px-4 py-2 rounded-full bg-purple-600 text-white font-medium flex items-center gap-1.5 active:scale-95 transition disabled:opacity-60">
          <Clock className="w-3.5 h-3.5" /> {loading ? '...' : 'تشخیص هوشمند'}
        </button>
        <h3 className="font-bold text-white flex items-center gap-2">بهترین زمان انتشار <Gauge className="w-4 h-4 text-emerald-400" /></h3>
      </div>
      {data ? (
        <div className="fade-up">
          <div className="rounded-2xl p-4 bg-gradient-to-br from-[#2e1650] to-[#160a24] mb-3 text-center">
            <p className="text-xs text-purple-300">پیشنهاد برتر</p>
            <p className="text-lg font-black text-white mt-1">{data.recommended.day} • {data.recommended.time}</p>
            <span className="inline-block mt-2 text-[11px] bg-emerald-500/15 text-emerald-400 px-3 py-0.5 rounded-full">امتیاز {toFa(data.recommended.score)}٪</span>
          </div>
          <div className="space-y-2 mb-3">
            {data.slots.slice(1).map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 w-8">{toFa(s.score)}</span>
                <div className="flex-1 h-2 rounded-full bg-[#241d33] overflow-hidden"><div className="h-full bg-gradient-to-l from-purple-500 to-pink-500" style={{ width: `${s.score}%` }} /></div>
                <span className="text-xs text-zinc-300 w-40 text-right">{s.day} • {s.time}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-500 text-right leading-relaxed bg-[#0d0916] rounded-2xl p-3">{data.insight}</p>
          {(data.confidence || data.basedOn) && (
            <div className="mt-2 flex items-center gap-2 justify-end flex-wrap">
              {data.confidence && <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400">اطمینان: {data.confidence}</span>}
              {data.basedOn && <span className="text-[10px] text-zinc-600 text-right">مبنا: {data.basedOn}</span>}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-zinc-500 text-right leading-relaxed">بر اساس رفتار مخاطبان، بهترین روز و ساعت انتشار این نوع محتوا را پیدا کن.</p>
      )}
    </div>
  );
}

/* ============================ REEL PRODUCER (music/voice/effects) ============================ */
interface Production { voiceover: string; music: { name: string; bpm: string; vibe: string }[]; effects: { name: string; desc: string }[]; captions: string; tip: string; }
function ReelProducer({ topic, toast }: { topic: string; toast: (m: string) => void }) {
  const [mood, setMood] = useState('پرانرژی');
  const [prod, setProd] = useState<Production | null>(null);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const run = async () => {
    if (!topic) return toast('ابتدا موضوع ریلز را وارد کنید');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/reel-produce', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, mood }) });
      const d = await res.json();
      if (d.success) { setProd(d); toast('بسته پروداکشن آماده شد 🎛️'); }
    } catch { toast('خطا'); }
    finally { setLoading(false); }
  };

  const playVoice = () => {
    if (!prod?.voiceover || typeof window === 'undefined' || !window.speechSynthesis) return toast('صداگذاری در این مرورگر پشتیبانی نمی‌شود');
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(prod.voiceover);
    u.lang = 'fa-IR'; u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="mx-5 mb-5 rounded-3xl p-5 bg-gradient-to-br from-[#2a1650] to-[#160a24] border border-purple-500/20">
      <h3 className="font-bold text-white mb-4 flex items-center gap-2 justify-end">پروداکشن هوشمند ریلز <Music className="w-4 h-4 text-pink-400" /></h3>
      <p className="text-zinc-400 text-xs mb-2 text-right">حال‌وهوای ریلز</p>
      <div className="flex gap-2 justify-end mb-4">
        {['پرانرژی', 'آرام', 'حماسی'].map((m) => (
          <button key={m} onClick={() => setMood(m)} className={`px-4 py-2 rounded-full text-xs font-medium transition ${mood === m ? 'bg-purple-600 text-white' : 'bg-[#241d33] text-zinc-400'}`}>{m}</button>
        ))}
      </div>
      <button onClick={run} disabled={loading} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] font-bold text-white flex items-center justify-center gap-2 glow-purple active:scale-[0.98] transition disabled:opacity-60">
        <Music className="w-4 h-4" /> {loading ? 'در حال ساخت...' : 'تولید موزیک + صداگذاری + افکت'}
      </button>

      {prod && (
        <div className="fade-up mt-4 space-y-3">
          {/* Voiceover */}
          <div className="bg-[#0d0916]/60 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <button onClick={playVoice} className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                <Zap className="w-3 h-3" /> {speaking ? 'در حال پخش...' : 'پخش صدا'}
              </button>
              <p className="text-xs text-pink-300">🎙️ متن صداگذاری (Voiceover)</p>
            </div>
            <p className="text-sm text-white text-right leading-relaxed">{prod.voiceover}</p>
          </div>
          {/* Music */}
          <div>
            <p className="text-xs text-purple-300 text-right mb-2">🎵 موزیک پیشنهادی</p>
            {prod.music.map((m, i) => (
              <div key={i} className="flex items-center justify-between bg-[#0d0916]/60 rounded-2xl p-3 mb-2">
                <span className="text-[10px] text-zinc-500">{m.bpm}</span>
                <div className="text-right flex-1 mr-2"><p className="text-sm text-white">{m.name}</p><p className="text-[10px] text-zinc-500">{m.vibe}</p></div>
                <Music className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            ))}
          </div>
          {/* Effects */}
          <div>
            <p className="text-xs text-purple-300 text-right mb-2">✨ افکت‌ها و ترنزیشن</p>
            <div className="space-y-1.5">
              {prod.effects.map((e, i) => (
                <div key={i} className="flex items-start gap-2 justify-end">
                  <p className="text-xs text-zinc-300 text-right flex-1"><span className="text-white font-bold">{e.name}</span> — {e.desc}</p>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-start gap-2 justify-end">
            <p className="text-xs text-amber-200 text-right flex-1 leading-relaxed">{prod.tip}</p>
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================ TEAM & SHOP (settings sections) ============================ */
interface Member { id: number; name: string; email: string | null; role: string | null; avatarColor: string | null; }
function TeamManager({ toast }: { toast: (m: string) => void }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState('editor');
  const [open, setOpen] = useState(false);
  const roles: Record<string, string> = { owner: 'مالک', admin: 'ادمین', editor: 'ویرایشگر', viewer: 'بازدیدکننده' };

  useEffect(() => { fetch('/api/team').then((r) => r.json()).then((d) => { if (d.success) setMembers(d.members); }).catch(() => {}); }, []);

  const add = async () => {
    if (!name) return toast('نام عضو را وارد کنید');
    const res = await fetch('/api/team', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, role }) });
    const d = await res.json();
    if (d.success) { setMembers((m) => [...m, d.member]); setName(''); toast('عضو جدید به تیم اضافه شد 👥'); }
  };
  const remove = async (id: number) => { await fetch(`/api/team?id=${id}`, { method: 'DELETE' }).catch(() => {}); setMembers((m) => m.filter((x) => x.id !== id)); };

  return (
    <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between mb-1">
        <ChevronLeft className={`w-4 h-4 text-zinc-500 transition ${open ? '-rotate-90' : ''}`} />
        <h3 className="font-bold text-white flex items-center gap-2">همکاری تیمی <Users className="w-4 h-4 text-sky-400" /></h3>
      </button>
      {open && (
        <div className="fade-up mt-4">
          <div className="flex gap-2 mb-3">
            <select value={role} onChange={(e) => setRole(e.target.value)} className="bg-[#0d0916] border border-white/10 rounded-2xl px-3 text-white text-sm focus:outline-none">
              {Object.entries(roles).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="نام عضو تیم" className="flex-1 bg-[#0d0916] border border-white/10 rounded-2xl px-4 py-3 text-right text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 text-sm" />
          </div>
          <button onClick={add} className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] font-bold text-white text-sm flex items-center justify-center gap-2 mb-4"><PlusIcon className="w-4 h-4" /> دعوت عضو جدید</button>
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 bg-[#0d0916] rounded-2xl p-2.5">
                <button onClick={() => remove(m.id)} className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0"><X className="w-3.5 h-3.5 text-rose-400" /></button>
                <div className="flex-1 text-right"><p className="text-sm text-white">{m.name}</p><p className="text-[11px] text-zinc-500">{roles[m.role || 'editor']}</p></div>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: m.avatarColor || '#ec4899' }}>{m.name[0]}</div>
              </div>
            ))}
            {members.length === 0 && <p className="text-xs text-zinc-600 text-center py-2">هنوز عضوی اضافه نشده</p>}
          </div>
        </div>
      )}
    </div>
  );
}

interface ProductRow { id: number; name: string; price: string | null; link: string | null; imageUrl: string | null; }
function ShopManager({ toast }: { toast: (m: string) => void }) {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => { fetch('/api/products').then((r) => r.json()).then((d) => { if (d.success) setProducts(d.products); }).catch(() => {}); }, []);

  const add = async () => {
    if (!name) return toast('نام محصول را وارد کنید');
    const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, price }) });
    const d = await res.json();
    if (d.success) { setProducts((p) => [...p, d.product]); setName(''); setPrice(''); toast('محصول به فروشگاه اضافه شد 🛍️'); }
  };
  const remove = async (id: number) => { await fetch(`/api/products?id=${id}`, { method: 'DELETE' }).catch(() => {}); setProducts((p) => p.filter((x) => x.id !== id)); };

  return (
    <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between mb-1">
        <ChevronLeft className={`w-4 h-4 text-zinc-500 transition ${open ? '-rotate-90' : ''}`} />
        <h3 className="font-bold text-white flex items-center gap-2">فروشگاه و تگ محصول <ShoppingBagIcon /></h3>
      </button>
      {open && (
        <div className="fade-up mt-4">
          <div className="flex gap-2 mb-3">
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="قیمت" className="w-24 bg-[#0d0916] border border-white/10 rounded-2xl px-3 py-3 text-right text-white placeholder:text-zinc-600 focus:outline-none text-sm" />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="نام محصول" className="flex-1 bg-[#0d0916] border border-white/10 rounded-2xl px-4 py-3 text-right text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 text-sm" />
          </div>
          <button onClick={add} className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] font-bold text-white text-sm flex items-center justify-center gap-2 mb-4"><PlusIcon className="w-4 h-4" /> افزودن محصول</button>
          <div className="space-y-2">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-3 bg-[#0d0916] rounded-2xl p-2.5">
                <button onClick={() => remove(p.id)} className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0"><X className="w-3.5 h-3.5 text-rose-400" /></button>
                <div className="flex-1 text-right"><p className="text-sm text-white">{p.name}</p>{p.price && <p className="text-[11px] text-emerald-400">{p.price} تومان</p>}</div>
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">🏷️</div>
              </div>
            ))}
            {products.length === 0 && <p className="text-xs text-zinc-600 text-center py-2">هنوز محصولی اضافه نشده</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function ShoppingBagIcon() {
  return <span className="text-purple-400 text-base">🛍️</span>;
}

/* ============================ PRODUCT TAGGER (on post) ============================ */
function ProductTagger({ toast }: { toast: (m: string) => void }) {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [tagged, setTagged] = useState<number[]>([]);

  useEffect(() => { fetch('/api/products').then((r) => r.json()).then((d) => { if (d.success) setProducts(d.products); }).catch(() => {}); }, []);

  const toggle = (id: number) => {
    setTagged((t) => t.includes(id) ? t.filter((x) => x !== id) : [...t, id]);
  };

  return (
    <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
      <h3 className="font-bold text-white mb-4 flex items-center gap-2 justify-end">تگ محصول روی پست <span className="text-base">🏷️</span></h3>
      {products.length === 0 ? (
        <p className="text-xs text-zinc-500 text-right leading-relaxed">هنوز محصولی ثبت نشده. از تنظیمات › فروشگاه محصول اضافه کنید تا اینجا قابل تگ باشد.</p>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <button key={p.id} onClick={() => toggle(p.id)} className={`w-full flex items-center gap-3 p-2.5 rounded-2xl transition border ${tagged.includes(p.id) ? 'bg-purple-500/15 border-purple-500/40' : 'bg-[#0d0916] border-transparent'}`}>
              {tagged.includes(p.id) && <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />}
              <div className="flex-1 text-right"><p className="text-sm text-white">{p.name}</p>{p.price && <p className="text-[11px] text-emerald-400">{p.price} تومان</p>}</div>
              <span className="text-lg shrink-0">🛍️</span>
            </button>
          ))}
          {tagged.length > 0 && (
            <button onClick={() => toast(`${toFa(tagged.length)} محصول به پست تگ شد 🏷️`)} className="w-full py-3 mt-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 font-bold text-white text-sm">
              اعمال تگ ({toFa(tagged.length)} محصول)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================ HOOK GENERATOR (reel cover) ============================ */
function HookGenerator({ topic, toast }: { topic: string; toast: (m: string) => void }) {
  const [hooks, setHooks] = useState<string[]>([]);
  const [coverPrompt, setCoverPrompt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!topic) return toast('ابتدا موضوع ریلز را وارد کنید');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/hook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic }) });
      const d = await res.json();
      if (d.success) { setHooks(d.hooks); setCoverPrompt(d.coverPrompt); setCoverImage(d.coverImage); setSelected(d.hooks[0]); toast('کاور و قلاب ساخته شد ⚓'); }
    } catch { toast('خطا'); }
    finally { setLoading(false); }
  };

  return (
    <div className="mx-5 mb-5 rounded-3xl p-5 bg-gradient-to-br from-[#2a1650] to-[#160a24] border border-purple-500/20">
      <h3 className="font-bold text-white mb-3 flex items-center gap-2 justify-end">کاور ریلز + قلاب (Hook) <Anchor className="w-4 h-4 text-pink-400" /></h3>
      <p className="text-xs text-zinc-400 text-right mb-4 leading-relaxed">کاور خوب بدون متن خوب، مثل ویترین شیک بدون کالاست. قلاب متنی + طرح کاور بساز.</p>
      <button onClick={run} disabled={loading} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] font-bold text-white flex items-center justify-center gap-2 glow-purple active:scale-[0.98] transition disabled:opacity-60">
        <Anchor className="w-4 h-4" /> {loading ? 'در حال ساخت...' : 'تولید قلاب + کاور'}
      </button>

      {hooks.length > 0 && (
        <div className="fade-up mt-4">
          {coverImage && (
            <div className="relative rounded-2xl overflow-hidden mb-4" style={{ aspectRatio: '9/16', maxHeight: 320, margin: '0 auto' }}>
              <img src={coverImage} className="w-full h-full object-cover" alt="cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <p className="text-white text-center font-black text-2xl leading-snug drop-shadow-lg">{selected}</p>
              </div>
            </div>
          )}
          <p className="text-xs text-purple-300 text-right mb-2">۱️⃣ متن قلاب (روی کاور بگذار):</p>
          <div className="space-y-2 mb-4">
            {hooks.map((h, i) => (
              <button key={i} onClick={() => { setSelected(h); navigator.clipboard?.writeText(h); toast('قلاب انتخاب و کپی شد 📋'); }}
                className={`w-full text-right rounded-2xl p-3 text-sm transition border flex items-center gap-2 justify-end ${selected === h ? 'bg-purple-500/15 border-purple-500/40 text-white' : 'bg-[#0d0916]/60 border-transparent text-zinc-300'}`}>
                <span className="flex-1">{h}</span>
                <Copy className="w-3 h-3 text-zinc-500 shrink-0" />
              </button>
            ))}
          </div>
          <div className="bg-[#0d0916]/60 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-1">
              <button onClick={() => { navigator.clipboard?.writeText(coverPrompt); toast('پرامپت کاور کپی شد 📋'); }} className="text-purple-300 text-[10px] flex items-center gap-1"><Copy className="w-3 h-3" /> کپی</button>
              <p className="text-xs text-purple-300">۲️⃣ پرامپت طراحی کاور:</p>
            </div>
            <p className="text-[11px] text-zinc-400 text-right leading-relaxed" dir="ltr">{coverPrompt}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================ CHATBOT WIDGET (RAG) ============================ */
interface KbItem { id: number; category: string | null; question: string; answer: string; }
function KnowledgeManager({ toast }: { toast: (m: string) => void }) {
  const [items, setItems] = useState<KbItem[]>([]);
  const [cat, setCat] = useState('عمومی');
  const [q, setQ] = useState('');
  const [a, setA] = useState('');
  const [open, setOpen] = useState(false);
  const cats = ['قیمت', 'خرید', 'ارسال', 'پشتیبانی', 'تخفیف', 'عمومی'];

  useEffect(() => { fetch('/api/knowledge').then((r) => r.json()).then((d) => { if (d.success) setItems(d.items); }).catch(() => {}); }, []);

  const add = async () => {
    if (!q || !a) return toast('سوال و پاسخ را وارد کنید');
    const res = await fetch('/api/knowledge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category: cat, question: q, answer: a, keywords: q }) });
    const d = await res.json();
    if (d.success) { setItems((it) => [...it, d.item]); setQ(''); setA(''); toast('به پایگاه دانش اضافه شد 🧠'); }
  };
  const remove = async (id: number) => { await fetch(`/api/knowledge?id=${id}`, { method: 'DELETE' }).catch(() => {}); setItems((it) => it.filter((x) => x.id !== id)); };

  return (
    <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between mb-1">
        <ChevronLeft className={`w-4 h-4 text-zinc-500 transition ${open ? '-rotate-90' : ''}`} />
        <h3 className="font-bold text-white flex items-center gap-2">پایگاه دانش چت‌بات <BrainCircuit className="w-4 h-4 text-sky-400" /></h3>
      </button>
      {open && (
        <div className="fade-up mt-4">
          <div className="flex gap-2 mb-2">
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="bg-[#0d0916] border border-white/10 rounded-2xl px-3 text-white text-sm focus:outline-none">
              {cats.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="سوال متداول" className="flex-1 bg-[#0d0916] border border-white/10 rounded-2xl px-4 py-3 text-right text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 text-sm" />
          </div>
          <textarea value={a} onChange={(e) => setA(e.target.value)} rows={2} placeholder="پاسخ..." className="w-full bg-[#0d0916] border border-white/10 rounded-2xl px-4 py-3 text-right text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 text-sm resize-none mb-3" />
          <button onClick={add} className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] font-bold text-white text-sm flex items-center justify-center gap-2 mb-4"><PlusIcon className="w-4 h-4" /> افزودن به پایگاه دانش</button>
          <div className="space-y-2">
            {items.map((it) => (
              <div key={it.id} className="flex items-start gap-2 bg-[#0d0916] rounded-2xl p-3">
                <button onClick={() => remove(it.id)} className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0"><X className="w-3.5 h-3.5 text-rose-400" /></button>
                <div className="flex-1 text-right min-w-0">
                  <p className="text-xs font-bold text-white">{it.question}</p>
                  <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{it.answer}</p>
                  <span className="text-[9px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full mt-1 inline-block">{it.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================ AUTO-REPLY ENGINE TESTER ============================ */
function AutoReplyEngine({ toast }: { toast: (m: string) => void }) {
  const [msg, setMsg] = useState('');
  const [result, setResult] = useState<{ reply: string; intent: string; steps: { step: string; result: string }[]; source: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const test = async () => {
    if (!msg) return toast('یک پیام نمونه بنویسید');
    setLoading(true);
    try {
      const res = await fetch('/api/auto-reply/engine', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg }) });
      const d = await res.json();
      if (d.success) { setResult(d); toast('موتور پاسخ اجرا شد 🤖'); }
    } catch { toast('خطا'); }
    finally { setLoading(false); }
  };

  return (
    <div className="mx-5 mb-5 bg-[#14101c] border border-white/5 rounded-3xl p-5">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between mb-1">
        <ChevronLeft className={`w-4 h-4 text-zinc-500 transition ${open ? '-rotate-90' : ''}`} />
        <h3 className="font-bold text-white flex items-center gap-2">موتور پاسخ هوشمند (تست) <BrainCircuit className="w-4 h-4 text-emerald-400" /></h3>
      </button>
      {open && (
        <div className="fade-up mt-4">
          <p className="text-xs text-zinc-400 text-right mb-3 leading-relaxed">موتور سه‌مرحله‌ای: کلمه‌کلیدی ← تشخیص نیت ← اقدام. یک پیام مشتری را شبیه‌سازی کنید.</p>
          <div className="flex gap-2 mb-3">
            <button onClick={test} disabled={loading} className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] flex items-center justify-center shrink-0"><SendIcon className="w-5 h-5 text-white" /></button>
            <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="مثلا: قیمت این محصول چنده؟" className="flex-1 bg-[#0d0916] border border-white/10 rounded-2xl px-4 text-right text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 text-sm" />
          </div>
          {result && (
            <div className="fade-up space-y-2">
              {result.steps.map((s, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#0d0916] rounded-2xl p-2.5">
                  <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 text-[10px] flex items-center justify-center shrink-0">{toFa(i + 1)}</span>
                  <div className="flex-1 text-right"><p className="text-[11px] text-zinc-400">{s.step}</p><p className="text-xs text-white">{s.result}</p></div>
                </div>
              ))}
              <div className="bg-gradient-to-br from-[#2e1650] to-[#160a24] rounded-2xl p-3 mt-2">
                <p className="text-[10px] text-purple-300 mb-1 text-right">پاسخ نهایی موتور:</p>
                <p className="text-sm text-white text-right leading-relaxed">{result.reply}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================ SMART CALENDAR (drag & drop) ============================ */
interface CalItem { id: number; title: string; kind: string | null; status: string | null; dayIndex: number | null; time: string | null; color: string | null; }
const CAL_DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
const STATUS_COLORS: Record<string, string> = { draft: '#71717a', pending_approval: '#f59e0b', approved: '#10b981', rejected: '#f43f5e', scheduled: '#38bdf8', published: '#a855f7', failed: '#dc2626' };
const STATUS_LABELS: Record<string, string> = { draft: 'پیش‌نویس', pending_approval: 'در انتظار تأیید', approved: 'تأیید شده', rejected: 'رد شده', scheduled: 'زمان‌بندی', published: 'منتشر شده', failed: 'ناموفق' };

function SmartCalendar({ toast }: { toast: (m: string) => void }) {
  const [items, setItems] = useState<CalItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'post' | 'story' | 'reel'>('all');
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState('post');
  const [day, setDay] = useState(0);

  const load = () => { fetch('/api/calendar').then((r) => r.json()).then((d) => { if (d.success) setItems(d.items); }).catch(() => {}); };
  useEffect(load, []);

  const add = async () => {
    if (!title) return toast('عنوان محتوا را وارد کنید');
    const res = await fetch('/api/calendar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, kind, dayIndex: day, status: 'draft' }) });
    const d = await res.json();
    if (d.success) { setItems((it) => [...it, d.item]); setTitle(''); toast('به تقویم اضافه شد 📅'); }
  };

  const moveTo = async (id: number, newDay: number) => {
    const item = items.find((i) => i.id === id);
    // تشخیص تداخل: بیش از ۳ آیتم در یک روز
    const dayCount = items.filter((i) => i.dayIndex === newDay && i.id !== id).length;
    setItems((it) => it.map((i) => i.id === id ? { ...i, dayIndex: newDay } : i));
    await fetch('/api/calendar', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, dayIndex: newDay }) }).catch(() => {});
    if (dayCount >= 3) toast(`⚠️ تداخل: ${CAL_DAYS[newDay]} شلوغ است (${toFa(dayCount + 1)} آیتم)`);
    else toast(`«${item?.title}» به ${CAL_DAYS[newDay]} منتقل شد`);
  };

  const cycleStatus = async (item: CalItem) => {
    const flow = ['draft', 'pending_approval', 'approved', 'scheduled', 'published'];
    const idx = flow.indexOf(item.status || 'draft');
    const next = flow[(idx + 1) % flow.length];
    setItems((it) => it.map((i) => i.id === item.id ? { ...i, status: next } : i));
    await fetch('/api/calendar', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, status: next }) }).catch(() => {});
    toast(`وضعیت: ${STATUS_LABELS[next]}`);
  };

  const remove = async (id: number) => { await fetch(`/api/calendar?id=${id}`, { method: 'DELETE' }).catch(() => {}); setItems((it) => it.filter((x) => x.id !== id)); };

  const shown = filter === 'all' ? items : items.filter((i) => i.kind === filter);

  return (
    <div className="fade-up">
      {/* Add */}
      <div className="mx-5 mb-4 bg-[#14101c] border border-white/5 rounded-3xl p-4">
        <div className="flex gap-2 mb-2">
          <select value={kind} onChange={(e) => setKind(e.target.value)} className="bg-[#0d0916] border border-white/10 rounded-2xl px-2 text-white text-xs focus:outline-none">
            <option value="post">پست</option><option value="story">استوری</option><option value="reel">ریلز</option>
          </select>
          <select value={day} onChange={(e) => setDay(+e.target.value)} className="bg-[#0d0916] border border-white/10 rounded-2xl px-2 text-white text-xs focus:outline-none">
            {CAL_DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
          </select>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان محتوا" className="flex-1 bg-[#0d0916] border border-white/10 rounded-2xl px-3 py-2.5 text-right text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 text-sm" />
          <button onClick={add} className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] flex items-center justify-center shrink-0"><PlusIcon className="w-5 h-5 text-white" /></button>
        </div>
      </div>

      {/* Filters */}
      <div className="mx-5 mb-4 flex gap-2 justify-end items-center">
        <Filter className="w-3.5 h-3.5 text-zinc-500" />
        {([['all', 'همه'], ['post', 'پست'], ['story', 'استوری'], ['reel', 'ریلز']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === k ? 'bg-purple-600 text-white' : 'bg-[#241d33] text-zinc-400'}`}>{l}</button>
        ))}
      </div>

      {/* Calendar columns */}
      <div className="mx-5 mb-5 space-y-3">
        {CAL_DAYS.map((d, di) => {
          const dayItems = shown.filter((i) => i.dayIndex === di);
          const overloaded = items.filter((i) => i.dayIndex === di).length > 3;
          return (
            <div key={di}
              onDragOver={(e) => { e.preventDefault(); setDragOver(di); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => { if (dragId !== null) moveTo(dragId, di); setDragId(null); setDragOver(null); }}
              className={`rounded-3xl p-3 border transition ${dragOver === di ? 'border-purple-500 bg-purple-500/5' : overloaded ? 'border-amber-500/30 bg-[#14101c]' : 'border-white/5 bg-[#14101c]'}`}>
              <div className="flex items-center justify-between mb-2">
                {overloaded && <span className="text-[10px] text-amber-400">⚠️ شلوغ</span>}
                <span className="text-sm font-bold text-white">{d}</span>
              </div>
              {dayItems.length === 0 ? (
                <p className="text-[11px] text-zinc-600 text-center py-2">— خالی —</p>
              ) : (
                <div className="space-y-2">
                  {dayItems.map((it) => (
                    <div key={it.id} draggable onDragStart={() => setDragId(it.id)}
                      className="flex items-center gap-2 bg-[#0d0916] rounded-2xl p-2.5 cursor-grab active:cursor-grabbing">
                      <button onClick={() => remove(it.id)} className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0"><X className="w-3 h-3 text-rose-400" /></button>
                      <button onClick={() => cycleStatus(it)} className="text-[9px] px-2 py-0.5 rounded-full shrink-0" style={{ background: `${STATUS_COLORS[it.status || 'draft']}22`, color: STATUS_COLORS[it.status || 'draft'] }}>{STATUS_LABELS[it.status || 'draft']}</button>
                      <div className="flex-1 text-right min-w-0">
                        <p className="text-xs text-white line-clamp-1">{it.title}</p>
                        <p className="text-[10px] text-zinc-500">{it.time} • {it.kind === 'reel' ? '🎬' : it.kind === 'story' ? '📱' : '🖼️'}</p>
                      </div>
                      <GripVertical className="w-4 h-4 text-zinc-600 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================ APPROVAL WORKFLOW ============================ */
function ApprovalWorkflow({ toast }: { toast: (m: string) => void }) {
  const [items, setItems] = useState<CalItem[]>([]);
  const load = () => { fetch('/api/calendar').then((r) => r.json()).then((d) => { if (d.success) setItems(d.items); }).catch(() => {}); };
  useEffect(load, []);

  const setStatus = async (id: number, status: string) => {
    setItems((it) => it.map((i) => i.id === id ? { ...i, status } : i));
    await fetch('/api/calendar', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) }).catch(() => {});
    toast(status === 'approved' ? 'محتوا تأیید شد ✅' : status === 'rejected' ? 'محتوا رد شد ❌' : status === 'scheduled' ? 'زمان‌بندی شد 📅' : 'وضعیت به‌روز شد');
  };

  const pending = items.filter((i) => i.status === 'pending_approval' || i.status === 'draft');
  const approved = items.filter((i) => i.status === 'approved' || i.status === 'scheduled' || i.status === 'published');

  return (
    <div className="fade-up">
      {/* Flow legend */}
      <div className="mx-5 mb-4 bg-[#14101c] border border-white/5 rounded-3xl p-4 flex items-center justify-between gap-1 text-[10px]" dir="rtl">
        {['پیش‌نویس', 'تأیید', 'زمان‌بندی', 'انتشار'].map((s, i) => (
          <React.Fragment key={s}>
            <span className="text-zinc-400">{s}</span>
            {i < 3 && <ChevronLeft className="w-3 h-3 text-zinc-600" />}
          </React.Fragment>
        ))}
      </div>

      {/* Pending */}
      <div className="mx-5 mb-5">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2 justify-end">در انتظار تأیید <span className="text-xs text-amber-400">({toFa(pending.length)})</span> <Workflow className="w-4 h-4 text-amber-400" /></h3>
        {pending.length === 0 ? (
          <div className="bg-[#14101c] border border-dashed border-white/10 rounded-3xl py-8 text-center text-zinc-500 text-sm">موردی در انتظار تأیید نیست</div>
        ) : (
          <div className="space-y-3">
            {pending.map((it) => (
              <div key={it.id} className="bg-[#14101c] border border-white/5 rounded-3xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${STATUS_COLORS[it.status || 'draft']}22`, color: STATUS_COLORS[it.status || 'draft'] }}>{STATUS_LABELS[it.status || 'draft']}</span>
                  <div className="text-right"><p className="text-sm font-bold text-white">{it.title}</p><p className="text-[11px] text-zinc-500">{CAL_DAYS[it.dayIndex || 0]} • {it.time} • {it.kind === 'reel' ? '🎬 ریلز' : it.kind === 'story' ? '📱 استوری' : '🖼️ پست'}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setStatus(it.id, 'approved')} className="py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 font-bold text-white text-xs flex items-center justify-center gap-1"><Check className="w-4 h-4" /> تأیید</button>
                  <button onClick={() => setStatus(it.id, 'rejected')} className="py-2.5 rounded-2xl bg-rose-500/15 text-rose-400 font-bold text-xs flex items-center justify-center gap-1"><XCircle className="w-4 h-4" /> رد</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved */}
      {approved.length > 0 && (
        <div className="mx-5 mb-5">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2 justify-end">تأیید و منتشر شده <CheckCircle2 className="w-4 h-4 text-emerald-400" /></h3>
          <div className="space-y-2">
            {approved.map((it) => (
              <div key={it.id} className="bg-[#14101c] border border-white/5 rounded-2xl p-3 flex items-center justify-between">
                {it.status === 'approved' && <button onClick={() => setStatus(it.id, 'scheduled')} className="text-[10px] px-3 py-1 rounded-full bg-sky-500/15 text-sky-400">زمان‌بندی کن</button>}
                <div className="text-right flex-1"><p className="text-sm text-white">{it.title}</p><span className="text-[10px]" style={{ color: STATUS_COLORS[it.status || 'draft'] }}>{STATUS_LABELS[it.status || 'draft']}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================ ALERTS PANEL ============================ */
