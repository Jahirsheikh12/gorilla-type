"use client";

import type { TestStats } from "@/lib/typing-engine";
import type { WpmSample } from "@/lib/typing-engine";
import { useRef } from "react";
import { RotateCcw, Share2, Camera } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";

interface ResultsProps {
  stats: TestStats;
  wpmHistory: WpmSample[];
  restart: () => void;
  onShare?: () => void | Promise<void>;
  showAverages?: boolean;
}

function WpmChart({ wpmHistory }: { wpmHistory: WpmSample[] }) {
  if (wpmHistory.length < 2) return null;

  const width = 720;
  const height = 200;
  const padding = { top: 20, right: 24, bottom: 32, left: 44 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxWpm = Math.max(...wpmHistory.map((s) => Math.max(s.wpm, s.raw)), 10);
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

  const wpmPoints = wpmHistory.map((s) => ({ x: scaleX(s.second), y: scaleY(s.wpm) }));
  const rawPoints = wpmHistory.map((s) => ({ x: scaleX(s.second), y: scaleY(s.raw) }));

  const wpmPath = toPath(wpmPoints);
  const rawPath = toPath(rawPoints);

  const areaPath =
    wpmPath +
    ` L ${wpmPoints[wpmPoints.length - 1].x} ${padding.top + chartH}` +
    ` L ${wpmPoints[0].x} ${padding.top + chartH} Z`;

  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((maxWpm / 4) * i));

  // Calculate approximate path length for line draw animation
  const pathLength = wpmHistory.length * 30;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-gt-accent)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--color-gt-accent)" stopOpacity="0" />
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
          )
      )}
    </svg>
  );
}

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

export function Results({
  stats,
  wpmHistory,
  restart,
  onShare,
  showAverages = true,
}: ResultsProps) {
  const screenshotRef = useRef<HTMLDivElement | null>(null);

  const downloadScreenshot = async () => {
    if (!screenshotRef.current) return;
    const mod = await import("html-to-image");
    const dataUrl = await mod.toPng(screenshotRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "var(--color-gt-bg)",
    });
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = `gorilla-type-${stats.wpm}wpm-${Date.now()}.png`;
    anchor.click();
  };

  return (
    <div ref={screenshotRef} className="w-full">
      {/* Bento Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* WPM Hero - 2x1 on mobile, 2x2 on desktop */}
        <BentoCard className="col-span-1 flex flex-col items-center justify-center p-6 lg:col-span-2 lg:row-span-2 lg:p-8" delay={0}>
          <div className="text-[10px] font-semibold tracking-widest text-[var(--color-gt-untyped)] uppercase">
            wpm
          </div>
          <AnimatedCounter
            value={stats.wpm}
            className="font-heading text-5xl font-bold tabular-nums leading-none text-[var(--color-gt-accent)] text-glow-accent lg:text-7xl"
          />
        </BentoCard>

        {/* ACC Hero - 2x1 on mobile, 2x2 on desktop */}
        <BentoCard className="col-span-1 flex flex-col items-center justify-center p-6 lg:col-span-2 lg:row-span-2 lg:p-8" delay={80}>
          <div className="text-[10px] font-semibold tracking-widest text-[var(--color-gt-untyped)] uppercase">
            accuracy
          </div>
          <AnimatedCounter
            value={stats.accuracy}
            suffix="%"
            className="font-heading text-5xl font-bold tabular-nums leading-none text-[var(--color-gt-accent2)] text-glow-accent2 lg:text-7xl"
          />
        </BentoCard>

        {/* Small stat cards */}
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
            <span className="text-[var(--color-gt-text)]">{stats.correctChars}</span>
            <span className="text-[var(--color-gt-untyped)]">/</span>
            <span className="text-[var(--color-gt-error)]">{stats.incorrectChars}</span>
            <span className="text-[var(--color-gt-untyped)]">/</span>
            <span className="text-[var(--color-gt-extra)]">{stats.extraChars}</span>
            <span className="text-[var(--color-gt-untyped)]">/</span>
            <span className="text-[var(--color-gt-untyped)]">{stats.missedChars}</span>
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

        {/* Chart card - full width */}
        <BentoCard className="col-span-2 p-3 lg:col-span-4" delay={480}>
          <WpmChart wpmHistory={wpmHistory} />
        </BentoCard>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={restart}
          className="group flex items-center gap-2 rounded-xl border border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-sub)]/40 px-5 py-2.5 text-[13px] font-medium text-[var(--color-gt-untyped)] transition-all duration-200 hover:scale-[1.02] hover:border-[var(--color-gt-accent)]/25 hover:text-[var(--color-gt-accent)]"
        >
          <RotateCcw className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-180" />
          next test
        </button>
        <button
          onClick={() => {
            void onShare?.();
          }}
          className="flex items-center gap-2 rounded-xl border border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-sub)]/40 px-5 py-2.5 text-[13px] font-medium text-[var(--color-gt-untyped)] transition-all duration-200 hover:scale-[1.02] hover:border-[var(--color-gt-accent2)]/25 hover:text-[var(--color-gt-accent2)]"
        >
          <Share2 className="h-4 w-4" />
          share
        </button>
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
    </div>
  );
}
