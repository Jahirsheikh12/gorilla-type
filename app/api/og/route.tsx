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
    result: {
      wpm: number;
      rawWpm: number;
      accuracy: number;
      consistency: number;
      modeKey: string;
      elapsedSeconds: number;
      user: { username: string } | null;
    };
  } | null>("shares:getBySlug", { slug });
  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  const { wpm, accuracy, rawWpm, consistency, modeKey, elapsedSeconds, user } =
    data.result;
  const username = user?.username ?? "guest";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(165deg, #121a16 0%, #0a0f0d 50%, #080c0a 100%)",
          color: "#e8f0eb",
          padding: "56px 64px",
          justifyContent: "space-between",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background accent blobs */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "#00e87b",
            opacity: 0.04,
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-60px",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "#b44dff",
            opacity: 0.04,
            filter: "blur(80px)",
          }}
        />

        {/* Top bar: gradient line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #00e87b, #00c9a7, #b44dff)",
          }}
        />

        {/* Header: brand + mode */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "rgba(0, 232, 123, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: 700,
                color: "#00e87b",
              }}
            >
              G
            </div>
            <span style={{ fontSize: "26px", fontWeight: 700 }}>
              <span style={{ color: "#00e87b" }}>gorilla</span>
              <span style={{ color: "#e8f0eb" }}>type</span>
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              fontSize: "18px",
              color: "#3d5a47",
            }}
          >
            <span>{modeKey}</span>
            <span>•</span>
            <span>{elapsedSeconds}s</span>
          </div>
        </div>

        {/* Main stats */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "40px",
          }}
        >
          {/* WPM hero */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span
              style={{
                fontSize: "16px",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#3d5a47",
              }}
            >
              wpm
            </span>
            <span
              style={{
                fontSize: "140px",
                fontWeight: 800,
                lineHeight: 0.9,
                color: "#00e87b",
                textShadow: "0 0 60px rgba(0, 232, 123, 0.2)",
              }}
            >
              {wpm}
            </span>
          </div>

          {/* Secondary stats grid */}
          <div
            style={{
              display: "flex",
              gap: "24px",
              paddingBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "16px 24px",
                borderRadius: "16px",
                border: "1px solid rgba(61, 90, 71, 0.15)",
                background: "rgba(18, 26, 22, 0.6)",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#3d5a47",
                }}
              >
                accuracy
              </span>
              <span
                style={{
                  fontSize: "44px",
                  fontWeight: 700,
                  color: "#b44dff",
                  textShadow: "0 0 40px rgba(180, 77, 255, 0.15)",
                }}
              >
                {accuracy}%
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "16px 24px",
                borderRadius: "16px",
                border: "1px solid rgba(61, 90, 71, 0.15)",
                background: "rgba(18, 26, 22, 0.6)",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#3d5a47",
                }}
              >
                raw
              </span>
              <span
                style={{
                  fontSize: "44px",
                  fontWeight: 700,
                  color: "#e8f0eb",
                }}
              >
                {rawWpm}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "16px 24px",
                borderRadius: "16px",
                border: "1px solid rgba(61, 90, 71, 0.15)",
                background: "rgba(18, 26, 22, 0.6)",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#3d5a47",
                }}
              >
                consistency
              </span>
              <span
                style={{
                  fontSize: "44px",
                  fontWeight: 700,
                  color: "#e8f0eb",
                }}
              >
                {consistency}%
              </span>
            </div>
          </div>
        </div>

        {/* Footer: username + URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(61, 90, 71, 0.12)",
            paddingTop: "20px",
          }}
        >
          <span style={{ fontSize: "20px", color: "#3d5a47" }}>
            typed by{" "}
            <span style={{ color: "#e8f0eb", fontWeight: 600 }}>
              {username}
            </span>
          </span>
          <span
            style={{
              fontSize: "18px",
              color: "#3d5a47",
              letterSpacing: "0.05em",
            }}
          >
            gorillatype.com
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
