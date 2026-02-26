import { convexMutation } from "@/lib/server/convex";

export async function getClientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "unknown";
}

export async function checkRateLimit(
  req: Request,
  key: string,
  limit: number,
  windowMs: number
) {
  const ip = await getClientIp(req);
  const path = new URL(req.url).pathname;
  const bucketKey = `${key}:${ip}:${path}`;

  try {
    return await convexMutation<{
      allowed: boolean;
      remaining: number;
      retryAfterMs: number;
    }>("security:checkRateLimit", {
      key: bucketKey,
      limit,
      windowMs,
    });
  } catch {
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      retryAfterMs: windowMs,
    };
  }
}

export async function isTrustedOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;

  const configuredOrigins = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (nextAuthUrl) configuredOrigins.push(nextAuthUrl);

  // Always trust same-host requests (useful for local network testing).
  configuredOrigins.push(new URL(req.url).origin);
  if (configuredOrigins.length === 0) return true;

  try {
    const originUrl = new URL(origin);
    return configuredOrigins.some((trusted) => {
      const trustedUrl = new URL(trusted);
      return trustedUrl.origin === originUrl.origin;
    });
  } catch {
    return false;
  }
}
