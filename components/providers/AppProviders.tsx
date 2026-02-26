"use client";

import { ConvexProvider } from "convex/react";
import { SessionProvider } from "next-auth/react";
import { getConvexReactClient } from "@/lib/convex-react";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const client = getConvexReactClient();
  return (
    <SessionProvider>
      <ConvexProvider client={client}>{children}</ConvexProvider>
    </SessionProvider>
  );
}
