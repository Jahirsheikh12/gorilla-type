import { NextResponse } from "next/server";
import { convexQuery } from "@/lib/server/convex";
import { apiError } from "@/lib/server/api";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const duration = searchParams.get("duration") ?? "30";
    const mode = searchParams.get("mode") ?? "time";
    const languageCode = searchParams.get("languageCode") ?? "en";

    const modeKeyPrefix = `${mode}:${duration}:${languageCode}`;

    const data = await convexQuery("leaderboard:getByModeAndWindow", {
      modeKeyPrefix,
      limit: 100,
    });

    return NextResponse.json(data);
  } catch (error) {
    return apiError(error);
  }
}
