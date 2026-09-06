import { NextResponse } from 'next/server';

// تولید داده گزارش تحلیلی ماهانه (کلاینت آن را چاپ/PDF می‌کند)
export async function GET() {
  const report = {
    generatedAt: new Date().toISOString(),
    period: 'گزارش ۳۰ روز اخیر',
    summary: {
      followers: 48210,
      followerGrowth: '+۳.۸٪',
      newFollowers: 1842,
      totalLikes: 87400,
      totalComments: 12400,
      totalSaves: 9800,
      reach: 456700,
      engagementRate: '۶.۷٪',
      healthScore: 87,
    },
    highlights: [
      'بیشترین رشد در روز جمعه ثبت شد',
      'ریلزها ۳ برابر پست‌های عادی ریچ گرفتند',
      'بهترین ساعت انتشار: دوشنبه ۲۰:۰۰ تا ۲۲:۰۰',
      'نرخ ذخیره‌سازی نسبت به ماه قبل ۲۲٪ افزایش یافت',
    ],
    recommendations: [
      'تعداد ریلزهای هفتگی را از ۲ به ۴ افزایش دهید',
      'روی محتوای آموزشی و کاروسل تمرکز کنید (نرخ ذخیره بالا)',
      'در ساعات اوج فعالیت مخاطبان پست بگذارید',
      'با نظرسنجی و باکس سوال تعامل استوری را بالا ببرید',
    ],
  };
  return NextResponse.json({ success: true, report });
}
