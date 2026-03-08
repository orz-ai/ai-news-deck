import type { Metadata } from "next";
import NewsExplorer from "../components/NewsExplorer";
import { listNews, countNews } from "../lib/server/news";
import { loadSources } from "../lib/server/sources";
import { startScheduler } from "../lib/server/scheduler";

export const metadata: Metadata = {
  title: "AI News Deck — 洞见 AI 行业新动向",
  description: "聚合来自多渠道的最新 AI 资讯，支持关键词、来源与语言快速筛选，帮你高效定位有价值的更新。",
  alternates: { canonical: "/" }
};

export default async function HomePage() {
  // 确保调度器启动
  startScheduler();

  const [news, sources, totalNews] = await Promise.all([
    Promise.resolve(listNews({ limit: 30 })),
    Promise.resolve(loadSources()),
    Promise.resolve(countNews())
  ]);
  const stats = { total_news: totalNews };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AI News Deck",
    url: siteUrl,
    description: "聚合最新 AI 行业新闻，清晰可读的前端展示与实时更新。",
    inLanguage: "zh-CN",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "最新 AI 行业新闻",
    url: siteUrl,
    numberOfItems: news.length,
    itemListElement: news.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "NewsArticle",
        headline: item.title,
        url: item.link,
        ...(item.summary ? { description: item.summary } : {}),
        ...(item.published_at ? { datePublished: item.published_at } : {}),
        dateModified: item.created_at,
        publisher: {
          "@type": "Organization",
          name: item.source
        },
        inLanguage: item.language ?? "zh-CN"
      }
    }))
  };

  return (
    <main className="px-6 pb-20 pt-12 md:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <div className="mx-auto max-w-6xl">
        <header className="grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-end">
          <div className="grid gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate/60">
              AI NEWS DECK
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-ink md:text-5xl">
              洞见 AI 行业新动向
              <span className="mt-2 block text-slate/70">看见趋势背后的信号</span>
            </h1>
            <p className="max-w-xl text-base text-slate/70">
              聚合来自多渠道的 AI 资讯，支持关键词、来源与语言快速筛选，帮你
              高效定位有价值的更新。
            </p>
          </div>
          <div className="grid gap-4 rounded-3xl border border-slate/10 bg-white/70 p-6 shadow-card backdrop-blur">
            <div className="flex items-center justify-between text-sm text-slate/70">
              <span>已接入来源</span>
              <span className="text-xl font-semibold text-ink">
                {sources.filter((item) => item.enabled).length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate/70">
              <span>新闻总量</span>
              <span className="text-xl font-semibold text-ink">
                {stats?.total_news ?? 0}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate/60">
              {sources
                .filter((item) => item.enabled)
                .slice(0, 6)
                .map((item) => (
                  <span
                    key={item.name}
                    className="rounded-full bg-ink px-3 py-1 text-pearl"
                  >
                    {item.name}
                  </span>
                ))}
            </div>
          </div>
        </header>

        <NewsExplorer initialNews={news} sources={sources} stats={stats} />
      </div>
    </main>
  );
}
