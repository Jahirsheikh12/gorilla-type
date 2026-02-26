"use client";

import { Keyboard, Github, Heart, Globe, Zap, Shield, Palette } from "lucide-react";

interface AboutPanelProps {
  onClose?: () => void;
}

export function AboutPanel({ onClose }: AboutPanelProps) {
  void onClose;
  return (
    <div className="results-animate overflow-hidden rounded-2xl border border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-sub)]">
      <div className="gt-scroll max-h-[75vh] overflow-y-auto p-8">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-gt-accent)]/10">
            <Keyboard className="h-8 w-8 text-[var(--color-gt-accent)]" />
          </div>
          <h2 className="text-2xl font-bold">
            <span className="text-[var(--color-gt-accent)]">gorilla</span>
            <span className="text-[var(--color-gt-text)]">type</span>
          </h2>
          <p className="mt-1 text-sm text-[var(--color-gt-untyped)]">v1.0.0</p>
        </div>

        {/* Description */}
        <p className="mx-auto mb-8 max-w-md text-center text-sm leading-relaxed text-[var(--color-gt-text)]/70">
          A minimalist, customizable typing test built for speed demons and keyboard enthusiasts.
          Test your typing speed, track your progress, and compete on the leaderboard.
        </p>

        {/* Features */}
        <div className="mb-8 grid grid-cols-2 gap-3">
          {[
            { icon: <Zap className="h-4 w-4" />, title: "Real-time stats", desc: "Live WPM, accuracy, and consistency tracking" },
            { icon: <Palette className="h-4 w-4" />, title: "18+ themes", desc: "Beautiful color schemes to match your vibe" },
            { icon: <Globe className="h-4 w-4" />, title: "24+ languages", desc: "Practice typing in your preferred language" },
            { icon: <Shield className="h-4 w-4" />, title: "Privacy first", desc: "No tracking, no ads, just typing" },
          ].map((feature) => (
            <div key={feature.title} className="rounded-xl border border-[var(--color-gt-untyped)]/8 bg-[var(--color-gt-bg)]/50 p-4">
              <div className="mb-2 text-[var(--color-gt-accent)]">{feature.icon}</div>
              <div className="text-sm font-medium text-[var(--color-gt-text)]">{feature.title}</div>
              <div className="mt-0.5 text-xs text-[var(--color-gt-untyped)]">{feature.desc}</div>
            </div>
          ))}
        </div>

        {/* Credits */}
        <div className="mb-6 text-center">
          <h3 className="mb-2 text-xs font-semibold tracking-widest text-[var(--color-gt-untyped)] uppercase">
            Built with
          </h3>
          <div className="flex items-center justify-center gap-3 text-xs text-[var(--color-gt-untyped)]">
            <span>Next.js</span>
            <span className="opacity-30">|</span>
            <span>React</span>
            <span className="opacity-30">|</span>
            <span>Tailwind CSS</span>
            <span className="opacity-30">|</span>
            <span>TypeScript</span>
          </div>
        </div>

        {/* Links */}
        <div className="flex justify-center gap-3">
          <button className="flex items-center gap-1.5 rounded-lg border border-[var(--color-gt-untyped)]/12 px-4 py-2 text-xs text-[var(--color-gt-untyped)] transition-colors hover:border-[var(--color-gt-untyped)]/25 hover:text-[var(--color-gt-text)]">
            <Github className="h-3.5 w-3.5" />
            GitHub
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-[var(--color-gt-untyped)]/12 px-4 py-2 text-xs text-[var(--color-gt-untyped)] transition-colors hover:border-[var(--color-gt-error)]/25 hover:text-[var(--color-gt-error)]">
            <Heart className="h-3.5 w-3.5" />
            Support
          </button>
        </div>
      </div>
    </div>
  );
}
