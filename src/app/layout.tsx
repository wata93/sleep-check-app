import type { Metadata, Viewport } from "next";
import "./globals.css";
import { APP_DESCRIPTION, APP_NAME, CLINIC_ADDRESS, CLINIC_NAME, CLINIC_TEL, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${APP_NAME}｜${CLINIC_NAME}`,
    template: `%s｜${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  manifest: "/manifest.json",
  keywords: [
    "身体の悩み診断",
    "セルフチェック",
    "睡眠チェック",
    "肩こり",
    "腰痛",
    "猫背",
    "姿勢",
    "外反母趾",
    "ダイエット",
    "美肌",
    "整体",
    CLINIC_NAME,
  ],
  authors: [{ name: CLINIC_NAME }],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: SITE_URL,
    siteName: APP_NAME,
    title: `${APP_NAME}｜${CLINIC_NAME}`,
    description: APP_DESCRIPTION,
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: APP_NAME }],
  },
  twitter: {
    card: "summary",
    title: `${APP_NAME}｜${CLINIC_NAME}`,
    description: APP_DESCRIPTION,
    images: ["/icons/icon-512.png"],
  },
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#13213e",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: APP_NAME,
      url: SITE_URL,
      applicationCategory: "HealthApplication",
      operatingSystem: "Any",
      description: APP_DESCRIPTION,
      offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
    },
    {
      "@type": "MedicalBusiness",
      name: CLINIC_NAME,
      telephone: CLINIC_TEL,
      address: CLINIC_ADDRESS,
      url: SITE_URL,
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
