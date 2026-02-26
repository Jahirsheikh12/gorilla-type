"use client";

import { useState } from "react";
import { Crown, Medal, Trophy } from "lucide-react";
import { useQuery } from "convex/react";
import { queryRef } from "@/lib/convex-react";
import type { LeaderboardRowDTO } from "@/lib/types";

interface LeaderboardPanelProps {
  onClose: () => void;
  mode?: "time" | "words";
  languageCode?: string;
}

type ModeFilter = "15" | "30" | "60" | "120" | "10" | "25" | "50" | "100";

const PODIUM_STYLES = [
  { border: "linear-gradient(135deg, #fbbf24, #f59e0b)", icon: Crown, iconColor: "text-amber-400", label: "1st" },
  { border: "linear-gradient(135deg, #d1d5db, #9ca3af)", icon: Medal, iconColor: "text-gray-300", label: "2nd" },
  { border: "linear-gradient(135deg, #d97706, #92400e)", icon: Trophy, iconColor: "text-amber-600", label: "3rd" },
];

function PodiumCard({ entry, style }: { entry: LeaderboardRowDTO; style: typeof PODIUM_STYLES[0] }) {
  const Icon = style.icon;
  return (
    <div className="relative flex flex-col items-center rounded-2xl border border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-sub)]/60 p-4">
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
        style={{ background: style.border }}
      />
      <Icon className={`mb-2 h-5 w-5 ${style.iconColor}`} />
      <div className="mb-1 truncate text-sm font-semibold text-[var(--color-gt-text)]">{entry.username}</div>
      <div className="font-heading text-2xl font-bold tabular-nums text-[var(--color-gt-accent)]">{entry.wpm}</div>
      <div className="text-[10px] text-[var(--color-gt-untyped)]">wpm</div>
      <div className="mt-1 text-xs tabular-nums text-[var(--color-gt-text)]/60">{entry.accuracy}%</div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-4 w-4 text-amber-400" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-gray-300" />;
  if (rank === 3) return <Trophy className="h-4 w-4 text-amber-600" />;
  return <span className="text-xs tabular-nums text-[var(--color-gt-untyped)]">{rank}</span>;
}

export function LeaderboardPanel({
  onClose,
  mode = "time",
  languageCode = "en",
}: LeaderboardPanelProps) {
  void onClose;
  const defaultFilter: ModeFilter = mode === "words" ? "25" : "30";
  const [filter, setFilter] = useState<ModeFilter>(defaultFilter);
  const options = mode === "words" ? (["10", "25", "50", "100"] as ModeFilter[]) : (["15", "30", "60", "120"] as ModeFilter[]);
  const liveData = useQuery(
      queryRef<{ modeKeyPrefix: string; limit?: number }, LeaderboardRowDTO[]>(
        "leaderboard:getByModeAndWindow"
      ),
      {
        modeKeyPrefix: `${mode}:${filter}:${languageCode}`,
        limit: 100,
      }
    );
  const data = liveData ?? [];
  const loading = liveData === undefined;

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div className="results-animate flex h-[80vh] max-h-[750px] flex-col overflow-hidden rounded-3xl border border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-sub)] gt-power-bar">
      <div className="flex items-center justify-between border-b border-[var(--color-gt-untyped)]/10 px-6 py-4">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-[var(--color-gt-accent)]" />
          <h2 className="font-heading text-base font-bold text-[var(--color-gt-text)]">Leaderboard</h2>
        </div>
        {/* Segmented control filter */}
        <div className="flex gap-1 rounded-xl bg-[var(--color-gt-bg)] p-0.5">
          {options.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all hover:scale-[1.02] ${
                filter === t
                  ? "bg-[var(--color-gt-accent)]/15 text-[var(--color-gt-accent)]"
                  : "text-[var(--color-gt-untyped)] hover:text-[var(--color-gt-text)]"
              }`}
            >
              {mode === "words" ? `${t}w` : `${t}s`}
            </button>
          ))}
        </div>
      </div>

      <div className="gt-scroll flex-1 overflow-y-auto">
        {loading && data.length === 0 && (
          <div className="px-6 py-5">
            <div className="dot-pulse flex justify-center gap-1.5">
              <span /><span /><span />
            </div>
          </div>
        )}

        {!loading && data.length === 0 && (
          <div className="px-6 py-8 text-center text-sm text-[var(--color-gt-untyped)]">No ranked results yet.</div>
        )}

        {/* Podium - Top 3 */}
        {top3.length > 0 && (
          <div className="grid grid-cols-3 gap-3 px-6 py-5">
            {top3.map((entry, i) => (
              <PodiumCard key={`${entry.userId}-${entry.rank}`} entry={entry} style={PODIUM_STYLES[i]} />
            ))}
          </div>
        )}

        {/* Rest of entries in compact list */}
        {rest.length > 0 && (
          <>
            <div className="grid grid-cols-[40px_1fr_70px_60px_60px_70px_100px] gap-2 border-t border-b border-[var(--color-gt-untyped)]/8 px-6 py-2 text-[10px] font-medium tracking-wider text-[var(--color-gt-untyped)] uppercase">
              <span>#</span>
              <span>name</span>
              <span className="text-right">wpm</span>
              <span className="text-right">acc</span>
              <span className="text-right">raw</span>
              <span className="text-right">cons</span>
              <span className="text-right">date</span>
            </div>
            {rest.map((entry) => (
              <div
                key={`${entry.userId}-${entry.rank}`}
                className="grid grid-cols-[40px_1fr_70px_60px_60px_70px_100px] gap-2 px-6 py-2.5 text-sm transition-colors hover:bg-[var(--color-gt-bg)]/50"
              >
                <div className="flex items-center">
                  <RankBadge rank={entry.rank} />
                </div>
                <div className="truncate font-medium text-[var(--color-gt-text)]/90">{entry.username}</div>
                <div className="text-right font-semibold tabular-nums text-[var(--color-gt-accent)]">{entry.wpm}</div>
                <div className="text-right tabular-nums text-[var(--color-gt-text)]/70">{entry.accuracy}%</div>
                <div className="text-right tabular-nums text-[var(--color-gt-untyped)]">{entry.raw}</div>
                <div className="text-right tabular-nums text-[var(--color-gt-untyped)]">{entry.consistency}%</div>
                <div className="text-right text-xs text-[var(--color-gt-untyped)]">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
