"use client";

import type { TestStats } from "@/lib/typing-engine";
import type { WpmSample } from "@/lib/typing-engine";
import { useRef, useEffect, useState, useCallback } from "react";
import {
  RotateCcw,
  Share2,
  Camera,
  Copy,
  Check,
  Twitter,
  Link2,
} from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { useLocalHistory } from "@/hooks/useLocalHistory";
import { useThemeContext } from "@/hooks/useTheme";

interface ResultsProps {
  stats: TestStats;
  wpmHistory: WpmSample[];
  restart: () => void;
  onShare?: () => void | Promise<void>;
  showAverages?: boolean;
  mode?: string;
  modeKey?: string;
}

/* ------------------------------------------------------------------ */
/*  WPM Chart                                                          */
/* ------------------------------------------------------------------ */

function WpmChart({ wpmHistory }: { wpmHistory: WpmSample[] }) {
  if (wpmHistory.length < 2) return null;

  const width = 720;
  const height = 200;
  const padding = { top: 20, right: 24, bottom: 32, left: 44 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxWpm = Math.max(
    ...wpmHistory.map((s) => Math.max(s.wpm, s.raw)),
    10,
  );
  const maxTime = wpmHistory[wpmHistory.length - 1].second;

  const scaleX = (s: number) => padding.left + (s / maxTime) * chartW;
  const scaleY = (v: number) => padding.top + chartH - (v / maxWpm) * chartH;

  const toPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  };

  const wpmPoints = wpmHistory.map((s) => ({
    x: scaleX(s.second),
    y: scaleY(s.wpm),
  }));
  const rawPoints = wpmHistory.map((s) => ({
    x: scaleX(s.second),
    y: scaleY(s.raw),
  }));

  const wpmPath = toPath(wpmPoints);
  const rawPath = toPath(rawPoints);

  const areaPath =
    wpmPath +
    ` L ${wpmPoints[wpmPoints.length - 1].x} ${padding.top + chartH}` +
    ` L ${wpmPoints[0].x} ${padding.top + chartH} Z`;

  const yTicks = Array.from({ length: 5 }, (_, i) =>
    Math.round((maxWpm / 4) * i),
  );

  const pathLength = wpmHistory.length * 30;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor="var(--color-gt-accent)"
            stopOpacity="0.12"
          />
          <stop
            offset="100%"
            stopColor="var(--color-gt-accent)"
            stopOpacity="0"
          />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-gt-accent)" />
          <stop offset="100%" stopColor="var(--color-gt-accent2)" />
        </linearGradient>
      </defs>

      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={padding.left}
            y1={scaleY(v)}
            x2={width - padding.right}
            y2={scaleY(v)}
            stroke="var(--color-gt-untyped)"
            strokeWidth={0.4}
            strokeDasharray="3 6"
            opacity={0.25}
          />
          <text
            x={padding.left - 8}
            y={scaleY(v) + 3}
            textAnchor="end"
            fill="var(--color-gt-untyped)"
            fontSize={9}
            fontFamily="var(--font-mono)"
          >
            {v}
          </text>
        </g>
      ))}

      <text
        x={width / 2}
        y={height - 4}
        textAnchor="middle"
        fill="var(--color-gt-untyped)"
        fontSize={9}
        fontFamily="var(--font-mono)"
        opacity={0.6}
      >
        seconds
      </text>

      <path d={areaPath} fill="url(#areaGrad)" />

      <path
        d={rawPath}
        fill="none"
        stroke="var(--color-gt-untyped)"
        strokeWidth={1.5}
        strokeDasharray="4 4"
        opacity={0.35}
      />

      <path
        d={wpmPath}
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth={2.5}
        strokeLinecap="round"
        className="draw-line"
        style={{ "--path-length": pathLength } as React.CSSProperties}
      />

      {wpmHistory.map(
        (s) =>
          s.errors > 0 && (
            <circle
              key={`err-${s.second}`}
              cx={scaleX(s.second)}
              cy={padding.top + chartH + 8}
              r={Math.min(s.errors, 3.5)}
              fill="var(--color-gt-error)"
              opacity={0.5}
            />
          ),
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Bento Card                                                         */
/* ------------------------------------------------------------------ */

function BentoCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`bento-animate rounded-2xl border border-[var(--color-gt-untyped)]/8 bg-[var(--color-gt-sub)]/40 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Share toast                                                        */
/* ------------------------------------------------------------------ */

function ShareToast({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-2 rounded-xl bg-[var(--color-gt-sub)] px-4 py-2.5 text-sm font-medium text-[var(--color-gt-text)] shadow-lg ring-1 ring-[var(--color-gt-accent)]/20">
        <Check className="h-4 w-4 text-[var(--color-gt-accent)]" />
        {message}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Results Component                                                  */
/* ------------------------------------------------------------------ */

export function Results({
  stats,
  wpmHistory,
  restart,
  onShare,
  showAverages = true,
  mode = "",
  modeKey = "",
}: ResultsProps) {
  const screenshotRef = useRef<HTMLDivElement | null>(null);
  const { theme } = useThemeContext();
  const { addResult, totalTests, averageWpm, bestWpm } = useLocalHistory();
  const savedRef = useRef(false);
  const [toast, setToast] = useState<string | null>(null);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    addResult({
      wpm: stats.wpm,
      rawWpm: stats.rawWpm,
      accuracy: stats.accuracy,
      consistency: stats.consistency,
      mode,
      modeKey,
      elapsedSeconds: stats.elapsedSeconds,
      timestamp: Date.now(),
    });
  }, [stats, mode, modeKey, addResult]);

  useEffect(() => {
    if (!shareMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(e.target as Node)
      ) {
        setShareMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [shareMenuOpen]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  /* ---- Screenshot: compact dedicated card ---- */
  const downloadScreenshot = useCallback(async () => {
    if (!screenshotRef.current) return;
    const mod = await import("html-to-image");
    const dataUrl = await mod.toPng(screenshotRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: theme.bg,
    });
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = `gorilla-type-${stats.wpm}wpm-${Date.now()}.png`;
    anchor.click();
    showToast("Screenshot saved!");
  }, [theme, stats.wpm, showToast]);

  const copyResultText = useCallback(async () => {
    const text = [
      `${stats.wpm} WPM | ${stats.accuracy}% accuracy`,
      `Raw: ${stats.rawWpm} | Consistency: ${stats.consistency}%`,
      `Characters: ${stats.correctChars}/${stats.incorrectChars}/${stats.extraChars}/${stats.missedChars}`,
      `Time: ${stats.elapsedSeconds}s`,
      ``,
      `gorillatype.com`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      showToast("Result copied to clipboard!");
    } catch {
      window.prompt("Copy your result:", text);
    }
    setShareMenuOpen(false);
  }, [stats, showToast]);

  const handleShareLink = useCallback(async () => {
    try {
      await onShare?.();
      showToast("Share link copied to clipboard!");
    } catch {
      showToast("Sign in to share a link");
    }
    setShareMenuOpen(false);
  }, [onShare, showToast]);

  const shareToTwitter = useCallback(() => {
    const text = encodeURIComponent(
      `I just typed ${stats.wpm} WPM with ${stats.accuracy}% accuracy on Gorilla Type!\n\ngorillatype.com`,
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}`,
      "_blank",
      "noopener,noreferrer,width=550,height=420",
    );
    setShareMenuOpen(false);
  }, [stats.wpm, stats.accuracy]);

  const webShare = useCallback(async () => {
    if (!navigator.share) {
      await copyResultText();
      return;
    }
    try {
      await navigator.share({
        title: `Gorilla Type - ${stats.wpm} WPM`,
        text: `I typed ${stats.wpm} WPM with ${stats.accuracy}% accuracy on Gorilla Type!`,
        url: "https://gorillatype.com",
      });
    } catch {
      // User cancelled
    }
    setShareMenuOpen(false);
  }, [stats.wpm, stats.accuracy, copyResultText]);

  return (
    <>
      <ShareToast message={toast ?? ""} visible={toast !== null} />

      {/* ============================================================
          Hidden screenshot card — compact, self-contained, properly
          sized with inline styles so html-to-image renders it right.
          ============================================================ */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <div
          ref={screenshotRef}
          style={{
            width: "540px",
            padding: "36px",
            borderRadius: "20px",
            background: `linear-gradient(165deg, ${theme.sub} 0%, ${theme.bg} 100%)`,
            border: `1px solid ${theme.untyped}22`,
            fontFamily:
              "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif",
            color: theme.text,
          }}
        >
          {/* Brand header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: `${theme.accent}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: theme.accent,
                }}
              >
                G
              </div>
              <span style={{ fontSize: "14px", fontWeight: 700 }}>
                <span style={{ color: theme.accent }}>gorilla</span>
                <span style={{ color: theme.text }}>type</span>
              </span>
            </div>
            <span
              style={{
                fontSize: "11px",
                fontFamily: "'JetBrains Mono', monospace",
                color: theme.untyped,
              }}
            >
              {modeKey} &bull; {new Date().toLocaleDateString()}
            </span>
          </div>

          {/* Main stats row */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            {/* WPM */}
            <div
              style={{
                flex: 1,
                padding: "20px",
                borderRadius: "14px",
                background: `${theme.bg}cc`,
                border: `1px solid ${theme.untyped}15`,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: theme.untyped,
                  marginBottom: "4px",
                }}
              >
                WPM
              </div>
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: 800,
                  lineHeight: 1,
                  color: theme.accent,
                }}
              >
                {stats.wpm}
              </div>
            </div>
            {/* Accuracy */}
            <div
              style={{
                flex: 1,
                padding: "20px",
                borderRadius: "14px",
                background: `${theme.bg}cc`,
                border: `1px solid ${theme.untyped}15`,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: theme.untyped,
                  marginBottom: "4px",
                }}
              >
                ACCURACY
              </div>
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: 800,
                  lineHeight: 1,
                  color: theme.accent2,
                }}
              >
                {stats.accuracy}%
              </div>
            </div>
          </div>

          {/* Secondary stats row */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            {[
              { label: "RAW", value: `${stats.rawWpm}` },
              { label: "CONSISTENCY", value: `${stats.consistency}%` },
              { label: "CHARS", value: `${stats.correctChars}/${stats.incorrectChars}/${stats.extraChars}/${stats.missedChars}` },
              { label: "TIME", value: `${stats.elapsedSeconds}s` },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: "10px",
                  background: `${theme.bg}88`,
                  border: `1px solid ${theme.untyped}10`,
                }}
              >
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    color: theme.untyped,
                    marginBottom: "3px",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: theme.text,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "14px",
              borderTop: `1px solid ${theme.untyped}15`,
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: theme.untyped,
                letterSpacing: "0.02em",
              }}
            >
              gorillatype.com
            </span>
            {/* Gradient bar */}
            <div
              style={{
                width: "60px",
                height: "3px",
                borderRadius: "2px",
                background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ============================================================
          Visible Results UI (bento grid)
          ============================================================ */}
      <div className="w-full">
        {/* Bento Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <BentoCard
            className="col-span-1 flex flex-col items-center justify-center p-6 lg:col-span-2 lg:row-span-2 lg:p-8"
            delay={0}
          >
            <div className="text-[10px] font-semibold tracking-widest text-[var(--color-gt-untyped)] uppercase">
              wpm
            </div>
            <AnimatedCounter
              value={stats.wpm}
              className="font-heading text-5xl font-bold tabular-nums leading-none text-[var(--color-gt-accent)] text-glow-accent lg:text-7xl"
            />
          </BentoCard>

          <BentoCard
            className="col-span-1 flex flex-col items-center justify-center p-6 lg:col-span-2 lg:row-span-2 lg:p-8"
            delay={80}
          >
            <div className="text-[10px] font-semibold tracking-widest text-[var(--color-gt-untyped)] uppercase">
              accuracy
            </div>
            <AnimatedCounter
              value={stats.accuracy}
              suffix="%"
              className="font-heading text-5xl font-bold tabular-nums leading-none text-[var(--color-gt-accent2)] text-glow-accent2 lg:text-7xl"
            />
          </BentoCard>

          <BentoCard className="px-4 py-3" delay={160}>
            <div className="text-[10px] font-medium tracking-widest text-[var(--color-gt-untyped)] uppercase">
              raw
            </div>
            <div className="mt-1 font-mono text-xl font-bold tabular-nums text-[var(--color-gt-text)]">
              {stats.rawWpm}
            </div>
          </BentoCard>

          {showAverages && (
            <BentoCard className="px-4 py-3" delay={240}>
              <div className="text-[10px] font-medium tracking-widest text-[var(--color-gt-untyped)] uppercase">
                consistency
              </div>
              <div className="mt-1 font-mono text-xl font-bold tabular-nums text-[var(--color-gt-text)]">
                {stats.consistency}%
              </div>
            </BentoCard>
          )}

          <BentoCard className="px-4 py-3" delay={320}>
            <div className="text-[10px] font-medium tracking-widest text-[var(--color-gt-untyped)] uppercase">
              characters
            </div>
            <div className="mt-1 font-mono text-base font-semibold tabular-nums">
              <span className="text-[var(--color-gt-text)]">
                {stats.correctChars}
              </span>
              <span className="text-[var(--color-gt-untyped)]">/</span>
              <span className="text-[var(--color-gt-error)]">
                {stats.incorrectChars}
              </span>
              <span className="text-[var(--color-gt-untyped)]">/</span>
              <span className="text-[var(--color-gt-extra)]">
                {stats.extraChars}
              </span>
              <span className="text-[var(--color-gt-untyped)]">/</span>
              <span className="text-[var(--color-gt-untyped)]">
                {stats.missedChars}
              </span>
            </div>
            <div className="mt-1.5 flex gap-1 text-[9px] font-medium tracking-wide">
              <span className="text-[var(--color-gt-text)]">correct</span>
              <span className="text-[var(--color-gt-untyped)]">/</span>
              <span className="text-[var(--color-gt-error)]">incorrect</span>
              <span className="text-[var(--color-gt-untyped)]">/</span>
              <span className="text-[var(--color-gt-extra)]">extra</span>
              <span className="text-[var(--color-gt-untyped)]">/</span>
              <span className="text-[var(--color-gt-untyped)]">missed</span>
            </div>
          </BentoCard>

          <BentoCard className="px-4 py-3" delay={400}>
            <div className="text-[10px] font-medium tracking-widest text-[var(--color-gt-untyped)] uppercase">
              time
            </div>
            <div className="mt-1 font-mono text-xl font-bold tabular-nums text-[var(--color-gt-text)]">
              {stats.elapsedSeconds}s
            </div>
          </BentoCard>

          <BentoCard
            className="relative col-span-2 p-3 lg:col-span-4"
            delay={480}
          >
            <div className="absolute top-3 right-4 flex items-center gap-3 text-[9px] font-medium tracking-wide">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-[2px] w-4 rounded-full bg-gradient-to-r from-[var(--color-gt-accent)] to-[var(--color-gt-accent2)]" />
                <span className="text-[var(--color-gt-untyped)]">wpm</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-[2px] w-4 border-t-[1.5px] border-dashed border-[var(--color-gt-untyped)] opacity-50" />
                <span className="text-[var(--color-gt-untyped)]">raw</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-[6px] w-[6px] rounded-full bg-[var(--color-gt-error)] opacity-60" />
                <span className="text-[var(--color-gt-untyped)]">errors</span>
              </span>
            </div>
            <WpmChart wpmHistory={wpmHistory} />
          </BentoCard>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={restart}
          className="group flex items-center gap-2 rounded-xl border border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-sub)]/40 px-5 py-2.5 text-[13px] font-medium text-[var(--color-gt-untyped)] transition-all duration-200 hover:scale-[1.02] hover:border-[var(--color-gt-accent)]/25 hover:text-[var(--color-gt-accent)]"
        >
          <RotateCcw className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-180" />
          next test
        </button>

        {/* Share dropdown */}
        <div className="relative" ref={shareMenuRef}>
          <button
            onClick={() => setShareMenuOpen((prev) => !prev)}
            className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-[13px] font-medium transition-all duration-200 hover:scale-[1.02] ${
              shareMenuOpen
                ? "border-[var(--color-gt-accent2)]/30 bg-[var(--color-gt-accent2)]/10 text-[var(--color-gt-accent2)]"
                : "border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-sub)]/40 text-[var(--color-gt-untyped)] hover:border-[var(--color-gt-accent2)]/25 hover:text-[var(--color-gt-accent2)]"
            }`}
          >
            <Share2 className="h-4 w-4" />
            share
          </button>

          {shareMenuOpen && (
            <div className="absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-1 duration-150">
              <div className="flex flex-col gap-0.5 rounded-xl border border-[var(--color-gt-untyped)]/12 bg-[var(--color-gt-sub)] p-1.5 shadow-xl min-w-[180px]">
                <button
                  onClick={() => {
                    void handleShareLink();
                  }}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[var(--color-gt-text)] transition-colors hover:bg-[var(--color-gt-bg)]/60"
                >
                  <Link2 className="h-4 w-4 text-[var(--color-gt-accent)]" />
                  Copy share link
                </button>
                <button
                  onClick={() => {
                    void copyResultText();
                  }}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[var(--color-gt-text)] transition-colors hover:bg-[var(--color-gt-bg)]/60"
                >
                  <Copy className="h-4 w-4 text-[var(--color-gt-untyped)]" />
                  Copy as text
                </button>
                <button
                  onClick={shareToTwitter}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[var(--color-gt-text)] transition-colors hover:bg-[var(--color-gt-bg)]/60"
                >
                  <Twitter className="h-4 w-4 text-[#1DA1F2]" />
                  Share on X
                </button>
                {typeof navigator !== "undefined" && "share" in navigator && (
                  <button
                    onClick={() => {
                      void webShare();
                    }}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[var(--color-gt-text)] transition-colors hover:bg-[var(--color-gt-bg)]/60"
                  >
                    <Share2 className="h-4 w-4 text-[var(--color-gt-accent2)]" />
                    More options...
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            void downloadScreenshot();
          }}
          className="flex items-center gap-2 rounded-xl border border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-sub)]/40 px-5 py-2.5 text-[13px] font-medium text-[var(--color-gt-untyped)] transition-all duration-200 hover:scale-[1.02] hover:border-[var(--color-gt-text)]/15 hover:text-[var(--color-gt-text)]"
        >
          <Camera className="h-4 w-4" />
          screenshot
        </button>
      </div>

      <div className="mt-3 text-center text-[11px] text-[var(--color-gt-untyped)] opacity-50">
        press{" "}
        <kbd className="rounded border border-[var(--color-gt-untyped)]/15 bg-[var(--color-gt-sub)]/60 px-1.5 py-0.5 font-mono text-[10px]">
          tab
        </kbd>{" "}
        or click to start next test
      </div>

      {totalTests > 0 && (
        <div className="mt-4 flex items-center justify-center gap-6 text-[12px] text-[var(--color-gt-untyped)]">
          <span>
            <span className="font-medium text-[var(--color-gt-text)]">
              {totalTests}
            </span>{" "}
            {totalTests === 1 ? "test" : "tests"} taken
          </span>
          <span>
            avg{" "}
            <span className="font-mono font-medium text-[var(--color-gt-text)]">
              {averageWpm}
            </span>{" "}
            wpm
          </span>
          <span>
            best{" "}
            <span className="font-mono font-medium text-[var(--color-gt-accent)]">
              {bestWpm}
            </span>{" "}
            wpm
          </span>
        </div>
      )}
    </>
  );
}
