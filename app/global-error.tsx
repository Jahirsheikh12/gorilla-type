"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="font-mono antialiased">
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
          <h1 className="text-3xl font-semibold text-[var(--color-gt-text)]">Something went wrong</h1>
          <p className="mt-3 text-sm text-[var(--color-gt-untyped)]">
            The error has been captured. Please retry.
          </p>
          <button
            onClick={reset}
            className="mt-6 rounded-xl bg-[var(--color-gt-accent)] px-5 py-2 text-sm font-semibold text-[var(--color-gt-bg)]"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
