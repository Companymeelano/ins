# میلانو — نسخه اندروید (PWA + APK)

این پروژه نسخه‌ی **اندروید** از «میلانو | استودیو هوشمند اینستاگرام» است.
رابط کاربری کاملاً موبایل‌محور، با منوی کشویی سازمان‌یافته، دکمه‌های اختصاصی
متحرک، صفحه افتتاحیه با نماد سه‌بعدی و آیکون اندرویدی Adaptive/سه‌بعدی بازطراحی شده است.

## دو روش نصب روی اندروید

### ۱) نصب مستقیم (PWA) — بدون نیاز به فروشگاه
روی گوشی اندروید، سایت را در کروم باز کنید و از منوی بالا
**«افزودن به صفحه اصلی» (Add to Home screen)** را بزنید.
اپ مثل یک برنامه‌ی واقعی (تمام‌صفحه، بدون نوار مرورگر، با آیکون و اسپلش) باز می‌شود
و آفلاین هم کار می‌کند.

### ۲) بسته‌ی فروشگاهی (APK / AAB) با TWA
برای انتشار در Google Play یا نصب فایل APK:

1. پروژه‌ی Next را بسازید و روی یک دامنه‌ی **HTTPS** مستقر کنید:
   ```bash
   npm install
   npm run build
   npm run start
   ```
2. در فایل `android/twa-manifest.json` مقدار `host` و آدرس‌های `iconUrl` /
   `webManifestUrl` را به دامنه‌ی خود تغییر دهید.
3. ابزار Bubblewrap را اجرا کنید (نیازمند JDK 17 و Android SDK):
   ```bash
   bash android/build-android.sh
   ```
   خروجی `app-release-bundle.aab` / `app-release.apk` ساخته می‌شود.

## آیکون‌های اندرویدی (۳بعدی)
تمامی اندازه‌های لازم در `public/icons/` آماده است:
- `icon-{48,72,96,144,192}.png` — چگالی‌های استاندارد (mipmap)
- `icon-192.png`, `icon-512.png` — آیکون‌های PWA
- `maskable-512.png` — نسخه‌ی maskable (محتوا در منطقه‌ی امن)
- `adaptive/ic_launcher_foreground.png` + `ic_launcher_background.png` — آیکون تطبیقی (Adaptive)
- `play/feature-graphic.png` — تصویر ویژه‌ی فروشگاه (۱۰۲۴×۵۰۰)
- `icon.svg` — نماد برداری برند

منبع آیکون تصویر سه‌بعدی در `public/milano-3d-icon.png` است.

## ساختار جدید رابط کاربری
- `src/app/components/SideMenu.tsx` — منوی کشویی گروه‌بندی‌شده (اصلی / هوش مصنوعی / مدیریت)
- `src/app/components/BottomBar.tsx` — نوار پایین با دکمه شناور ساخت (FAB) سه‌بعدی
- `src/app/components/ToolSheet.tsx` — ورقه ابزار برای هر قابلیت هوشمند
- `src/app/components/Splash.tsx` — صفحه افتتاحیه با نماد سه‌بعدی
- `src/app/components/ui.tsx` — سیستم دکمه/کارت اختصاصی (گرادیانی، شیشه‌ای، نئون، ...)
- `src/app/components/ui-context.tsx` — مدیریت منو/اعلان‌ها
- `public/manifest.json` + `public/sw.js` — منیفست و Service Worker نصب‌پذیر

## نکته‌ی اجرا بدون دیتابیس
اگر `DATABASE_URL` تنظیم نشده باشد، برنامه به‌صورت خودکار در
**حالت دمو** اجرا می‌شود و با نام کاربری `admin` / رمز `admin` وارد می‌شود
(احراز هویت درون‌حافظه‌ای) تا کل رابط بدون نیاز به پایگاه‌داده قابل مشاهده باشد.
