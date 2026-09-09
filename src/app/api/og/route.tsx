import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

/** Dynamic Open Graph image: /api/og?title=...&subtitle=... */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? site.tagline).slice(0, 110);
  const subtitle = (searchParams.get("subtitle") ?? "Compare hundreds of airlines · Book in minutes · 24/7 US support").slice(0, 120);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #071229 0%, #12244a 55%, #1a75d8 140%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "#2f93ef", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 800 }}>1</div>
          <div style={{ display: "flex", gap: 10, fontSize: 40, fontWeight: 800 }}>
            <span>Air1</span>
            <span style={{ opacity: 0.7, fontWeight: 600 }}>Tickets</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: title.length > 60 ? 54 : 68, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5 }}>{title}</div>
          <div style={{ fontSize: 28, opacity: 0.85 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, opacity: 0.75 }}>
          <span>{site.url.replace(/^https?:\/\//, "")}</span>
          <span style={{ color: "#ff6b35", fontWeight: 700 }}>Fly for less. Book with confidence.</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
