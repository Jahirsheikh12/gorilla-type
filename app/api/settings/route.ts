import { NextResponse } from "next/server";
import { z } from "zod";
import { convexMutation, convexQuery } from "@/lib/server/convex";
import { apiError, requireAuthId } from "@/lib/server/api";
import { guardAuthenticatedRequest } from "@/lib/server/route-guards";
import { userSettingsPatchSchema } from "@/lib/server/validation";

const updateSchema = z.object({
  patch: userSettingsPatchSchema,
});

export async function GET() {
  try {
    const auth = await requireAuthId();
    if (auth.response) return auth.response;

    const settings = await convexQuery("settings:get", {
      authId: auth.authId,
    });

    return NextResponse.json(settings);
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(req: Request) {
  try {
    const guard = await guardAuthenticatedRequest(req, {
      rateLimit: {
        key: "settings-update",
        limit: 60,
        windowMs: 60_000,
        errorMessage: "Too many settings updates. Try again later.",
      },
    });
    if (!guard.ok) return guard.response;

    const payload = updateSchema.parse(await req.json());

    const settings = await convexMutation("settings:update", {
      authId: guard.authId,
      patch: payload.patch,
    });

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    return apiError(error);
  }
}
