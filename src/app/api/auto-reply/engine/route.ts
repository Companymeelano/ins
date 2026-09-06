import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { autoReplies } from '@/db/schema';
import { callGemini } from '@/lib/ai';

// موتور پاسخ سه‌مرحله‌ای: keyword → intent → action
const INTENTS: Record<string, { words: string[]; action: string; label: string }> = {
  'قیمت': { words: ['قیمت', 'چند', 'هزینه', 'تومان', 'price'], action: 'catalog', label: 'ارسال کاتالوگ و لیست قیمت' },
  'خرید': { words: ['خرید', 'سفارش', 'بخرم', 'میخوام', 'buy'], action: 'payment_link', label: 'ارسال لینک پرداخت' },
  'پشتیبانی': { words: ['کمک', 'مشکل', 'پشتیبان', 'خراب', 'support'], action: 'operator', label: 'ارجاع به اپراتور' },
  'آدرس': { words: ['آدرس', 'کجا', 'شعبه', 'location'], action: 'reply', label: 'ارسال آدرس' },
  'ارسال': { words: ['ارسال', 'پست', 'تحویل', 'کی میرسه'], action: 'pdf', label: 'ارسال شرایط ارسال (PDF)' },
  'تخفیف': { words: ['تخفیف', 'کد', 'آف', 'discount'], action: 'reply', label: 'ارسال کد تخفیف' },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = typeof body.message === 'string' ? body.message.trim() : '';
    if (!text) return NextResponse.json({ error: 'پیام لازم است' }, { status: 400 });

    const steps: { step: string; result: string }[] = [];

    // مرحله ۱: keyword / regex match از قوانین کاربر
    const rules = await db.select().from(autoReplies);
    let matchedRule = null;
    for (const r of rules) {
      if (!r.enabled) continue;
      const mt = r.matchType || 'contains';
      let hit = false;
      if (mt === 'exact') hit = text === r.keyword;
      else if (mt === 'regex') { try { hit = new RegExp(r.keyword, 'i').test(text); } catch { hit = false; } }
      else hit = text.includes(r.keyword);
      if (hit) { matchedRule = r; break; }
    }
    steps.push({ step: 'مرحله ۱: تطبیق کلمه‌کلیدی', result: matchedRule ? `قانون «${matchedRule.keyword}» یافت شد` : 'قانونی مطابقت نکرد' });

    if (matchedRule) {
      return NextResponse.json({ success: true, reply: matchedRule.reply, intent: matchedRule.intent, action: matchedRule.action, steps, source: 'rule' });
    }

    // مرحله ۲: تشخیص نیت (intent classification)
    let detectedIntent = '';
    let action = 'reply';
    for (const [intent, cfg] of Object.entries(INTENTS)) {
      if (cfg.words.some((w) => text.includes(w))) { detectedIntent = intent; action = cfg.action; break; }
    }
    steps.push({ step: 'مرحله ۲: تشخیص نیت', result: detectedIntent ? `نیت: ${detectedIntent}` : 'نیت مشخصی یافت نشد' });

    // مرحله ۳: موتور اقدام (action engine)
    const actionMap: Record<string, string> = {
      catalog: '🗂️ کاتالوگ محصولات برای شما ارسال شد. برای سفارش کلمه «خرید» را بفرستید.',
      payment_link: '💳 لینک پرداخت امن: pay.milano.ir/checkout — پس از پرداخت، سفارش پردازش می‌شود.',
      operator: '👨‍💼 در حال اتصال به اپراتور... لطفاً چند لحظه صبر کنید.',
      pdf: '📄 فایل شرایط ارسال برای شما پیوست شد. ارسال ۲ تا ۴ روز کاری.',
      reply: '',
    };

    let reply = actionMap[action];
    if (!reply) {
      const ai = await callGemini(`به این پیام دایرکت اینستاگرام یک پاسخ کوتاه، دوستانه و فارسی با ایموجی بده: "${text}"`);
      reply = ai?.text || 'ممنون از پیامت 🙏 به‌زودی پاسخ کامل می‌دیم 💜';
    }
    steps.push({ step: 'مرحله ۳: موتور اقدام', result: detectedIntent ? INTENTS[detectedIntent].label : 'پاسخ هوشمند AI' });

    return NextResponse.json({ success: true, reply, intent: detectedIntent || 'عمومی', action, steps, source: detectedIntent ? 'intent' : 'ai' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در موتور پاسخ' }, { status: 500 });
  }
}
