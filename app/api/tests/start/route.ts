import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { convexMutation } from "@/lib/server/convex";
import { apiError } from "@/lib/server/api";
import { checkRateLimit, isTrustedOrigin } from "@/lib/server/security";

const schema = z.object({
  mode: z.string().min(1),
  config: z.record(z.string(), z.any()),
  languageCode: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    if (!(await isTrustedOrigin(req))) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
    const limit = await checkRateLimit(req, "tests-start", 180, 60_000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many test starts. Slow down." }, { status: 429 });
    }

    const payload = schema.parse(await req.json());
    const session = await auth();

    const data = await convexMutation("tests:startTest", {
      authId: session?.user?.authId,
      mode: payload.mode,
      config: payload.config,
      languageCode: payload.languageCode,
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    return apiError(error);
  }
}
