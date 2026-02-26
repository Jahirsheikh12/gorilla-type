import { NextResponse } from "next/server";
import { convexQuery } from "@/lib/server/convex";
import { apiError } from "@/lib/server/api";

export async function GET() {
  try {
    const data = await convexQuery("languages:list", {});
    return NextResponse.json(data);
  } catch (error) {
    return apiError(error);
  }
}
