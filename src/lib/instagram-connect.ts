import crypto from 'crypto';

// سرویس اتصال اکانت اینستاگرام — الگوبرداری از جریان instagrapi (Private API)
// جریان: login → (احتمالاً) challenge_required / two_factor_required → session
// نکته: اتصال واقعی به Private API از سمت سرور Node نیازمند پیاده‌سازی امضای دستگاه است.
// اینجا جریان کامل state machine + session persistence پیاده شده و در صورت وجود
// سرویس پل (INSTAGRAM_BRIDGE_URL که یک سرویس instagrapi پایتون است) به آن متصل می‌شود.

export interface LoginResult {
  status: 'connected' | 'challenge_required' | 'two_factor_required' | 'failed';
  message: string;
  sessionData?: string;
  deviceUuid?: string;
  challengeContext?: string;
}

// تولید UUID ثابت دستگاه (مثل set_uuids در instagrapi)
export function generateDeviceUuid(): string {
  return crypto.randomUUID();
}

// ساخت session settings مشابه dump_settings instagrapi
function buildSessionSettings(username: string, deviceUuid: string) {
  return JSON.stringify({
    uuids: {
      phone_id: crypto.randomUUID(),
      uuid: deviceUuid,
      client_session_id: crypto.randomUUID(),
      advertising_id: crypto.randomUUID(),
      device_id: `android-${crypto.randomBytes(8).toString('hex')}`,
    },
    device_settings: {
      app_version: '269.0.0.18.75',
      android_version: 26,
      android_release: '8.0.0',
      manufacturer: 'Samsung',
      model: 'SM-G973F',
    },
    user_agent: 'Instagram 269.0.0.18.75 Android',
    authorization_data: { ds_user: username },
    last_login: Date.now(),
  });
}

export async function attemptLogin(params: {
  username: string; password: string; deviceUuid: string; proxy?: string;
}): Promise<LoginResult> {
  const bridge = process.env.INSTAGRAM_BRIDGE_URL;

  // اگر سرویس پل instagrapi (پایتون) تنظیم شده باشد، از آن استفاده می‌کنیم
  if (bridge) {
    try {
      const res = await fetch(`${bridge}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(process.env.INSTAGRAM_BRIDGE_KEY ? { Authorization: `Bearer ${process.env.INSTAGRAM_BRIDGE_KEY}` } : {}) },
        body: JSON.stringify({ username: params.username, password: params.password, proxy: params.proxy, device_uuid: params.deviceUuid }),
      });
      const data = await res.json();
      if (data.status === 'connected') {
        return { status: 'connected', message: 'ورود موفق', sessionData: JSON.stringify(data.session), deviceUuid: params.deviceUuid };
      }
      if (data.status === 'challenge_required') {
        return { status: 'challenge_required', message: 'کد تایید به ایمیل/شماره شما ارسال شد', challengeContext: JSON.stringify(data.challenge) };
      }
      if (data.status === 'two_factor_required') {
        return { status: 'two_factor_required', message: 'کد تایید دو مرحله‌ای را وارد کنید', challengeContext: JSON.stringify(data.two_factor) };
      }
      return { status: 'failed', message: data.message || 'ورود ناموفق' };
    } catch (e) {
      console.error('bridge login failed', e);
      return { status: 'failed', message: 'خطا در ارتباط با سرویس اتصال' };
    }
  }

  // حالت دمو (بدون سرویس پل) — شبیه‌سازی جریان واقعی instagrapi
  if (!params.username || !params.password) {
    return { status: 'failed', message: 'نام کاربری و رمز عبور لازم است' };
  }
  // شبیه‌سازی: اگر رمز کوتاه باشد، شکست؛ اگر شامل «2fa» باشد، درخواست 2FA؛ اگر «challenge»، چالش
  if (params.password.length < 4) return { status: 'failed', message: 'رمز عبور نامعتبر است' };
  if (params.username.includes('2fa')) return { status: 'two_factor_required', message: 'کد تایید دو مرحله‌ای برای شما ارسال شد (دمو)', challengeContext: JSON.stringify({ method: 'sms' }) };
  if (params.username.includes('challenge')) return { status: 'challenge_required', message: 'کد تایید به ایمیل شما ارسال شد (دمو)', challengeContext: JSON.stringify({ method: 'email' }) };

  return {
    status: 'connected',
    message: 'ورود موفق (حالت دمو — برای اتصال واقعی INSTAGRAM_BRIDGE_URL را تنظیم کنید)',
    sessionData: buildSessionSettings(params.username, params.deviceUuid),
    deviceUuid: params.deviceUuid,
  };
}

// تایید کد challenge یا 2FA
export async function resolveChallenge(params: {
  username: string; code: string; deviceUuid: string; challengeContext: string; type: 'challenge' | 'two_factor';
}): Promise<LoginResult> {
  const bridge = process.env.INSTAGRAM_BRIDGE_URL;
  if (bridge) {
    try {
      const res = await fetch(`${bridge}/resolve-challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(process.env.INSTAGRAM_BRIDGE_KEY ? { Authorization: `Bearer ${process.env.INSTAGRAM_BRIDGE_KEY}` } : {}) },
        body: JSON.stringify({ username: params.username, code: params.code, type: params.type, challenge: params.challengeContext }),
      });
      const data = await res.json();
      if (data.status === 'connected') return { status: 'connected', message: 'تایید موفق', sessionData: JSON.stringify(data.session), deviceUuid: params.deviceUuid };
      return { status: 'failed', message: data.message || 'کد نامعتبر است' };
    } catch {
      return { status: 'failed', message: 'خطا در تایید کد' };
    }
  }

  // دمو
  if (!/^\d{6}$/.test(params.code)) return { status: 'failed', message: 'کد باید ۶ رقمی باشد' };
  return { status: 'connected', message: 'تایید موفق (دمو)', sessionData: buildSessionSettings(params.username, params.deviceUuid), deviceUuid: params.deviceUuid };
}

// بررسی اعتبار session (مثل get_timeline_feed)
export async function validateSession(sessionData: string): Promise<boolean> {
  const bridge = process.env.INSTAGRAM_BRIDGE_URL;
  if (bridge) {
    try {
      const res = await fetch(`${bridge}/validate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: sessionData }),
      });
      const data = await res.json();
      return !!data.valid;
    } catch { return false; }
  }
  return !!sessionData; // دمو
}
