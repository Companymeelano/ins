import crypto from 'crypto';

// رمزنگاری AES-256-GCM برای کانفیگ‌های حساس تونل
// کلید از ENCRYPTION_KEY خوانده می‌شود؛ اگر نبود یک کلید ثابت مشتق‌شده استفاده می‌شود (فقط برای دمو).
function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || 'milano-default-dev-key-change-in-production-2026';
  return crypto.createHash('sha256').update(secret).digest();
}

export function encrypt(plain: string): string {
  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
    const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    // فرمت: iv:tag:cipher (base64)
    return `${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
  } catch {
    return plain; // fallback
  }
}

export function decrypt(payload: string): string {
  try {
    const [ivB64, tagB64, dataB64] = payload.split(':');
    if (!ivB64 || !tagB64 || !dataB64) return payload; // متن رمز نشده
    const iv = Buffer.from(ivB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const data = Buffer.from(dataB64, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(data), decipher.final()]);
    return dec.toString('utf8');
  } catch {
    return payload;
  }
}

// نمایش امن (ماسک‌شده) از کانفیگ برای UI
export function maskConfig(uri: string): string {
  if (!uri) return '';
  const scheme = uri.split('://')[0];
  return `${scheme}://••••••••••••••••••••`;
}
