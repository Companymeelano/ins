// Prompt Builder — templateهای versioned سمت سرور با متغیرهای کنترل‌شده
// promptهای حساس هرگز به client فرستاده نمی‌شوند.

export interface BrandContext {
  brandName?: string; industry?: string; audience?: string;
  brandVoice?: string; visualStyle?: string; forbiddenWords?: string; keywords?: string;
  primaryColor?: string; ctaStyle?: string;
}

export interface CaptionInput {
  topic: string; goal?: string; platform?: string; tone?: string; category?: string;
}

// نسخه فعلی templateها (برای A/B و ردیابی)
export const PROMPT_VERSION = 'v2';

function brandBlock(b?: BrandContext): string {
  if (!b) return '';
  const lines: string[] = [];
  if (b.brandName) lines.push(`نام برند: ${b.brandName}`);
  if (b.industry) lines.push(`حوزه: ${b.industry}`);
  if (b.audience) lines.push(`مخاطب هدف: ${b.audience}`);
  if (b.brandVoice) lines.push(`لحن برند: ${b.brandVoice}`);
  if (b.keywords) lines.push(`کلمات کلیدی برند: ${b.keywords}`);
  if (b.ctaStyle) lines.push(`سبک کال‌تو‌اکشن: ${b.ctaStyle}`);
  if (b.forbiddenWords) lines.push(`⛔ کلمات ممنوع (استفاده نکن): ${b.forbiddenWords}`);
  return lines.length ? `\n[هویت برند]\n${lines.join('\n')}\n` : '';
}

// ---------- CAPTION: خروجی ساختاری ----------
export function buildCaptionPrompt(input: CaptionInput, brand?: BrandContext): string {
  return `تو یک کپی‌رایتر حرفه‌ای اینستاگرام و متخصص سئو فارسی هستی.
${brandBlock(brand)}
[درخواست]
موضوع: ${input.topic}
هدف: ${input.goal || 'افزایش تعامل'}
پلتفرم: ${input.platform || 'اینستاگرام'}
دسته: ${input.category || 'عمومی'}
لحن: ${input.tone || brand?.brandVoice || 'دوستانه'}

یک کپشن بهینه بساز و خروجی را دقیقاً در قالب JSON معتبر برگردان (بدون متن اضافه):
{
  "hook": "قلاب اول جذاب و توقف‌کننده (یک جمله)",
  "body": "متن اصلی ۲ تا ۴ خط ارزشمند",
  "cta": "کال تو اکشن قوی",
  "hashtags": ["۱۵ هشتگ فارسی مرتبط"],
  "tone": "لحن نهایی",
  "risk_flags": ["هر ادعای اغراق‌آمیز یا ریسک policy، اگر نبود آرایه خالی"]
}`;
}

// ---------- REEL: pipeline اختصاصی ----------
export function buildReelPrompt(topic: string, duration: string, brand?: BrandContext): string {
  return `تو کارگردان ریلز اینستاگرام هستی.
${brandBlock(brand)}
برای موضوع «${topic}» و مدت «${duration}» خروجی JSON بده:
{
  "hook": "قلاب ۳ ثانیه اول",
  "shot_list": ["نمای ۱ با زمان", "نمای ۲", "..."],
  "voiceover": "متن صداگذاری روان",
  "on_screen_text": ["متن روی صحنه ۱", "..."],
  "caption": "کپشن کوتاه ریلز",
  "hashtags": ["هشتگ‌ها"],
  "risk_flags": []
}`;
}

// ---------- STORY: sequence cards ----------
export function buildStoryPrompt(topic: string, brand?: BrandContext): string {
  return `تو طراح استوری تعاملی اینستاگرام هستی.
${brandBlock(brand)}
برای موضوع «${topic}» یک توالی استوری بساز. خروجی JSON:
{
  "cards": [{"text": "متن کارت", "sticker": "poll|question|quiz|none", "sticker_text": "متن استیکر"}],
  "cta": "دعوت پایانی",
  "risk_flags": []
}`;
}

// ---------- IMAGE: reference + negative prompt ----------
export function buildImagePrompt(subject: string, brand?: BrandContext): { positive: string; negative: string } {
  const style = brand?.visualStyle || 'cinematic';
  const styleMap: Record<string, string> = {
    realistic: 'photorealistic, natural lighting, sharp focus',
    cinematic: 'cinematic lighting, teal and orange grade, shallow depth of field',
    minimal: 'minimalist, clean background, negative space, studio lighting',
    vibrant: 'vibrant saturated colors, dynamic',
    luxury: 'luxury premium aesthetic, elegant, gold accents',
    vintage: 'vintage film look, retro palette',
  };
  const colorHint = brand?.primaryColor ? `, brand color accent ${brand.primaryColor}` : '';
  const positive = `${subject}, ${styleMap[style] || styleMap.cinematic}${colorHint}, ultra detailed, 8K, professional instagram photography, clean composition, leave empty space for text overlay`;
  // negative prompt / guardrail بصری
  const negative = 'deformed faces, distorted hands, extra fingers, extra limbs, broken logo, gibberish text, unreadable text, cluttered composition, low quality, blurry, watermark, meaningless letters';
  return { positive, negative };
}

// ---------- QA / Scorer ----------
export interface CaptionOutput {
  hook: string; body: string; cta: string; hashtags: string[]; tone: string; risk_flags: string[];
}

// امتیازدهی کیفیت کپشن (self-consistency scorer + QA)
export function scoreCaption(raw: string): number {
  const hashtags = (raw.match(/#/g) || []).length;
  const hasHook = raw.length > 20;
  const hasCTA = /(کامنت|ذخیره|فالو|لینک|بایو|دایرکت)/.test(raw);
  const emojis = (raw.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || []).length;
  let s = 0;
  if (hashtags >= 8) s += 30; else s += hashtags * 3;
  if (hasHook) s += 20;
  if (hasCTA) s += 25;
  if (emojis >= 2) s += 15;
  if (raw.length > 80 && raw.length < 2200) s += 10;
  return s;
}

// AI QA Layer — بررسی خروجی قبل از نمایش
export function qaCaption(out: CaptionOutput, brand?: BrandContext): { ok: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const full = `${out.hook} ${out.body} ${out.cta}`;
  // کلمات ممنوع برند
  if (brand?.forbiddenWords) {
    for (const w of brand.forbiddenWords.split(/[,،]/).map((x) => x.trim()).filter(Boolean)) {
      if (full.includes(w)) warnings.push(`کلمه ممنوع برند استفاده شده: «${w}»`);
    }
  }
  // ادعاهای اغراق‌آمیز
  if (/(بهترین در جهان|تضمین ۱۰۰|معجزه|هیچ‌کس نمی‌تواند|قطعی و بدون ریسک)/.test(full)) warnings.push('ادعای اغراق‌آمیز شناسایی شد');
  // CTA ضعیف
  if (!out.cta || out.cta.length < 5) warnings.push('کال‌تو‌اکشن ضعیف یا خالی است');
  // هشتگ کم
  if (!out.hashtags || out.hashtags.length < 5) warnings.push('تعداد هشتگ کمتر از حد توصیه‌شده');
  // ریسک policy از خود مدل
  if (out.risk_flags?.length) warnings.push(...out.risk_flags);
  return { ok: warnings.length === 0, warnings };
}
