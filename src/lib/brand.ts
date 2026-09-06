import { db } from '@/db';
import { brandKits } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { BrandContext } from '@/lib/prompt-builder';

// خواندن حافظه برند برای تزریق به promptها
export async function getBrandContext(handle = 'default'): Promise<BrandContext | undefined> {
  try {
    const [kit] = await db.select().from(brandKits).where(eq(brandKits.pageHandle, handle));
    if (!kit) return undefined;
    return {
      brandName: kit.brandName || undefined,
      industry: kit.industry || undefined,
      audience: kit.audience || undefined,
      brandVoice: kit.brandVoice || undefined,
      visualStyle: kit.visualStyle || undefined,
      forbiddenWords: kit.forbiddenWords || undefined,
      keywords: kit.keywords || undefined,
      primaryColor: kit.primaryColor || undefined,
      ctaStyle: kit.ctaStyle || undefined,
    };
  } catch {
    return undefined;
  }
}
