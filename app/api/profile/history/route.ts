import { NextResponse } from "next/server";
import { convexQuery } from "@/lib/server/convex";
import { apiError, requireAuthId } from "@/lib/server/api";

export async function GET(req: Request) {
  try {
    const auth = await requireAuthId();
    if (auth.response) return auth.response;

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") ?? "50");

    const history = await convexQuery("profile:getHistory", {
      authId: auth.authId,
      limit,
    });

    return NextResponse.json(history);
  } catch (error) {
    return apiError(error);
  }
}
