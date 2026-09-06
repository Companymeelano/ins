import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { knowledgeBase } from '@/db/schema';
import { callGemini, validateInput } from '@/lib/ai';

// چت‌بات RAG سبک — بازیابی از knowledge base + پاسخ AI با context
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const v = validateInput(body.message, 'پیام');
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
    const message = v.value;

    // ۱) بازیابی (Retrieval) — امتیازدهی به آیتم‌های KB بر اساس هم‌پوشانی کلمات
    const kb = await db.select().from(knowledgeBase);
    const scored = kb.map((item) => {
      const hay = `${item.question} ${item.keywords || ''} ${item.category}`.toLowerCase();
      const words = message.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
      let score = 0;
      for (const w of words) if (hay.includes(w)) score += 1;
      // تطابق کلمات کلیدی وزن بیشتر
      (item.keywords || '').split(',').forEach((k) => { if (k.trim() && message.includes(k.trim())) score += 2; });
      return { item, score };
    }).sort((a, b) => b.score - a.score);

    const top = scored.filter((s) => s.score > 0).slice(0, 3);
    const foundInKb = top.length > 0;

    // ۲) ساخت context
    const context = top.map((s) => `پرسش: ${s.item.question}\nپاسخ: ${s.item.answer}`).join('\n\n');

    // ۳) پاسخ با AI (grounded در KB)
    const prompt = foundInKb
      ? `تو دستیار پشتیبانی یک برند در اینستاگرام هستی. فقط بر اساس اطلاعات زیر پاسخ بده. اگر پاسخ کامل در اطلاعات نبود، بگو «برای بررسی دقیق‌تر شما را به اپراتور وصل می‌کنم 🙏».
اطلاعات پایگاه دانش:
${context}

سوال کاربر: ${message}
پاسخ کوتاه، دوستانه و فارسی:`
      : `کاربر این پیام را فرستاده: "${message}". چون اطلاعات مرتبطی نداریم، یک پاسخ کوتاه و مودبانه فارسی بده و بگو برای بررسی دقیق‌تر او را به اپراتور وصل می‌کنی.`;

    const ai = await callGemini(prompt);
    let reply: string;
    if (ai) {
      reply = ai.text;
    } else if (foundInKb) {
      reply = top[0].item.answer;
    } else {
      reply = 'ممنون از پیامت 🙏 برای بررسی دقیق‌تر این مورد، شما را به اپراتور انسانی وصل می‌کنم. لطفاً کمی صبر کنید 💜';
    }

    return NextResponse.json({
      success: true,
      reply,
      grounded: foundInKb,
      sources: top.map((s) => ({ category: s.item.category, question: s.item.question })),
      escalate: !foundInKb,
      model: ai?.model || 'RAG Engine',
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در چت‌بات' }, { status: 500 });
  }
}
