"use client";

import type { TypingState } from "@/hooks/useTypingTest";
import { calculateWpm } from "@/lib/typing-engine";

interface LiveStatsProps {
  state: TypingState;
  showLiveWpm?: boolean;
  showLiveAcc?: boolean;
  showLiveBurst?: boolean;
  timerProgress?: "off" | "bar" | "text" | "mini";
}

export function LiveStats({
  state,
  showLiveWpm = true,
  showLiveAcc = true,
  showLiveBurst = false,
  timerProgress = "bar",
}: LiveStatsProps) {
  if (state.phase !== "running") return null;

  let correctChars = 0;
  for (let w = 0; w < state.typedWords.length; w++) {
    const target = state.words[w] || "";
    const typed = state.typedWords[w] || [];
    for (let c = 0; c < typed.length && c < target.length; c++) {
      if (typed[c] === target[c]) correctChars++;
    }
    if (w < state.currentWordIndex) correctChars++;
  }
  const liveWpm = state.elapsedSeconds > 0
    ? calculateWpm(correctChars, state.elapsedSeconds)
    : 0;
  const totalTyped = state.typedWords.reduce((sum, item) => sum + item.length, 0);
  const liveAccuracy =
    totalTyped > 0 ? Math.max(0, Math.round((correctChars / totalTyped) * 100)) : 100;
  const recent = state.wpmHistory.slice(-3);
  const liveBurst =
    recent.length > 0
      ? Math.round(recent.reduce((sum, item) => sum + item.raw, 0) / recent.length)
      : 0;
  const progressPct =
    state.config.mode === "time" && state.config.timeDuration > 0
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              ((state.config.timeDuration - state.timeLeft) /
                state.config.timeDuration) *
                100
            )
          )
        )
      : 0;

  return (
    <div className="mb-4 flex items-center gap-4">
      {/* Timer / word count — prominent heading font */}
      <div className="flex items-baseline gap-1">
        <span
          className="font-heading text-4xl font-bold tabular-nums text-[var(--color-gt-accent)] text-glow-accent"
        >
          {state.config.mode === "time"
            ? state.timeLeft
            : state.config.mode === "zen"
            ? state.elapsedSeconds
            : state.currentWordIndex}
        </span>
        {(state.config.mode === "words" ||
          state.config.mode === "quote" ||
          state.config.mode === "custom") && (
          <span className="font-heading text-lg font-medium tabular-nums text-[var(--color-gt-untyped)]">
            /{state.words.length}
          </span>
        )}
      </div>

      {/* Progress bar with gradient fill */}
      {state.config.mode === "time" && timerProgress !== "off" && (
        <div className="flex flex-1 items-center gap-2">
          {(timerProgress === "bar" || timerProgress === "mini") && (
            <div
              className={`overflow-hidden rounded-full bg-[var(--color-gt-untyped)]/15 ${
                timerProgress === "mini" ? "h-1 w-16" : "h-1.5 flex-1 max-w-48"
              }`}
            >
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg, var(--color-gt-accent), var(--color-gt-accent2))",
                }}
              />
            </div>
          )}
          {timerProgress === "text" && (
            <span className="text-xs font-medium tabular-nums text-[var(--color-gt-untyped)]">{progressPct}%</span>
          )}
        </div>
      )}

      {/* Spacer when no progress bar */}
      {(state.config.mode !== "time" || timerProgress === "off") && <div className="flex-1" />}

      {/* Live stats as compact chip badges */}
      <div className="flex items-center gap-2">
        {showLiveWpm && state.elapsedSeconds > 0 && (
          <div className="flex items-baseline gap-1 rounded-lg bg-[var(--color-gt-sub)]/50 px-2.5 py-1">
            <span className="font-mono text-lg font-bold tabular-nums text-[var(--color-gt-text)]/70">
              {liveWpm}
            </span>
            <span className="text-[10px] font-medium text-[var(--color-gt-untyped)]">wpm</span>
          </div>
        )}

        {showLiveAcc && state.elapsedSeconds > 0 && (
          <div className="flex items-baseline gap-1 rounded-lg bg-[var(--color-gt-sub)]/50 px-2.5 py-1">
            <span className="font-mono text-lg font-bold tabular-nums text-[var(--color-gt-text)]/70">
              {liveAccuracy}%
            </span>
            <span className="text-[10px] font-medium text-[var(--color-gt-untyped)]">acc</span>
          </div>
        )}

        {showLiveBurst && state.elapsedSeconds > 0 && (
          <div className="flex items-baseline gap-1 rounded-lg bg-[var(--color-gt-sub)]/50 px-2.5 py-1">
            <span className="font-mono text-lg font-bold tabular-nums text-[var(--color-gt-text)]/70">
              {liveBurst}
            </span>
            <span className="text-[10px] font-medium text-[var(--color-gt-untyped)]">burst</span>
          </div>
        )}
      </div>
    </div>
  );
}
