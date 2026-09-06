import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { PwaRegister } from "./components/PwaRegister";

export const metadata: Metadata = {
  title: "میلانو | استودیو هوشمند اینستاگرام",
  description:
    "استودیو هوشمند ساخت پست، استوری و ریلز با هوش مصنوعی، آنالیز دقیق و مدیریت کامل پیج",
  manifest: "/manifest.json",
  applicationName: "میلانو",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "میلانو",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0510",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  userScalable: false,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
