import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { convexQuery } from "@/lib/server/convex";
import { apiError } from "@/lib/server/api";

export async function GET() {
  try {
    const session = await auth();
    const authId = session?.user?.authId;

    const [settings, user] = await Promise.all([
      convexQuery("settings:get", { authId }),
      convexQuery("users:getByAuthId", { authId }),
    ]);

    return NextResponse.json({ session, settings, user });
  } catch (error) {
    return apiError(error);
  }
}
