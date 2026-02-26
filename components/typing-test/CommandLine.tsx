"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Search,
  Timer,
  Type,
  Globe,
  Palette,
  Settings,
  RotateCcw,
  User,
  Crown,
  Info,
  Moon,
  Sun,
  Hash,
  AtSign,
} from "lucide-react";
import type { TypingCommandId } from "./command-executor";

interface CommandLineProps {
  open: boolean;
  onClose: () => void;
  onCommand: (command: TypingCommandId) => void;
}

interface Command {
  id: TypingCommandId;
  icon: React.ReactNode;
  label: string;
  category: string;
}

const COMMANDS: Command[] = [
  { id: "restart", icon: <RotateCcw className="h-4 w-4" />, label: "Restart test", category: "Test" },
  { id: "mode-time", icon: <Timer className="h-4 w-4" />, label: "Set mode: time", category: "Test" },
  { id: "mode-words", icon: <Type className="h-4 w-4" />, label: "Set mode: words", category: "Test" },
  { id: "mode-quote", icon: <Type className="h-4 w-4" />, label: "Set mode: quote", category: "Test" },
  { id: "mode-zen", icon: <Moon className="h-4 w-4" />, label: "Set mode: zen", category: "Test" },
  { id: "mode-custom", icon: <Type className="h-4 w-4" />, label: "Set mode: custom", category: "Test" },
  { id: "toggle-punctuation", icon: <AtSign className="h-4 w-4" />, label: "Toggle punctuation", category: "Test" },
  { id: "toggle-numbers", icon: <Hash className="h-4 w-4" />, label: "Toggle numbers", category: "Test" },
  { id: "time-15", icon: <Timer className="h-4 w-4" />, label: "Set time: 15 seconds", category: "Test" },
  { id: "time-30", icon: <Timer className="h-4 w-4" />, label: "Set time: 30 seconds", category: "Test" },
  { id: "time-60", icon: <Timer className="h-4 w-4" />, label: "Set time: 60 seconds", category: "Test" },
  { id: "time-120", icon: <Timer className="h-4 w-4" />, label: "Set time: 120 seconds", category: "Test" },
  { id: "open-settings", icon: <Settings className="h-4 w-4" />, label: "Open settings", category: "Navigation" },
  { id: "open-themes", icon: <Palette className="h-4 w-4" />, label: "Change theme", category: "Navigation" },
  { id: "open-language", icon: <Globe className="h-4 w-4" />, label: "Change language", category: "Navigation" },
  { id: "open-leaderboard", icon: <Crown className="h-4 w-4" />, label: "Open leaderboard", category: "Navigation" },
  { id: "open-profile", icon: <User className="h-4 w-4" />, label: "Open profile", category: "Navigation" },
  { id: "open-about", icon: <Info className="h-4 w-4" />, label: "About Gorilla Type", category: "Navigation" },
  { id: "toggle-dark", icon: <Moon className="h-4 w-4" />, label: "Toggle dark mode", category: "Appearance" },
  { id: "toggle-light", icon: <Sun className="h-4 w-4" />, label: "Switch to light mode", category: "Appearance" },
];

export function CommandLine({ open, onClose, onCommand }: CommandLineProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        onCommand(filtered[selectedIndex].id);
        onClose();
      }
    },
    [filtered, selectedIndex, onClose, onCommand]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div
        className="absolute inset-0 bg-[var(--color-gt-bg)]/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="cmd-animate relative w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-sub)] shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-[var(--color-gt-untyped)]/10 px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-[var(--color-gt-untyped)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="w-full bg-transparent text-sm text-[var(--color-gt-text)] placeholder:text-[var(--color-gt-untyped)] focus:outline-none"
          />
          <kbd className="shrink-0 rounded border border-[var(--color-gt-untyped)]/20 bg-[var(--color-gt-bg)] px-1.5 py-0.5 text-[10px] text-[var(--color-gt-untyped)]">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div className="gt-scroll max-h-[300px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-[var(--color-gt-untyped)]">
              No commands found
            </div>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                onClick={() => {
                  onCommand(cmd.id);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  i === selectedIndex
                    ? "bg-[var(--color-gt-accent)]/10 text-[var(--color-gt-accent)]"
                    : "text-[var(--color-gt-text)] hover:bg-[var(--color-gt-bg)]/50"
                }`}
              >
                <span className={i === selectedIndex ? "text-[var(--color-gt-accent)]" : "text-[var(--color-gt-untyped)]"}>
                  {cmd.icon}
                </span>
                <span className="flex-1">{cmd.label}</span>
                <span className="text-[10px] text-[var(--color-gt-untyped)]">
                  {cmd.category}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
