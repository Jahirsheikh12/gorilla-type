"use client";

import { Github, Mail, Heart, Code2 } from "lucide-react";

interface FooterProps {
  hideKeyboardShortcuts?: boolean;
}

export function Footer({ hideKeyboardShortcuts = false }: FooterProps) {
  return (
    <footer className="relative z-10">
      {/* Separator */}
      <div className="mx-6 h-px bg-[var(--color-gt-untyped)]/10 sm:mx-8 lg:mx-10" />

      <div className="flex items-center justify-between px-6 py-4 sm:px-8 lg:px-10">
        {/* Left: Keyboard shortcuts */}
        <div className="flex items-center gap-4 text-[11px] text-[var(--color-gt-untyped)]">
          {!hideKeyboardShortcuts && (
            <>
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded border border-[var(--color-gt-untyped)]/20 bg-[var(--color-gt-sub)] px-1.5 py-0.5 font-mono text-[10px]">
              tab
            </kbd>
            <span className="ml-0.5">- restart test</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded border border-[var(--color-gt-untyped)]/20 bg-[var(--color-gt-sub)] px-1.5 py-0.5 font-mono text-[10px]">
              ctrl+shift+p
            </kbd>
            <span className="ml-0.5">- command palette</span>
          </span>
            </>
          )}
        </div>

        {/* Right: Links */}
        <div className="flex items-center gap-3 text-[var(--color-gt-untyped)]">
          <button
            aria-label="Contact"
            className="p-1 transition-colors hover:text-[var(--color-gt-text)]"
          >
            <Mail className="h-3.5 w-3.5" />
          </button>
          <button
            aria-label="Support"
            className="p-1 transition-colors hover:text-[var(--color-gt-error)]"
          >
            <Heart className="h-3.5 w-3.5" />
          </button>
          <button
            aria-label="GitHub"
            className="p-1 transition-colors hover:text-[var(--color-gt-text)]"
          >
            <Github className="h-3.5 w-3.5" />
          </button>
          <button
            aria-label="Source Code"
            className="p-1 transition-colors hover:text-[var(--color-gt-text)]"
          >
            <Code2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
