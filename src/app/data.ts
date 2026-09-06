export const weekDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];

export const engagementData = [
  { day: 'جمعه', likes: 1450 },
  { day: 'پنج‌شنبه', likes: 1180 },
  { day: 'چهارشنبه', likes: 1320 },
  { day: 'سه‌شنبه', likes: 1600 },
  { day: 'دوشنبه', likes: 1240 },
  { day: 'یکشنبه', likes: 1780 },
  { day: 'شنبه', likes: 2030 },
];

export const followerTrend = [
  { day: 'شنبه', v: 47100 },
  { day: 'یکشنبه', v: 47450 },
  { day: 'دوشنبه', v: 46980 },
  { day: 'سه‌شنبه', v: 47800 },
  { day: 'چهارشنبه', v: 47650 },
  { day: 'پنج‌شنبه', v: 47990 },
  { day: 'جمعه', v: 48210 },
];

export const bestTimes = [
  { day: 'شنبه', time: '۱۳:۰۰ - ۱۴:۳۰', score: 82 },
  { day: 'دوشنبه', time: '۲۰:۰۰ - ۲۲:۰۰', score: 95 },
  { day: 'چهارشنبه', time: '۱۲:۰۰ - ۱۳:۰۰', score: 78 },
  { day: 'جمعه', time: '۱۹:۰۰ - ۲۱:۳۰', score: 90 },
];

export const compareData = [
  { day: 'شنبه', likes: 3810, comment: 176, save: 240 },
  { day: 'یکشنبه', likes: 2990, comment: 132, save: 180 },
  { day: 'دوشنبه', likes: 3450, comment: 154, save: 210 },
  { day: 'سه‌شنبه', likes: 2760, comment: 121, save: 160 },
  { day: 'چهارشنبه', likes: 4100, comment: 198, save: 290 },
  { day: 'پنج‌شنبه', likes: 4320, comment: 210, save: 310 },
  { day: 'جمعه', likes: 4500, comment: 224, save: 330 },
];

export const ageData = [
  { name: '۱۸-۲۴', value: 34, color: '#ec4899' },
  { name: '۲۵-۳۴', value: 41, color: '#a78bfa' },
  { name: '۳۵-۴۴', value: 16, color: '#38bdf8' },
  { name: '۴۵+', value: 9, color: '#fbbf24' },
];

export const genderData = [
  { name: 'زنان', value: 58, color: '#ec4899' },
  { name: 'مردان', value: 39, color: '#a78bfa' },
  { name: 'سایر', value: 3, color: '#38bdf8' },
];

export const topPosts = [
  {
    id: 1,
    rank: 1,
    score: 96,
    caption: 'پشت صحنه‌ی برند شما در یک قاب حرفه‌ای ✨',
    likes: '۴,۳۲۰',
    comments: '۲۱۰',
    reach: '۸۸ک',
    img: 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 2,
    rank: 2,
    score: 91,
    caption: 'معرفی محصول جدید با یک استوری تعاملی 🔥',
    likes: '۳,۸۱۰',
    comments: '۱۷۶',
    reach: '۶۴ک',
    img: 'https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 3,
    rank: 3,
    score: 84,
    caption: 'نکات کاربردی برای مخاطبان همیشگی شما ...',
    likes: '۲,۹۹۰',
    comments: '۱۳۲',
    reach: '۴۱ک',
    img: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

export const storyBackgrounds = [
  'linear-gradient(160deg,#7c3aed,#4c1d95)',
  'linear-gradient(160deg,#06b6d4,#0e7490)',
  'linear-gradient(160deg,#f97316,#dc2626)',
  'linear-gradient(160deg,#a855f7,#ec4899)',
];

export const stickers = ['🔥', '✨', '💗', '🎉', '📌', '😍', '👏', '💯', '🚀', '⭐'];

export const textColors = ['#111', '#22c55e', '#8b5cf6', '#ec4899', '#fbbf24', '#fff'];

// تحلیل رقبا (نمونه)
export const competitors = [
  { name: 'رقیب برتر حوزه', handle: '@top_rival', followers: '۶۲.۴ک', growth: '+۳.۱٪', engagement: '۵.۲٪', postsWeek: 7, up: true },
  { name: 'برند مشابه', handle: '@similar_brand', followers: '۴۱.۸ک', growth: '+۱.۹٪', engagement: '۴.۱٪', postsWeek: 4, up: true },
  { name: 'پیج نوظهور', handle: '@rising_page', followers: '۲۸.۳ک', growth: '+۸.۷٪', engagement: '۷.۸٪', postsWeek: 12, up: true },
  { name: 'پیج شما', handle: '@your_page', followers: '۴۸.۲ک', growth: '+۳.۸٪', engagement: '۶.۷٪', postsWeek: 5, up: true, isYou: true },
];

// برنامه پیشنهادی تقویم محتوایی هفتگی
export const calendarPlan = [
  { day: 'شنبه', type: 'پست', emoji: '🖼️', idea: 'معرفی محصول/خدمت جدید', time: '۱۳:۳۰', color: '#a855f7' },
  { day: 'یکشنبه', type: 'استوری', emoji: '📱', idea: 'نظرسنجی تعاملی از مخاطبان', time: '۱۹:۰۰', color: '#ec4899' },
  { day: 'دوشنبه', type: 'ریلز', emoji: '🎬', idea: 'ریلز آموزشی یا قبل/بعد', time: '۲۱:۰۰', color: '#f59e0b' },
  { day: 'سه‌شنبه', type: 'پست', emoji: '🖼️', idea: 'کارت نقل‌قول یا نکته کاربردی', time: '۱۴:۰۰', color: '#a855f7' },
  { day: 'چهارشنبه', type: 'استوری', emoji: '📱', idea: 'پشت‌صحنه و روتین روزانه', time: '۱۲:۳۰', color: '#ec4899' },
  { day: 'پنج‌شنبه', type: 'ریلز', emoji: '🎬', idea: 'ریلز سرگرم‌کننده/ترند', time: '۲۰:۰۰', color: '#f59e0b' },
  { day: 'جمعه', type: 'پست', emoji: '🖼️', idea: 'جمع‌بندی هفته + آفر ویژه', time: '۱۹:۳۰', color: '#a855f7' },
];
