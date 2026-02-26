"use client";

import { ConvexReactClient } from "convex/react";
import type { FunctionReference } from "convex/server";

let client: ConvexReactClient | null = null;

export function getConvexReactClient() {
  if (client) return client;
  const url =
    process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud";
  client = new ConvexReactClient(url);
  return client;
}

export function queryRef<Args extends Record<string, unknown>, Output>(path: string) {
  return path as unknown as FunctionReference<"query", "public", Args, Output>;
}
