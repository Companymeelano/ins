import { z } from 'zod';
import { NextResponse } from 'next/server';

// اسکیمای اعتبارسنجی مرکزی با zod
export const captionSchema = z.object({
  topic: z.string().min(1, 'موضوع الزامی است').max(2000),
  goal: z.string().max(200).optional(),
  platform: z.string().max(50).optional(),
  tone: z.string().max(50).optional(),
  category: z.string().max(100).optional(),
});

export const imageSchema = z.object({
  prompt: z.string().min(1, 'پرامپت الزامی است').max(2000),
  style: z.string().max(50).optional(),
  keywords: z.string().max(500).optional(),
});

export const loginSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});

export const reelSchema = z.object({
  topic: z.string().min(1).max(2000),
  templateType: z.string().max(100).optional(),
  duration: z.string().max(50).optional(),
});

// کمک‌کننده: اعتبارسنجی بدنه و بازگشت خطای استاندارد
export async function parseBody<T extends z.ZodTypeAny>(request: Request, schema: T): Promise<{ ok: true; data: z.infer<T> } | { ok: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      const msg = result.error.issues[0]?.message || 'ورودی نامعتبر';
      return { ok: false, response: NextResponse.json({ error: msg }, { status: 400 }) };
    }
    return { ok: true, data: result.data };
  } catch {
    return { ok: false, response: NextResponse.json({ error: 'بدنه درخواست نامعتبر است' }, { status: 400 }) };
  }
}
