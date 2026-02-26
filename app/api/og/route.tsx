import { ImageResponse } from "next/og";
import { convexQuery } from "@/lib/server/convex";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  const data = await convexQuery<{
    result: { wpm: number; accuracy: number; modeKey: string; user: { username: string } | null };
  } | null>("shares:getBySlug", { slug });
  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0b1120",
          color: "#dbeafe",
          padding: 64,
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 36, color: "#00e5ff" }}>gorillatype</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 120, fontWeight: 700, lineHeight: 1 }}>{data.result.wpm} WPM</div>
          <div style={{ fontSize: 44, color: "#c084fc" }}>{data.result.accuracy}% accuracy</div>
        </div>
        <div style={{ fontSize: 28, color: "#8aa2d0" }}>
          {data.result.user?.username ?? "guest"} • {data.result.modeKey}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
