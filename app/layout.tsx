import "./globals.css";
import type { Metadata } from "next";
import { Noto_Sans_SC, Space_Grotesk } from "next/font/google";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans"
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cn"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "AI News Deck",
    template: "%s · AI News Deck"
  },
  description: "聚合最新 AI 行业新闻，清晰可读的前端展示与实时更新。",
  keywords: [
    "AI 新闻",
    "人工智能",
    "大模型",
    "AIGC",
    "AI 行业资讯",
    "AI News"
  ],
  authors: [{ name: "AI News Deck" }],
  creator: "AI News Deck",
  publisher: "AI News Deck",
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "AI News Deck",
    description: "聚合最新 AI 行业新闻，清晰可读的前端展示与实时更新。",
    siteName: "AI News Deck",
    locale: "zh_CN",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AI News Deck — 洞见 AI 行业新动向"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "AI News Deck",
    description: "聚合最新 AI 行业新闻，清晰可读的前端展示与实时更新。",
    images: ["/opengraph-image"]
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="zh-CN">
      <body className={`${spaceGrotesk.variable} ${notoSansSC.variable}`}>
        {gaId && <GoogleAnalytics gaId={gaId} />}
        {children}
      </body>
    </html>
  );
}
