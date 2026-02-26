import { NextResponse } from "next/server";
import { convexQuery } from "@/lib/server/convex";
import { apiError, requireAuthId } from "@/lib/server/api";

export async function GET() {
  try {
    const auth = await requireAuthId();
    if (auth.response) return auth.response;

    const data = await convexQuery("users:exportAccountData", {
      authId: auth.authId,
    });

    return NextResponse.json(data, {
      headers: {
        "Content-Disposition": 'attachment; filename="gorilla-type-export.json"',
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
