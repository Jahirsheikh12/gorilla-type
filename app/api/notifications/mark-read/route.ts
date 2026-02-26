import { NextResponse } from "next/server";
import { z } from "zod";
import { convexMutation } from "@/lib/server/convex";
import { apiError } from "@/lib/server/api";
import { guardAuthenticatedRequest } from "@/lib/server/route-guards";

const schema = z.object({ notificationId: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const guard = await guardAuthenticatedRequest(req, {
      rateLimit: {
        key: "notifications-mark-read",
        limit: 240,
        windowMs: 60_000,
      },
    });
    if (!guard.ok) return guard.response;

    const payload = schema.parse(await req.json());

    const data = await convexMutation("notifications:markRead", {
      authId: guard.authId,
      notificationId: payload.notificationId,
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    return apiError(error);
  }
}
