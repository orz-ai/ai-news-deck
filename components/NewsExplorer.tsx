"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

import type { NewsItem, SourceItem, Stats } from "../lib/api";
import { fetchNews, fetchStats } from "../lib/api";
import CustomSelect from "./CustomSelect";

const DEFAULT_LIMIT = 30;

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export default function NewsExplorer({
  initialNews,
  sources,
  stats
}: {
  initialNews: NewsItem[];
  sources: SourceItem[];
  stats: Stats | null;
}) {
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("");
  const [language, setLanguage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [liveStats, setLiveStats] = useState<Stats | null>(stats);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 定期轮询统计数据，保持总量实时更新
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      const data = await fetchStats();
      if (!cancelled && data) setLiveStats(data);
    };
    void poll();
    const timer = setInterval(() => void poll(), 60_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const enabledSources = useMemo(
    () => sources.filter((item) => item.enabled),
    [sources]
  );

  useEffect(() => {
    let active = true;
    const handler = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      const data = await fetchNews({
        q: query || undefined,
        source: source || undefined,
        language: language || undefined,
        limit: DEFAULT_LIMIT,
        offset: 0
      });
      if (!active) return;
      if (data === null) {
        setIsLoading(false);
        setError("后端暂不可用，请检查服务是否已启动。");
        return;
      }
      setNews(data);
      setIsLoading(false);
      setUpdatedAt(new Date().toISOString());
      setHasMore(data.length === DEFAULT_LIMIT);
    }, 350);

    return () => {
      active = false;
      window.clearTimeout(handler);
    };
  }, [query, source, language]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    if (!hasMore || isLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        void (async () => {
          setIsLoadingMore(true);
          const data = await fetchNews({
            q: query || undefined,
            source: source || undefined,
            language: language || undefined,
            limit: DEFAULT_LIMIT,
            offset: news.length
          });
          if (data === null) {
            setIsLoadingMore(false);
            setError("后端暂不可用，请检查服务是否已启动。");
            return;
          }
          setNews((prev) => [...prev, ...data]);
          setHasMore(data.length === DEFAULT_LIMIT);
          setIsLoadingMore(false);
        })();
      },
      { rootMargin: "200px 0px" }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, isLoadingMore, language, news.length, query, source]);

  return (
    <section className="mt-10 grid gap-8">
      <div className="grid gap-6 rounded-3xl border border-slate/10 bg-white/70 p-6 shadow-card backdrop-blur">
        <div className="grid gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate/60">
            Live Control
          </p>
          <h2 className="text-3xl font-semibold text-ink">
            实时过滤与关键字追踪
          </h2>
          <p className="max-w-2xl text-base text-slate/70">
            内置 API + SQLite，支持按来源、语言、关键字即时过滤。当前库内共有
            <span className="mx-2 inline-flex items-center rounded-full bg-ink px-3 py-1 text-xs font-semibold text-pearl">
              {liveStats?.total_news ?? 0} 条
            </span>
            记录。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-end">
          <label className="grid gap-2 text-sm font-medium text-slate">
            关键词
            <input
              className="h-11 rounded-2xl border border-slate/20 bg-white/90 px-4 text-base shadow-sm outline-none ring-0 transition focus:border-slate/40"
              placeholder="例如: 代理、推理、多模态"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate">
            来源
            <CustomSelect
              value={source}
              onChange={setSource}
              placeholder="全部来源"
              options={[
                { value: "", label: "全部来源" },
                ...enabledSources.map((item) => ({
                  value: item.name,
                  label: item.name
                }))
              ]}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate">
            语言
            <CustomSelect
              value={language}
              onChange={setLanguage}
              placeholder="全部语言"
              options={[
                { value: "", label: "全部语言" },
                { value: "zh", label: "中文" },
                { value: "en", label: "English" }
              ]}
            />
          </label>
          <button
            type="button"
            className="flex h-11 items-center justify-center rounded-2xl bg-ink px-6 text-sm font-semibold uppercase tracking-widest text-pearl transition hover:-translate-y-0.5"
            onClick={() => {
              setQuery("");
              setSource("");
              setLanguage("");
            }}
          >
            重置
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate/70">
          <span
            className={clsx(
              "inline-flex items-center gap-2 rounded-full px-3 py-1",
              isLoading ? "bg-aurora text-ink" : "bg-slate/10"
            )}
          >
            {isLoading ? "刷新中" : "数据已同步"}
          </span>
          {updatedAt && (
            <span>
              最近刷新: {formatDate(updatedAt)}
            </span>
          )}
          {error && <span className="text-coral">{error}</span>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {news.map((item) => (
          <article
            key={item.id}
            className="news-card group relative overflow-hidden rounded-3xl border border-slate/10 bg-white/70 p-6 shadow-card backdrop-blur transition hover:-translate-y-1 hover:shadow-glow"
          >
            <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
              <div className="card-sheen absolute inset-0" />
            </div>
            <div className="relative grid gap-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate/70">
                <span className="rounded-full bg-ink px-3 py-1 text-pearl">
                  {item.source}
                </span>
                {item.category && (
                  <span className="rounded-full bg-haze px-3 py-1 text-slate">
                    {item.category}
                  </span>
                )}
                {item.language && (
                  <span className="rounded-full bg-aurora px-3 py-1 text-ink">
                    {item.language}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-semibold leading-snug text-ink">
                {item.title}
              </h3>
              <p className="line-clamp-3 text-sm text-slate/80">
                {item.summary || "暂无摘要，可点击阅读原文。"}
              </p>
              <div className="flex items-center justify-between text-xs text-slate/70">
                <span>{formatDate(item.published_at || item.created_at)}</span>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-ink underline-offset-4 transition hover:underline"
                >
                  阅读原文
                </a>
              </div>
            </div>
          </article>
        ))}
        {!news.length && !isLoading && (
          <div className="rounded-3xl border border-dashed border-slate/30 bg-white/60 p-8 text-center text-sm text-slate/70">
            暂无可展示的新闻，请确认后端服务是否启动。
          </div>
        )}
      </div>

      <div ref={loadMoreRef} className="flex items-center justify-center py-6 text-xs text-slate/60">
        {isLoadingMore
          ? "正在加载更多..."
          : hasMore
            ? "继续下拉加载更多"
            : "没有更多了"}
      </div>
    </section>
  );
}
