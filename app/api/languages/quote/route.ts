import { NextResponse } from "next/server";
import { convexQuery } from "@/lib/server/convex";
import { apiError } from "@/lib/server/api";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get("languageCode") ?? "en";

    const quote = await convexQuery("languages:getRandomQuote", {
      languageCode,
    });

    return NextResponse.json(quote);
  } catch (error) {
    return apiError(error);
  }
}
