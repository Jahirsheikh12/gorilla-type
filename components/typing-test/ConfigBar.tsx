"use client";

import { Timer, Type, Quote, Brain, Wrench, Globe } from "lucide-react";
import type { TestConfig, TestMode, TimeDuration, WordCount } from "@/hooks/useTypingTest";

interface ConfigBarProps {
  config: TestConfig;
  disabled: boolean;
  setConfig: (payload: Partial<TestConfig>) => void;
  onOpenLanguage: () => void;
}

function SegmentBtn({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-150 ${
        active
          ? "bg-[var(--color-gt-accent)]/12 text-[var(--color-gt-accent)]"
          : "text-[var(--color-gt-untyped)] hover:text-[var(--color-gt-text)] active:scale-[0.98]"
      } hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-40`}
    >
      {active && (
        <div className="absolute bottom-0 left-1/2 h-[2px] w-3/4 -translate-x-1/2 rounded-full bg-gradient-to-r from-[var(--color-gt-accent)] to-[var(--color-gt-accent2)]" />
      )}
      {children}
    </button>
  );
}

function ToggleChip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-3 py-1 text-[12px] font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] ${
        active
          ? "bg-[var(--color-gt-accent)]/15 text-[var(--color-gt-accent)] ring-1 ring-[var(--color-gt-accent)]/25"
          : "bg-[var(--color-gt-sub)]/60 text-[var(--color-gt-untyped)] hover:text-[var(--color-gt-text)]"
      } disabled:pointer-events-none disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

function DurationBtn({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[36px] rounded-lg px-2.5 py-1 text-[13px] font-semibold tabular-nums transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] ${
        active
          ? "bg-[var(--color-gt-accent)]/12 text-[var(--color-gt-accent)] ring-1 ring-[var(--color-gt-accent)]/20"
          : "text-[var(--color-gt-untyped)] hover:text-[var(--color-gt-text)]"
      } disabled:pointer-events-none disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

export function ConfigBar({ config, disabled, setConfig, onOpenLanguage }: ConfigBarProps) {
  const timeDurations: TimeDuration[] = [15, 30, 60, 120];
  const wordCounts: WordCount[] = [10, 25, 50, 100];

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Row 1: Mode selector (segmented control) */}
      <div className="flex w-fit items-center gap-0.5 overflow-x-auto rounded-xl border border-[var(--color-gt-untyped)]/8 bg-[var(--color-gt-sub)]/50 p-1 backdrop-blur-sm">
        <SegmentBtn
          active={config.mode === "time"}
          disabled={disabled}
          onClick={() => setConfig({ mode: "time" as TestMode })}
        >
          <span className="inline-flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5" />
            time
          </span>
        </SegmentBtn>
        <SegmentBtn
          active={config.mode === "words"}
          disabled={disabled}
          onClick={() => setConfig({ mode: "words" as TestMode })}
        >
          <span className="inline-flex items-center gap-1.5">
            <Type className="h-3.5 w-3.5" />
            words
          </span>
        </SegmentBtn>
        <SegmentBtn
          active={config.mode === "quote"}
          disabled={disabled}
          onClick={() => setConfig({ mode: "quote" as TestMode })}
        >
          <span className="inline-flex items-center gap-1.5">
            <Quote className="h-3.5 w-3.5" />
            quote
          </span>
        </SegmentBtn>
        <SegmentBtn
          active={config.mode === "zen"}
          disabled={disabled}
          onClick={() => setConfig({ mode: "zen" as TestMode })}
        >
          <span className="inline-flex items-center gap-1.5">
            <Brain className="h-3.5 w-3.5" />
            zen
          </span>
        </SegmentBtn>
        <SegmentBtn
          active={config.mode === "custom"}
          disabled={disabled}
          onClick={() =>
            setConfig({
              mode: "custom" as TestMode,
              customText:
                config.customText && config.customText.trim().length > 0
                  ? config.customText
                  : "custom typing mode lets you practice your own text",
            })
          }
        >
          <span className="inline-flex items-center gap-1.5">
            <Wrench className="h-3.5 w-3.5" />
            custom
          </span>
        </SegmentBtn>
      </div>

      {/* Row 2: Toggle chips + duration/count buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <ToggleChip
          active={config.punctuation}
          disabled={disabled}
          onClick={() => setConfig({ punctuation: !config.punctuation })}
        >
          @ punctuation
        </ToggleChip>
        <ToggleChip
          active={config.numbers}
          disabled={disabled}
          onClick={() => setConfig({ numbers: !config.numbers })}
        >
          # numbers
        </ToggleChip>

        {(config.mode === "time" || config.mode === "words") && (
          <>
            <div className="mx-1 h-4 w-px bg-[var(--color-gt-untyped)]/15" />
            {config.mode === "time"
              ? timeDurations.map((d) => (
                  <DurationBtn
                    key={d}
                    active={config.timeDuration === d}
                    disabled={disabled}
                    onClick={() => setConfig({ timeDuration: d })}
                  >
                    {d}
                  </DurationBtn>
                ))
              : wordCounts.map((w) => (
                  <DurationBtn
                    key={w}
                    active={config.wordCount === w}
                    disabled={disabled}
                    onClick={() => setConfig({ wordCount: w })}
                  >
                    {w}
                  </DurationBtn>
                ))}
          </>
        )}
      </div>

      {/* Row 3: Language pill */}
      <button
        disabled={disabled}
        onClick={onOpenLanguage}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-sub)]/40 px-3 py-1 text-[11px] font-medium text-[var(--color-gt-untyped)] transition-all hover:border-[var(--color-gt-accent)]/20 hover:text-[var(--color-gt-accent)] disabled:pointer-events-none disabled:opacity-40"
      >
        <Globe className="h-3 w-3" />
        {config.languageCode || "english"}
      </button>

      {config.mode === "custom" && (
        <textarea
          disabled={disabled}
          value={config.customText ?? ""}
          onChange={(e) => setConfig({ customText: e.target.value })}
          placeholder="Type or paste custom text..."
          className="w-full max-w-2xl rounded-xl border border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-sub)]/50 px-4 py-3 text-sm text-[var(--color-gt-text)] outline-none placeholder:text-[var(--color-gt-untyped)] focus:border-[var(--color-gt-accent)]/20"
          rows={3}
        />
      )}
    </div>
  );
}
