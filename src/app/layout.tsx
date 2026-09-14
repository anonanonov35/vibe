import type { Metadata } from "next";
import "@fontsource-variable/oswald";
import "./globals.css";
import { site } from "@/lib/content";
import { isDemo, siteUrl } from "@/lib/deployment";

export const metadata: Metadata = {
  metadataBase: new URL(`${siteUrl}/`),
  title: { default: "ВАЙБ — тату-студия в Москве. Твоя кожа. Твои правила.", template: "%s · ВАЙБ" },
  description: isDemo ? `Демонстрационный сайт тату-студии ВАЙБ — работа для портфолио. ${site.description}` : site.description,
  alternates: { canonical: `${siteUrl}/` },
  openGraph: { title: "ВАЙБ — Твоя кожа. Твои правила.", description: site.description, locale: "ru_RU", type: "website", siteName: "ВАЙБ", images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: "ВАЙБ — тату-студия в Москве" }] },
  twitter: { card: "summary_large_image", images: [`${siteUrl}/og-image.png`] },
  robots: { index: true, follow: true },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
