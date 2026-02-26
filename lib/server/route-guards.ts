import { NextResponse } from "next/server";
import { requireAuthId } from "@/lib/server/api";
import { checkRateLimit, isTrustedOrigin } from "@/lib/server/security";

interface RateLimitPolicy {
  key: string;
  limit: number;
  windowMs: number;
  errorMessage?: string;
}

interface AuthenticatedGuardOptions {
  enforceOrigin?: boolean;
  rateLimit?: RateLimitPolicy;
}

type GuardResult =
  | { ok: true; authId: string }
  | { ok: false; response: NextResponse };

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function enforceTrustedOrigin(req: Request) {
  if (await isTrustedOrigin(req)) {
    return null;
  }
  return jsonError("Invalid origin", 403);
}

async function enforceRateLimit(req: Request, policy: RateLimitPolicy) {
  const limiter = await checkRateLimit(req, policy.key, policy.limit, policy.windowMs);
  if (limiter.allowed) {
    return null;
  }
  return jsonError(policy.errorMessage ?? "Too many requests", 429);
}

export async function guardAuthenticatedRequest(
  req: Request,
  options: AuthenticatedGuardOptions = {}
): Promise<GuardResult> {
  const { enforceOrigin = true, rateLimit } = options;

  if (enforceOrigin) {
    const originError = await enforceTrustedOrigin(req);
    if (originError) {
      return { ok: false, response: originError };
    }
  }

  if (rateLimit) {
    const rateLimitError = await enforceRateLimit(req, rateLimit);
    if (rateLimitError) {
      return { ok: false, response: rateLimitError };
    }
  }

  const auth = await requireAuthId();
  if (!auth.authId || auth.response) {
    return { ok: false, response: auth.response ?? jsonError("Unauthorized", 401) };
  }

  return { ok: true, authId: auth.authId };
}
