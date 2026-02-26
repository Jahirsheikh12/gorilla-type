import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { convexMutation } from "@/lib/server/convex";
import { apiError } from "@/lib/server/api";
import { checkRateLimit, isTrustedOrigin } from "@/lib/server/security";

const bodySchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(24),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  try {
    if (!(await isTrustedOrigin(req))) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
    const limit = await checkRateLimit(req, "auth-signup", 5, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many signup attempts. Try again later." },
        { status: 429 }
      );
    }

    const payload = bodySchema.parse(await req.json());
    const passwordHash = await hash(payload.password, 12);

    const result = await convexMutation<{ authId: string }>("users:registerWithPassword", {
      email: payload.email,
      username: payload.username,
      passwordHash,
    });

    return NextResponse.json({ success: true, authId: result.authId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.flatten() },
        { status: 400 }
      );
    }

    return apiError(error, 400);
  }
}
