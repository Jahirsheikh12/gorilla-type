import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { convexMutation } from "@/lib/server/convex";
import { apiError } from "@/lib/server/api";
import { checkRateLimit, isTrustedOrigin } from "@/lib/server/security";

const schema = z.object({
  testId: z.string().min(1),
  startToken: z.string().min(1),
  elapsedSeconds: z.number().positive(),
  stats: z.object({
    wpm: z.number(),
    rawWpm: z.number(),
    accuracy: z.number(),
    consistency: z.number(),
    correctChars: z.number(),
    incorrectChars: z.number(),
    extraChars: z.number(),
    missedChars: z.number(),
    totalChars: z.number(),
    elapsedSeconds: z.number(),
  }),
  wpmHistory: z.array(
    z.object({
      second: z.number(),
      wpm: z.number(),
      raw: z.number(),
      errors: z.number(),
    })
  ),
  languageCode: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    if (!(await isTrustedOrigin(req))) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
    const limit = await checkRateLimit(req, "tests-submit", 120, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many result submissions. Try again later." },
        { status: 429 }
      );
    }

    const payload = schema.parse(await req.json());
    const session = await auth();

    const data = await convexMutation("tests:submitResult", {
      authId: session?.user?.authId,
      ...payload,
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    return apiError(error);
  }
}
