"use client";

import { User, Calendar, Flame, Target, Zap, Trophy, BarChart3, Clock } from "lucide-react";
import { useQuery } from "convex/react";
import { useSession } from "next-auth/react";
import { queryRef } from "@/lib/convex-react";
import type { ProfileSummaryDTO } from "@/lib/types";

interface ProfilePanelProps {
  onClose: () => void;
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay?: number;
}

function StatCard({ icon, label, value, delay = 0 }: StatCardProps) {
  return (
    <div
      className="bento-animate rounded-2xl border border-[var(--color-gt-untyped)]/8 bg-[var(--color-gt-bg)]/50 px-4 py-3"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-1 flex items-center gap-1.5 text-[var(--color-gt-untyped)]">
        {icon}
        <span className="text-[10px] font-medium tracking-wider uppercase">{label}</span>
      </div>
      <div className="font-heading text-xl font-bold tabular-nums text-[var(--color-gt-text)]">{value}</div>
    </div>
  );
}

export function ProfilePanel({ onClose }: ProfilePanelProps) {
  const { data: session } = useSession();
  const authId = session?.user?.authId;

  const summary =
    useQuery(
      queryRef<{ authId?: string }, ProfileSummaryDTO | null>("profile:getSummary"),
      { authId }
    ) ?? null;

  const history =
    useQuery(
      queryRef<
        { authId?: string; limit?: number },
        Array<{
          id: string;
          createdAt: number;
          modeKey: string;
          wpm: number;
          accuracy: number;
        }>
      >("profile:getHistory"),
      {
        authId,
        limit: 40,
      }
    ) ?? [];

  if (!summary) {
    return (
      <div className="results-animate flex h-[75vh] items-center justify-center rounded-3xl border border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-sub)]">
        <div className="text-center">
          <User className="mx-auto mb-3 h-10 w-10 text-[var(--color-gt-untyped)]/40" />
          <div className="font-body text-sm text-[var(--color-gt-untyped)]">Sign in to view your profile.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="results-animate flex h-[80vh] max-h-[750px] flex-col overflow-hidden rounded-3xl border border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-sub)]">
      {/* Gradient header card */}
      <div className="relative overflow-hidden border-b border-[var(--color-gt-untyped)]/10 px-6 py-6">
        <div className="absolute inset-0 opacity-[0.06]" style={{ background: "var(--gt-gradient-primary)" }} />
        <div className="relative flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-gt-accent)]/10 glow-accent">
            <User className="h-8 w-8 text-[var(--color-gt-accent)]" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-[var(--color-gt-text)]">{summary.username}</h2>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-[var(--color-gt-untyped)]">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Joined {new Date(summary.joinedAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-400" />
                {summary.streakDays} day streak
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-auto rounded-xl bg-[var(--color-gt-accent)]/10 px-4 py-2 text-xs font-semibold text-[var(--color-gt-accent)] transition-all hover:bg-[var(--color-gt-accent)]/20"
          >
            Back
          </button>
        </div>
      </div>

      <div className="gt-scroll flex-1 overflow-y-auto p-6">
        {/* Stats bento grid */}
        <h3 className="mb-3 font-heading text-xs font-semibold tracking-widest text-[var(--color-gt-untyped)] uppercase">
          Statistics
        </h3>
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={<Zap className="h-3 w-3" />} label="Tests taken" value={`${summary.testsTaken}`} delay={0} />
          <StatCard icon={<Clock className="h-3 w-3" />} label="Time typing" value={formatDuration(summary.timeTypingSeconds)} delay={80} />
          <StatCard icon={<Target className="h-3 w-3" />} label="Avg accuracy" value={`${summary.avgAccuracy}%`} delay={160} />
          <StatCard icon={<BarChart3 className="h-3 w-3" />} label="Avg wpm" value={`${summary.avgWpm}`} delay={240} />
        </div>

        {/* Personal bests with gradient trophy treatment */}
        <h3 className="mb-3 font-heading text-xs font-semibold tracking-widest text-[var(--color-gt-untyped)] uppercase">
          Personal bests
        </h3>
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summary.personalBests.length === 0 && (
            <div className="col-span-full text-xs text-[var(--color-gt-untyped)]">No personal bests yet.</div>
          )}
          {summary.personalBests.map((pb, i) => (
            <div
              key={pb.mode}
              className="bento-animate relative overflow-hidden rounded-2xl border border-[var(--color-gt-untyped)]/8 bg-[var(--color-gt-bg)]/50 p-3 text-center"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: "var(--gt-gradient-primary)" }}
              />
              <div className="truncate text-[10px] font-medium text-[var(--color-gt-untyped)]">{pb.mode}</div>
              <div className="mt-1 flex items-center justify-center gap-1">
                <Trophy className="h-3 w-3 text-amber-400" />
                <span className="font-heading text-lg font-bold tabular-nums text-[var(--color-gt-accent)]">{pb.wpm}</span>
              </div>
              <div className="text-[10px] text-[var(--color-gt-untyped)]">wpm</div>
            </div>
          ))}
        </div>

        {/* Recent history as compact timeline */}
        <h3 className="mb-3 font-heading text-xs font-semibold tracking-widest text-[var(--color-gt-untyped)] uppercase">
          Recent history
        </h3>
        <div className="space-y-1.5">
          {history.length === 0 && (
            <div className="text-xs text-[var(--color-gt-untyped)]">No test history yet.</div>
          )}
          {history.map((test) => (
            <div
              key={test.id}
              className="flex items-center justify-between rounded-xl border border-[var(--color-gt-untyped)]/6 bg-[var(--color-gt-bg)]/40 px-3 py-2 transition-colors hover:bg-[var(--color-gt-bg)]/60"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold tabular-nums text-[var(--color-gt-accent)]">{test.wpm}</span>
                <span className="text-xs text-[var(--color-gt-untyped)]">wpm</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs tabular-nums text-[var(--color-gt-text)]/70">{test.accuracy}%</span>
                <span className="rounded-lg bg-[var(--color-gt-untyped)]/10 px-1.5 py-0.5 text-[10px] text-[var(--color-gt-untyped)]">
                  {test.modeKey}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
