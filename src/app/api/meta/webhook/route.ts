import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { autoReplies } from '@/db/schema';
import { callGemini } from '@/lib/ai';

// تایید webhook توسط Meta
export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('hub.mode');
  const token = request.nextUrl.searchParams.get('hub.verify_token');
  const challenge = request.nextUrl.searchParams.get('hub.challenge');
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'milano_verify_token';

  if (mode === 'subscribe' && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Verification failed', { status: 403 });
}

// دریافت رویدادها (کامنت جدید / دایرکت جدید) و پاسخ خودکار
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.object !== 'instagram') return NextResponse.json({ ok: true });

    for (const entry of body.entry || []) {
      // کامنت‌ها
      for (const change of entry.changes || []) {
        if (change.field === 'comments') {
          await handleAutoReply(change.value?.text || '', 'comment', change.value?.id);
        }
      }
      // پیام‌های دایرکت
      for (const msg of entry.messaging || []) {
        const text = msg.message?.text;
        if (text) await handleAutoReply(text, 'dm', msg.sender?.id);
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('webhook error', e);
    return NextResponse.json({ ok: true }); // همیشه 200 تا Meta retry نکند
  }
}

async function handleAutoReply(text: string, type: 'comment' | 'dm', targetId?: string) {
  if (!text) return;

  // ۱) بررسی قوانین کلمه‌کلیدی
  const rules = await db.select().from(autoReplies);
  const matched = rules.find((r) => r.enabled && text.includes(r.keyword));
  let reply = matched?.reply;

  // ۲) اگر قانونی نبود، با AI پاسخ بساز
  if (!reply) {
    const ai = await callGemini(
      `تو مدیر پیج اینستاگرام هستی. برای این ${type === 'dm' ? 'پیام دایرکت' : 'کامنت'} یک پاسخ کوتاه، دوستانه و حرفه‌ای فارسی با ایموجی بنویس. فقط پاسخ: "${text}"`
    );
    reply = ai?.text || 'ممنون از پیامت 🙏 به‌زودی پاسخ می‌دیم 💜';
  }

  // در محیط واقعی اینجا با Graph API پاسخ ارسال می‌شود:
  // POST /{comment-id}/replies یا /{ig-id}/messages
  console.log(`[auto-reply][${type}] -> ${targetId}: ${reply}`);
  return reply;
}
