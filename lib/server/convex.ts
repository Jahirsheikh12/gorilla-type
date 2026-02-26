import { ConvexHttpClient } from "convex/browser";
import { assertRequiredEnv, getServerEnv } from "@/lib/env";

type ConvexPath = `${string}:${string}`;

let cachedClient: ConvexHttpClient | null = null;

function getClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const env = assertRequiredEnv(["NEXT_PUBLIC_CONVEX_URL"]);
  const client = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL!);
  const deployKey = getServerEnv().CONVEX_DEPLOY_KEY;
  if (deployKey) {
    (client as unknown as { setAdminAuth: (token: string) => void }).setAdminAuth(
      deployKey
    );
  }

  cachedClient = client;
  return cachedClient;
}

export async function convexQuery<T = unknown>(path: ConvexPath, args: Record<string, unknown> = {}) {
  const client = getClient();
  return (await client.query(path as never, args as never)) as T;
}

export async function convexMutation<T = unknown>(
  path: ConvexPath,
  args: Record<string, unknown> = {}
) {
  const client = getClient();
  return (await client.mutation(path as never, args as never, {
    skipQueue: true,
  } as never)) as T;
}

export async function convexAction<T = unknown>(path: ConvexPath, args: Record<string, unknown> = {}) {
  const client = getClient();
  return (await client.action(path as never, args as never)) as T;
}
