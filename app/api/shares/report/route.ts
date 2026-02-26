import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { convexMutation } from "@/lib/server/convex";
import { apiError } from "@/lib/server/api";
import { checkRateLimit, getClientIp, isTrustedOrigin } from "@/lib/server/security";

const schema = z.object({
  slug: z.string().min(1),
  reason: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  try {
    if (!(await isTrustedOrigin(req))) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }

    const limit = await checkRateLimit(req, "shares-report", 20, 60_000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many reports. Try later." }, { status: 429 });
    }

    const payload = schema.parse(await req.json());
    const session = await auth();
    const ip = await getClientIp(req);
    const reporterKey = session?.user?.authId || `ip:${ip}`;

    const data = await convexMutation("shares:report", {
      slug: payload.slug,
      reason: payload.reason,
      reporterKey,
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    return apiError(error);
  }
}
