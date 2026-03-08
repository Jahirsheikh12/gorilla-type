import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { convexQuery } from "@/lib/server/convex";

interface SharedResult {
  slug: string;
  visibility: string;
  createdAt: number;
  result: {
    mode: string;
    modeKey: string;
    languageCode: string;
    wpm: number;
    rawWpm: number;
    accuracy: number;
    consistency: number;
    elapsedSeconds: number;
    correctChars?: number;
    incorrectChars?: number;
    extraChars?: number;
    missedChars?: number;
    user: { username: string } | null;
  };
}

async function getShare(slug: string) {
  return convexQuery<SharedResult | null>("shares:getBySlug", { slug });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getShare(slug);
  if (!data) return { title: "Result not found" };

  const title = `${data.result.wpm} WPM • ${data.result.accuracy}% accuracy • Gorilla Type`;
  const description = `${data.result.user?.username ?? "Guest"} typed ${data.result.wpm} WPM with ${data.result.accuracy}% accuracy on Gorilla Type`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`/api/og?slug=${slug}`],
      siteName: "Gorilla Type",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?slug=${slug}`],
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getShare(slug);

  if (!data) {
    notFound();
  }

  const { result, createdAt } = data;
  const username = result.user?.username ?? "guest";
  const date = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-12">
      <div className="w-full">
        {/* Power bar */}
        <div className="h-[3px] w-full rounded-t-2xl bg-gradient-to-r from-[var(--color-gt-accent)] via-[#00c9a7] to-[var(--color-gt-accent2)]" />

        <div className="rounded-b-2xl border border-t-0 border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-sub)]/60 p-8 sm:p-10">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-gt-accent)]/10">
                <span className="text-sm font-bold text-[var(--color-gt-accent)]">
                  G
                </span>
              </div>
              <span className="font-heading text-base font-bold tracking-tight">
                <span className="text-[var(--color-gt-accent)]">gorilla</span>
                <span className="text-[var(--color-gt-text)]">type</span>
              </span>
            </div>
            <span className="text-xs text-[var(--color-gt-untyped)]">
              Shared Result
            </span>
          </div>

          {/* Main stats hero */}
          <div className="mb-8 grid grid-cols-2 gap-6">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--color-gt-untyped)]/8 bg-[var(--color-gt-bg)]/40 p-6">
              <span className="text-[10px] font-semibold tracking-widest text-[var(--color-gt-untyped)] uppercase">
                wpm
              </span>
              <span className="font-heading text-6xl font-bold tabular-nums text-[var(--color-gt-accent)] sm:text-7xl">
                {result.wpm}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--color-gt-untyped)]/8 bg-[var(--color-gt-bg)]/40 p-6">
              <span className="text-[10px] font-semibold tracking-widest text-[var(--color-gt-untyped)] uppercase">
                accuracy
              </span>
              <span className="font-heading text-6xl font-bold tabular-nums text-[var(--color-gt-accent2)] sm:text-7xl">
                {result.accuracy}%
              </span>
            </div>
          </div>

          {/* Secondary stats */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-[var(--color-gt-untyped)]/8 bg-[var(--color-gt-bg)]/40 px-4 py-3">
              <div className="text-[10px] font-medium tracking-widest text-[var(--color-gt-untyped)] uppercase">
                raw
              </div>
              <div className="mt-1 font-mono text-lg font-bold tabular-nums text-[var(--color-gt-text)]">
                {result.rawWpm}
              </div>
            </div>
            <div className="rounded-xl border border-[var(--color-gt-untyped)]/8 bg-[var(--color-gt-bg)]/40 px-4 py-3">
              <div className="text-[10px] font-medium tracking-widest text-[var(--color-gt-untyped)] uppercase">
                consistency
              </div>
              <div className="mt-1 font-mono text-lg font-bold tabular-nums text-[var(--color-gt-text)]">
                {result.consistency}%
              </div>
            </div>
            <div className="rounded-xl border border-[var(--color-gt-untyped)]/8 bg-[var(--color-gt-bg)]/40 px-4 py-3">
              <div className="text-[10px] font-medium tracking-widest text-[var(--color-gt-untyped)] uppercase">
                time
              </div>
              <div className="mt-1 font-mono text-lg font-bold tabular-nums text-[var(--color-gt-text)]">
                {result.elapsedSeconds}s
              </div>
            </div>
            <div className="rounded-xl border border-[var(--color-gt-untyped)]/8 bg-[var(--color-gt-bg)]/40 px-4 py-3">
              <div className="text-[10px] font-medium tracking-widest text-[var(--color-gt-untyped)] uppercase">
                mode
              </div>
              <div className="mt-1 font-mono text-lg font-bold tabular-nums text-[var(--color-gt-text)]">
                {result.modeKey}
              </div>
            </div>
          </div>

          {/* Footer: user + date + CTA */}
          <div className="flex items-center justify-between border-t border-[var(--color-gt-untyped)]/8 pt-6">
            <div className="text-sm text-[var(--color-gt-untyped)]">
              typed by{" "}
              <span className="font-medium text-[var(--color-gt-text)]">
                {username}
              </span>
              <span className="mx-2 text-[var(--color-gt-untyped)]/30">•</span>
              {date}
            </div>
            <a
              href="/"
              className="rounded-xl bg-[var(--color-gt-accent)]/10 px-4 py-2 text-sm font-medium text-[var(--color-gt-accent)] transition-colors hover:bg-[var(--color-gt-accent)]/20"
            >
              Try Gorilla Type
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
