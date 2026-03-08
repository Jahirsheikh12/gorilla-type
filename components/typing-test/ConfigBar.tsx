"use client";

import { useMemo } from "react";
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
  tooltip,
  children,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  tooltip?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-150 ${
        active
          ? "bg-[var(--color-gt-accent)]/12 text-[var(--color-gt-accent)]"
          : "text-[var(--color-gt-untyped)] hover:text-[var(--color-gt-text)] active:scale-[0.98]"
      } hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-40`}
    >
      {active && (
        <div className="absolute bottom-0 left-1/2 h-[2px] w-3/4 -translate-x-1/2 rounded-full bg-gradient-to-r from-[var(--color-gt-accent)] to-[var(--color-gt-accent2)]" />
      )}
      {children}
      {tooltip && (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-[var(--color-gt-untyped)]/15 bg-[var(--color-gt-bg)] px-2.5 py-1.5 text-[11px] font-normal text-[var(--color-gt-text)] opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
          {tooltip}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[var(--color-gt-bg)]" />
        </div>
      )}
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

const MODE_TOOLTIPS: Record<TestMode, string> = {
  time: "Type for a set duration",
  words: "Type a set number of words",
  quote: "Type a quote",
  zen: "Just type \u2014 no timer, no word count",
  custom: "Practice your own text",
};

export function ConfigBar({ config, disabled, setConfig, onOpenLanguage }: ConfigBarProps) {
  const timeDurations: TimeDuration[] = [15, 30, 60, 120];
  const wordCounts: WordCount[] = [10, 25, 50, 100];

  const customWordCount = useMemo(() => {
    const text = (config.customText ?? "").trim();
    if (!text) return 0;
    return text.split(/\s+/).length;
  }, [config.customText]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Row 1: Mode selector (segmented control) */}
      <div className="flex w-fit items-center gap-0.5 rounded-xl border border-[var(--color-gt-untyped)]/8 bg-[var(--color-gt-sub)]/50 p-1 backdrop-blur-sm">
        <SegmentBtn
          active={config.mode === "time"}
          disabled={disabled}
          onClick={() => setConfig({ mode: "time" as TestMode })}
          tooltip={MODE_TOOLTIPS.time}
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
          tooltip={MODE_TOOLTIPS.words}
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
          tooltip={MODE_TOOLTIPS.quote}
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
          tooltip={MODE_TOOLTIPS.zen}
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
          tooltip={MODE_TOOLTIPS.custom}
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
        <div className="w-full max-w-2xl">
          <textarea
            disabled={disabled}
            value={config.customText ?? ""}
            onChange={(e) => setConfig({ customText: e.target.value })}
            placeholder="Type or paste custom text..."
            className="w-full rounded-xl border border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-sub)]/50 px-4 py-3 text-sm text-[var(--color-gt-text)] outline-none placeholder:text-[var(--color-gt-untyped)] focus:border-[var(--color-gt-accent)]/20"
            rows={3}
          />
          <div className="mt-1.5 flex items-center justify-between px-1">
            <span className="text-[11px] text-[var(--color-gt-untyped)]">
              {customWordCount} {customWordCount === 1 ? "word" : "words"}
            </span>
            {customWordCount > 0 && customWordCount < 3 && (
              <span className="text-[11px] font-medium text-amber-400">
                Text is too short — add at least 3 words
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
