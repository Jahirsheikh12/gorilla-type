import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { convexMutation } from "@/lib/server/convex";
import { apiError } from "@/lib/server/api";
import { checkRateLimit, isTrustedOrigin } from "@/lib/server/security";

const schema = z.object({
  languageCode: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    if (!(await isTrustedOrigin(req))) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
    const limit = await checkRateLimit(req, "language-select", 120, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 }
      );
    }

    const payload = schema.parse(await req.json());
    const session = await auth();

    const result = await convexMutation("languages:select", {
      authId: session?.user?.authId,
      languageCode: payload.languageCode,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    return apiError(error);
  }
}
