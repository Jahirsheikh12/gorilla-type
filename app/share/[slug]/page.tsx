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
    user: { username: string } | null;
  };
}

async function getShare(slug: string) {
  return convexQuery<SharedResult | null>("shares:getBySlug", { slug });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getShare(slug);
  if (!data) return { title: "Result not found" };

  const title = `${data.result.wpm} WPM • ${data.result.accuracy}% • Gorilla Type`;
  const description = `Shared typing result by ${data.result.user?.username ?? "guest"}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`/api/og?slug=${slug}`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?slug=${slug}`],
    },
  };
}

export default async function SharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getShare(slug);

  if (!data) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6">
      <div className="w-full rounded-2xl border border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-sub)] p-8">
        <div className="mb-6 text-sm text-[var(--color-gt-untyped)]">Shared Result</div>
        <div className="mb-2 text-6xl font-bold text-[var(--color-gt-accent)]">{data.result.wpm} wpm</div>
        <div className="mb-6 text-xl text-[var(--color-gt-text)]">{data.result.accuracy}% accuracy</div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-[var(--color-gt-bg)]/60 p-3">Raw: {data.result.rawWpm}</div>
          <div className="rounded-lg bg-[var(--color-gt-bg)]/60 p-3">Consistency: {data.result.consistency}%</div>
          <div className="rounded-lg bg-[var(--color-gt-bg)]/60 p-3">Duration: {data.result.elapsedSeconds}s</div>
          <div className="rounded-lg bg-[var(--color-gt-bg)]/60 p-3">Language: {data.result.languageCode}</div>
        </div>
        <div className="mt-6 text-xs text-[var(--color-gt-untyped)]">
          by {data.result.user?.username ?? "guest"} • {new Date(data.createdAt).toLocaleString()}
        </div>
      </div>
    </main>
  );
}
