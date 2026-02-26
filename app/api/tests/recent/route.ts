import { NextResponse } from "next/server";
import { convexQuery } from "@/lib/server/convex";
import { apiError, requireAuthId } from "@/lib/server/api";

export async function GET(req: Request) {
  try {
    const auth = await requireAuthId();
    if (auth.response) return auth.response;

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") ?? "20");

    const data = await convexQuery("tests:getRecentResults", {
      authId: auth.authId,
      limit,
    });

    return NextResponse.json(data);
  } catch (error) {
    return apiError(error);
  }
}
