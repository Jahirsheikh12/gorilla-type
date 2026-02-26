"use client";

import { useThemeContext } from "@/hooks/useTheme";
import { Check, ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

interface ThemeSelectorProps {
  onBack: () => void;
}

export function ThemeSelector({ onBack }: ThemeSelectorProps) {
  const { theme: currentTheme, setThemeById, allThemes } = useThemeContext();

  return (
    <div className="results-animate flex h-[80vh] max-h-[750px] flex-col overflow-hidden rounded-3xl border border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-sub)] gt-power-bar">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--color-gt-untyped)]/10 px-6 py-4">
        <button
          onClick={onBack}
          className="rounded-xl p-1.5 text-[var(--color-gt-untyped)] transition-colors hover:text-[var(--color-gt-text)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="font-heading text-base font-bold text-[var(--color-gt-text)]">Themes</h2>
        <span className="rounded-full bg-[var(--color-gt-accent)]/10 px-2 py-0.5 text-[11px] font-medium text-[var(--color-gt-accent)]">
          {allThemes.length}
        </span>
      </div>

      {/* Theme grid - 4 columns on desktop */}
      <div className="gt-scroll flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {allThemes.map((t) => {
            const isActive = t.id === currentTheme.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setThemeById(t.id);
                  void apiFetch("/api/settings", {
                    method: "PUT",
                    body: JSON.stringify({ patch: { selectedThemeId: t.id } }),
                  });
                }}
                className={`group relative overflow-hidden rounded-2xl border p-3 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
                  isActive
                    ? "border-[var(--color-gt-accent)]/40 ring-1 ring-[var(--color-gt-accent)]/20"
                    : "border-[var(--color-gt-untyped)]/10 hover:border-[var(--color-gt-untyped)]/25"
                }`}
                style={{ background: t.bg }}
              >
                {/* Active checkmark badge with gradient */}
                {isActive && (
                  <div
                    className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
                    }}
                  >
                    <Check className="h-3 w-3" style={{ color: t.bg }} />
                  </div>
                )}

                {/* Theme name */}
                <div className="mb-2 text-xs font-semibold" style={{ color: t.accent }}>
                  {t.name}
                </div>

                {/* Mini typing preview */}
                <div className="mb-2 font-mono text-[11px] leading-relaxed" style={{ color: t.untyped }}>
                  <span style={{ color: t.text }}>the quick </span>
                  <span style={{ color: t.error }}>b</span>
                  <span style={{ color: t.text }}>rown fox</span>
                </div>

                {/* Gradient accent bar showing both accent colors */}
                <div
                  className="mt-1 h-1 w-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${t.accent}, ${t.accent2})`,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
