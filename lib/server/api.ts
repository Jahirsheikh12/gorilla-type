import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth";

export async function requireAuthId() {
  const session = await auth();
  const authId = session?.user?.authId;
  if (!authId) {
    return {
      authId: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { authId, response: null as NextResponse | null };
}

export function apiError(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  Sentry.captureException(error);
  return NextResponse.json({ error: message }, { status });
}
