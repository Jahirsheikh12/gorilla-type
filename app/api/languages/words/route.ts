import { NextResponse } from "next/server";
import { convexQuery } from "@/lib/server/convex";
import { apiError } from "@/lib/server/api";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get("languageCode") ?? "en";
    const tier = searchParams.get("tier") ?? undefined;

    const words = await convexQuery<string[]>("languages:getWordPool", {
      languageCode,
      tier,
    });

    return NextResponse.json({ words });
  } catch (error) {
    return apiError(error);
  }
}
