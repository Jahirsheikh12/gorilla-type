import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }
  return value;
};

const optionalString = () => z.preprocess(emptyToUndefined, z.string().optional());
const optionalUrl = () => z.preprocess(emptyToUndefined, z.string().url().optional());

const serverSchema = z.object({
  NEXT_PUBLIC_CONVEX_URL: optionalUrl(),
  CONVEX_DEPLOY_KEY: optionalString(),
  NEXTAUTH_SECRET: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  NEXTAUTH_URL: optionalUrl(),
  GOOGLE_CLIENT_ID: optionalString(),
  GOOGLE_CLIENT_SECRET: optionalString(),
  GITHUB_CLIENT_ID: optionalString(),
  GITHUB_CLIENT_SECRET: optionalString(),
  SENTRY_DSN: optionalUrl(),
  NEXT_PUBLIC_SENTRY_DSN: optionalUrl(),
  SENTRY_TRACES_SAMPLE_RATE: optionalString(),
  NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: optionalString(),
  SENTRY_ORG: optionalString(),
  SENTRY_PROJECT: optionalString(),
  ALLOWED_ORIGINS: optionalString(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let parsed: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (!parsed) {
    parsed = serverSchema.parse(process.env);
  }
  return parsed;
}

export function assertRequiredEnv(keys: Array<keyof ServerEnv>) {
  const env = getServerEnv();
  const missing = keys.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
  return env;
}

export function assertProductionEnv() {
  if (process.env.NODE_ENV !== "production") return;
  assertRequiredEnv(["NEXT_PUBLIC_CONVEX_URL", "CONVEX_DEPLOY_KEY", "NEXTAUTH_SECRET", "NEXTAUTH_URL"]);
}
