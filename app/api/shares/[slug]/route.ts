import { NextResponse } from "next/server";
import { convexQuery } from "@/lib/server/convex";
import { apiError } from "@/lib/server/api";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const data = await convexQuery("shares:getBySlug", { slug });

    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return apiError(error);
  }
}
