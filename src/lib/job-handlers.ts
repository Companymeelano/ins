import { registerHandler } from '@/lib/queue';
import { buildImage } from '@/services/content-service';
import { getBrandContext } from '@/lib/brand';

let registered = false;

// ثبت handlerهای صف (یک‌بار)
export function ensureHandlers() {
  if (registered) return;
  registered = true;

  registerHandler('image', async (payload) => {
    const brand = await getBrandContext();
    const subject = String(payload.prompt || 'instagram post');
    const style = payload.style ? String(payload.style) : undefined;
    // شبیه‌سازی کار سنگین (در واقعیت: فراخوانی API تولید تصویر)
    const { imageUrl, positive, negative } = buildImage(subject, brand, style);
    return { imageUrl, promptUsed: positive, negativePrompt: negative };
  });
}
