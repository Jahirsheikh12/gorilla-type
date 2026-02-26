import { NextResponse } from "next/server";
import { z } from "zod";
import { convexMutation } from "@/lib/server/convex";
import { apiError } from "@/lib/server/api";
import { guardAuthenticatedRequest } from "@/lib/server/route-guards";

const schema = z.object({
  confirmText: z.literal("DELETE"),
});

export async function DELETE(req: Request) {
  try {
    const guard = await guardAuthenticatedRequest(req, {
      rateLimit: {
        key: "danger-delete-account",
        limit: 5,
        windowMs: 60_000,
      },
    });
    if (!guard.ok) return guard.response;

    schema.parse(await req.json());

    const data = await convexMutation("users:deleteAccount", {
      authId: guard.authId,
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Provide { "confirmText": "DELETE" } to continue.' },
        { status: 400 }
      );
    }
    return apiError(error);
  }
}
