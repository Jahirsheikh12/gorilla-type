import { NextResponse } from "next/server";
import { convexMutation } from "@/lib/server/convex";
import { apiError } from "@/lib/server/api";
import { guardAuthenticatedRequest } from "@/lib/server/route-guards";

export async function POST(req: Request) {
  try {
    const guard = await guardAuthenticatedRequest(req, {
      rateLimit: {
        key: "danger-reset-settings",
        limit: 10,
        windowMs: 60_000,
      },
    });
    if (!guard.ok) return guard.response;

    const data = await convexMutation("settings:reset", {
      authId: guard.authId,
    });

    return NextResponse.json(data);
  } catch (error) {
    return apiError(error);
  }
}
