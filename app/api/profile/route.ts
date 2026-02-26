import { NextResponse } from "next/server";
import { convexQuery } from "@/lib/server/convex";
import { apiError, requireAuthId } from "@/lib/server/api";

export async function GET() {
  try {
    const auth = await requireAuthId();
    if (auth.response) return auth.response;

    const summary = await convexQuery("profile:getSummary", {
      authId: auth.authId,
    });

    return NextResponse.json(summary);
  } catch (error) {
    return apiError(error);
  }
}
