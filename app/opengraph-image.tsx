import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AI News Deck — 洞见 AI 行业新动向";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)"
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "100px",
            padding: "8px 24px",
            marginBottom: "36px"
          }}
        >
          <span style={{ color: "#94a3b8", fontSize: "20px", letterSpacing: "0.2em", fontWeight: 600 }}>
            AI NEWS DECK
          </span>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "36px" }}>
          <span style={{ fontSize: "72px", fontWeight: 700, color: "#f8fafc", lineHeight: 1.1 }}>
            洞见 AI 行业新动向
          </span>
          <span style={{ fontSize: "40px", fontWeight: 400, color: "#94a3b8" }}>
            看见趋势背后的信号
          </span>
        </div>

        {/* Description */}
        <span style={{ fontSize: "26px", color: "#64748b", maxWidth: "700px", lineHeight: 1.5 }}>
          聚合来自多渠道的 AI 资讯，支持关键词、来源与语言快速筛选
        </span>
      </div>
    ),
    { ...size }
  );
}
