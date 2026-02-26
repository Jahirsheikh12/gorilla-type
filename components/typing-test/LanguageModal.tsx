"use client";

import { useState } from "react";
import { Globe, Search, Check } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiFetch } from "@/lib/api-client";

interface LanguageModalProps {
  onClose: () => void;
  onSelect?: (languageCode: string) => void;
  selectedLanguageCode?: string;
}

interface LanguageOption {
  code: string;
  name: string;
  variant?: string;
}

export function LanguageModal({
  onClose,
  onSelect,
  selectedLanguageCode = "en",
}: LanguageModalProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(selectedLanguageCode);
  const { data: options } = useApiQuery<LanguageOption[]>("/api/languages", []);

  const filtered = options.filter((language) =>
    `${language.name} ${language.variant ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header info */}
      <div className="flex items-center gap-2 text-[var(--color-gt-untyped)]">
        <Globe className="h-4 w-4 text-[var(--color-gt-accent)]" />
        <span className="text-xs">
          {options.length} languages available
        </span>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2.5 rounded-xl border border-[var(--color-gt-untyped)]/15 bg-[var(--color-gt-bg)] px-3 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-[var(--color-gt-untyped)]" />
        <input
          type="text"
          placeholder="Search languages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          className="w-full bg-transparent text-sm text-[var(--color-gt-text)] placeholder:text-[var(--color-gt-untyped)] focus:outline-none"
        />
      </div>

      {/* Language grid */}
      <div className="gt-scroll max-h-[350px] overflow-y-auto">
        <div className="grid grid-cols-2 gap-1.5">
          {filtered.map((language) => {
            const label = language.variant || language.name;
            const isActive = language.code === selected;
            return (
              <button
                key={language.code}
                onClick={() => {
                  setSelected(language.code);
                }}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                  isActive
                    ? "border-[var(--color-gt-accent)]/30 bg-[var(--color-gt-accent)]/10 text-[var(--color-gt-accent)]"
                    : "border-[var(--color-gt-untyped)]/8 bg-[var(--color-gt-bg)]/50 text-[var(--color-gt-untyped)] hover:border-[var(--color-gt-untyped)]/20 hover:text-[var(--color-gt-text)]"
                }`}
              >
                <span>{label}</span>
                {isActive && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-8 text-center text-sm text-[var(--color-gt-untyped)]">
            No languages match &ldquo;{search}&rdquo;
          </div>
        )}
      </div>

      {/* Apply button */}
      <button
        onClick={() => {
          void apiFetch("/api/languages/select", {
            method: "POST",
            body: JSON.stringify({ languageCode: selected }),
          });
          onSelect?.(selected);
          onClose();
        }}
        className="flex w-full items-center justify-center rounded-xl bg-[var(--color-gt-accent)] py-2.5 text-sm font-semibold text-[var(--color-gt-bg)] transition-opacity hover:opacity-90"
      >
        Apply
      </button>
    </div>
  );
}
