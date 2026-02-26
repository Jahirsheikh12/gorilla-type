import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { convexMutation } from "@/lib/server/convex";
import { apiError } from "@/lib/server/api";
import { checkRateLimit, isTrustedOrigin } from "@/lib/server/security";

const schema = z.object({
  resultId: z.string().min(1),
  visibility: z.enum(["public", "unlisted", "private"]).optional(),
  ogImageUrl: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    if (!(await isTrustedOrigin(req))) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
    const limit = await checkRateLimit(req, "shares-create", 30, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many share attempts. Try again later." },
        { status: 429 }
      );
    }

    const payload = schema.parse(await req.json());
    const session = await auth();

    const data = await convexMutation("shares:create", {
      authId: session?.user?.authId,
      resultId: payload.resultId,
      visibility: payload.visibility,
      ogImageUrl: payload.ogImageUrl,
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    return apiError(error);
  }
}
