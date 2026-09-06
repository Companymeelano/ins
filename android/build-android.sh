#!/usr/bin/env bash
# ساخت نسخه اندروید (APK / AAB) از وب‌اپ میلانو با استفاده از Bubblewrap (Trusted Web Activity)
# پیش‌نیازها:
#   - Node.js 18+
#   - JDK 17 (نصب‌شده و JAVA_HOME تنظیم‌شده)
#   - Android SDK (متغیرهای ANDROID_HOME / ANDROID_SDK_ROOT)
#   - build-tools و platform  (bubblewrap فایل‌های لازم را راهنمایی می‌کند)
#   - اجرای `keytool` برای ساخت keystore امضا
set -e

# ۱) دامنه را در android/twa-manifest.json تنظیم کنید (فیلد host و آدرس‌های icon/webManifest)
#    سپس این اسکریپت را اجرا کنید.

echo "📦 نصب @bubblewrap/cli ..."
npm install -g @bubblewrap/cli

echo "🔧 آماده‌سازی پروژه اندروید از منیفست TWA ..."
# نخستین بار از شما کلید امضا (keystore) را می‌پرسد؛ برای تست می‌توانید یکی بسازید:
# keytool -genkeypair -v -keystore android-release.keystore -alias milano \
#   -keyalg RSA -keysize 2048 -validity 10000
bubblewrap init --manifest android/twa-manifest.json

echo "🛠  ساخت بسته اندروید (APK / AAB) ..."
bubblewrap build

echo "✅ تمام شد. خروجی در پوشه‌ی جاری (app-release-bundle.aab / app-release.apk) آماده است."
