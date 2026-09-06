import { pgTable, text, serial, timestamp, integer, jsonb, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  instagramAccessToken: text('instagram_access_token'),
  instagramUserId: text('instagram_user_id'),
  facebookPageId: text('facebook_page_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  instagramMediaId: text('instagram_media_id'),
  caption: text('caption'),
  imageUrl: text('image_url'),
  postType: text('post_type').default('feed'), // feed, story, reel
  scheduledFor: timestamp('scheduled_for'),
  status: text('status').default('draft'), // draft, published, scheduled, failed
  aiGenerated: boolean('ai_generated').default(false),
  performance: jsonb('performance').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  publishedAt: timestamp('published_at'),
});

export const analytics = pgTable('analytics', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  date: timestamp('date').defaultNow(),
  followers: integer('followers').default(0),
  newFollowers: integer('new_followers').default(0),
  totalLikes: integer('total_likes').default(0),
  totalComments: integer('total_comments').default(0),
  reach: integer('reach').default(0),
  impressions: integer('impressions').default(0),
  engagementRate: integer('engagement_rate').default(0),
  data: jsonb('data').default({}),
});

// پروژه‌های ذخیره‌شده استودیو (پست/استوری/ریلز ساخته‌شده با AI)
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().default('demo_creator'),
  kind: text('kind').notNull().default('post'), // post, story, reel
  title: text('title'),
  caption: text('caption'),
  imageUrl: text('image_url'),
  scenario: jsonb('scenario').default({}), // برای ریلز
  scheduledFor: timestamp('scheduled_for'),
  status: text('status').default('draft'), // draft, scheduled, published
  viralScore: integer('viral_score').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// قوانین پاسخ خودکار دایرکت
export const autoReplies = pgTable('auto_replies', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().default('demo_creator'),
  keyword: text('keyword').notNull(),
  reply: text('reply').notNull(),
  intent: text('intent').default('عمومی'), // قیمت، خرید، پشتیبانی، آدرس، ارسال، تخفیف
  action: text('action').default('reply'), // reply, catalog, payment_link, pdf, operator
  matchType: text('match_type').default('contains'), // contains, exact, regex
  enabled: boolean('enabled').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// گیمیفیکیشن — امتیاز، استریک و دستاوردها
export const gamification = pgTable('gamification', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique().default('demo_creator'),
  points: integer('points').default(0),
  streak: integer('streak').default(0),
  lastActive: timestamp('last_active').defaultNow(),
  badges: jsonb('badges').default([]),
});

// مدیریت چند پیج
export const pages = pgTable('pages', {
  id: serial('id').primaryKey(),
  handle: text('handle').notNull(),
  displayName: text('display_name'),
  avatarColor: text('avatar_color').default('#a855f7'),
  igUserId: text('ig_user_id'),
  accessToken: text('access_token'),
  connected: boolean('connected').default(false),
  followers: integer('followers').default(0),
  isActive: boolean('is_active').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// اعضای تیم
export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  role: text('role').default('editor'), // owner, admin, editor, viewer
  avatarColor: text('avatar_color').default('#ec4899'),
  createdAt: timestamp('created_at').defaultNow(),
});

// محصولات فروشگاه
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  price: text('price'),
  imageUrl: text('image_url'),
  link: text('link'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// آیتم‌های تقویم محتوایی
export const calendarItems = pgTable('calendar_items', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  kind: text('kind').default('post'), // post, story, reel
  status: text('status').default('draft'), // draft, pending_approval, approved, rejected, scheduled, published, failed
  dayIndex: integer('day_index').default(0), // 0=شنبه ... 6=جمعه
  time: text('time').default('۲۰:۰۰'),
  color: text('color').default('#a855f7'),
  caption: text('caption'),
  createdAt: timestamp('created_at').defaultNow(),
});

// پایگاه دانش چت‌بات (RAG سبک)
export const knowledgeBase = pgTable('knowledge_base', {
  id: serial('id').primaryKey(),
  category: text('category').default('عمومی'),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  keywords: text('keywords'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Analytics = typeof analytics.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type AutoReply = typeof autoReplies.$inferSelect;
export type Gamification = typeof gamification.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type Product = typeof products.$inferSelect;
// پروکسی‌ها
export const proxies = pgTable('proxies', {
  id: serial('id').primaryKey(),
  label: text('label'),
  type: text('type').default('http'), // http, socks5, socks4
  host: text('host').notNull(),
  port: integer('port').notNull(),
  country: text('country').default('US'),
  countryFlag: text('country_flag').default('🌐'),
  ping: integer('ping').default(0), // ms
  status: text('status').default('unknown'), // green, slow, dead, unknown
  active: boolean('active').default(false),
  provider: text('provider').default('manual'),
  lastChecked: timestamp('last_checked'),
  createdAt: timestamp('created_at').defaultNow(),
});

// سرویس‌های تونل (V2Ray / SOCKS) برای دسترسی داخل ایران
export const tunnels = pgTable('tunnels', {
  id: serial('id').primaryKey(),
  label: text('label'),
  protocol: text('protocol').default('vmess'), // vmess, vless, trojan, shadowsocks, socks5
  configUri: text('config_uri'), // ENCRYPTED at rest (AES-256-GCM)
  encrypted: boolean('encrypted').default(true),
  ping: integer('ping').default(0),
  status: text('status').default('unknown'), // connected, ready, dead, unknown
  active: boolean('active').default(false),
  autoSwitch: boolean('auto_switch').default(true),
  lastChecked: timestamp('last_checked'),
  createdAt: timestamp('created_at').defaultNow(),
});

// زمان‌بند فعالیت ایمن (برنامه‌ریزی فعالیت دستی مطابق الگوریتم)
export const activitySchedules = pgTable('activity_schedules', {
  id: serial('id').primaryKey(),
  actionType: text('action_type').notNull(), // engage_likes, follow_reminder, comment_reminder, unfollow_review
  enabled: boolean('enabled').default(false),
  dailyLimit: integer('daily_limit').default(30),
  intervalMin: integer('interval_min').default(8), // فاصله دقیقه بین اقدامات
  activeHoursStart: integer('active_hours_start').default(9),
  activeHoursEnd: integer('active_hours_end').default(23),
  doneToday: integer('done_today').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// لاگ چرخش IP / پروکسی / تونل
export const rotationLogs = pgTable('rotation_logs', {
  id: serial('id').primaryKey(),
  kind: text('kind').default('proxy'), // proxy, tunnel
  label: text('label'),
  country: text('country'),
  ping: integer('ping').default(0),
  reason: text('reason').default('manual'), // manual, auto_switch, failover, schedule
  ip: text('ip'),
  createdAt: timestamp('created_at').defaultNow(),
});

// هشدارها / اعلان‌ها
export const alerts = pgTable('alerts', {
  id: serial('id').primaryKey(),
  type: text('type').default('info'), // tunnel_down, ping_spike, shadowban, info, proxy_dead
  severity: text('severity').default('info'), // info, warning, critical
  title: text('title').notNull(),
  message: text('message'),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export type CalendarItem = typeof calendarItems.$inferSelect;
export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type Proxy = typeof proxies.$inferSelect;
export type Tunnel = typeof tunnels.$inferSelect;
export type ActivitySchedule = typeof activitySchedules.$inferSelect;
// کاربران پنل (احراز هویت با نقش)
export const panelUsers = pgTable('panel_users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').default('editor'), // admin, editor, viewer
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// نشست‌های ورود پنل
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  token: text('token').notNull().unique(),
  userId: integer('user_id').references(() => panelUsers.id),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// اکانت‌های اینستاگرام متصل‌شده (سبک instagrapi)
export const igAccounts = pgTable('ig_accounts', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  connectMethod: text('connect_method').default('private'), // private (instagrapi-like), graph
  status: text('status').default('disconnected'), // connected, challenge_required, two_factor_required, disconnected, failed
  sessionData: text('session_data'), // ENCRYPTED session settings json (session.json)
  deviceUuid: text('device_uuid'), // UUID ثابت دستگاه برای امنیت
  proxyId: integer('proxy_id'), // پروکسی متصل به این اکانت
  challengeContext: text('challenge_context'), // برای مرحله challenge/2fa
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type RotationLog = typeof rotationLogs.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
// Brand Kit — حافظه برند برای هر پروژه/پیج
export const brandKits = pgTable('brand_kits', {
  id: serial('id').primaryKey(),
  pageHandle: text('page_handle').default('default'),
  brandName: text('brand_name'),
  industry: text('industry'),
  audience: text('audience'),
  brandVoice: text('brand_voice').default('دوستانه'),
  visualStyle: text('visual_style').default('cinematic'),
  primaryColor: text('primary_color').default('#a855f7'),
  secondaryColor: text('secondary_color').default('#ec4899'),
  ctaStyle: text('cta_style'),
  forbiddenWords: text('forbidden_words'), // کلمات ممنوع (کاما جدا)
  keywords: text('keywords'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// بازخورد خروجی AI (دیتاست بهبود)
export const aiFeedback = pgTable('ai_feedback', {
  id: serial('id').primaryKey(),
  kind: text('kind').default('caption'), // caption, image, reel, story, analysis
  promptVersion: text('prompt_version'),
  rating: text('rating').default('good'), // good, bad, needs_edit
  reason: text('reason'),
  score: integer('score').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export type PanelUser = typeof panelUsers.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type IgAccount = typeof igAccounts.$inferSelect;
// Audit trail — ردیابی اقدامات کاربر و تولیدات AI
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  actor: text('actor').default('system'),
  action: text('action').notNull(),
  category: text('category').default('general'), // ai, auth, content, proxy, settings
  detail: text('detail'),
  meta: jsonb('meta').default({}),
  createdAt: timestamp('created_at').defaultNow(),
});

// A/B testing — رویدادهای نسخه‌های prompt
export const abEvents = pgTable('ab_events', {
  id: serial('id').primaryKey(),
  experiment: text('experiment').notNull(), // caption_prompt, reel_prompt
  variant: text('variant').notNull(), // v1, v2, v3
  event: text('event').default('served'), // served, accepted, edited, rejected
  createdAt: timestamp('created_at').defaultNow(),
});

// Feature flags
export const featureFlags = pgTable('feature_flags', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  enabled: boolean('enabled').default(true),
  description: text('description'),
});

export type BrandKit = typeof brandKits.$inferSelect;
export type AiFeedback = typeof aiFeedback.$inferSelect;
// صف کارها (job queue) برای کارهای سنگین async
export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(), // image, caption, reel, analysis
  status: text('status').default('queued'), // queued, processing, done, failed
  payload: jsonb('payload').default({}),
  result: jsonb('result').default({}),
  error: text('error'),
  attempts: integer('attempts').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

// پروژه‌های ریلز — موتور Orchestration (Plan → Segments → Selection → Script)
export const reelProjects = pgTable('reel_projects', {
  id: serial('id').primaryKey(),
  title: text('title'),
  mode: text('mode').default('ai'), // ai | scripted | hybrid
  status: text('status').default('draft'), // draft, awaiting_selection, approved, rendering, done, failed
  // ورودی‌ها
  topic: text('topic'),
  goal: text('goal'),
  audience: text('audience'),
  tone: text('tone'),
  durationSec: integer('duration_sec').default(20),
  aspectRatio: text('aspect_ratio').default('9:16'),
  // خروجی موتور
  plan: jsonb('plan').default({}),              // blueprint کلی (hook, style, continuity)
  segments: jsonb('segments').default([]),      // بخش‌های ۵ ثانیه‌ای
  suggestions: jsonb('suggestions').default({}),// پیشنهادهای AI (hooks, ctas, music, styles)
  selections: jsonb('selections').default({}),  // انتخاب کاربر
  finalScript: jsonb('final_script').default({}),// timeline نهایی برای render
  qa: jsonb('qa').default({}),                  // نتیجه QA
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type AbEvent = typeof abEvents.$inferSelect;
export type FeatureFlag = typeof featureFlags.$inferSelect;
// رسانه‌های آپلود/تولیدشده (media assets)
export const mediaAssets = pgTable('media_assets', {
  id: serial('id').primaryKey(),
  reelId: integer('reel_id'),
  segmentIndex: integer('segment_index'),
  kind: text('kind').default('image'), // image, video, audio, logo
  url: text('url').notNull(),
  source: text('source').default('ai'), // ai, upload
  width: integer('width').default(1080),
  height: integer('height').default(1920),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Job = typeof jobs.$inferSelect;
export type ReelProject = typeof reelProjects.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;
