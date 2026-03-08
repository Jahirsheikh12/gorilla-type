"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import {
  Settings,
  Keyboard,
  Volume2,
  Minus,
  Eye,
  Palette,
  Globe,
  AlertTriangle,
  ChevronRight,
  Monitor,
  Search,
  X,
} from "lucide-react";
import { useThemeContext } from "@/hooks/useTheme";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiFetch } from "@/lib/api-client";
import { DEFAULT_SETTINGS, type UserSettings } from "@/lib/types";

interface SettingsPanelProps {
  onClose: () => void;
  onOpenThemes: () => void;
  settings: UserSettings;
  onSettingsChange: (patch: Partial<UserSettings>) => void;
  isAuthenticated: boolean;
}

type SettingsCategory =
  | "behavior"
  | "input"
  | "sound"
  | "caret"
  | "appearance"
  | "theme"
  | "language"
  | "hide"
  | "danger";

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}

function Toggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="font-body text-sm text-[var(--color-gt-text)]">{label}</div>
        {description && (
          <div className="mt-0.5 font-body text-xs text-[var(--color-gt-untyped)]">{description}</div>
        )}
      </div>
      <button
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
          checked ? "bg-[var(--color-gt-accent)]" : "bg-[var(--color-gt-untyped)]/30"
        }`}
      >
        <div
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-5.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

interface SelectProps {
  label: string;
  description?: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}

function Select({ label, description, value, options, onChange }: SelectProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="font-body text-sm text-[var(--color-gt-text)]">{label}</div>
        {description && (
          <div className="mt-0.5 font-body text-xs text-[var(--color-gt-untyped)]">{description}</div>
        )}
      </div>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all hover:scale-[1.02] ${
              value === opt
                ? "bg-[var(--color-gt-accent)]/15 text-[var(--color-gt-accent)]"
                : "bg-[var(--color-gt-bg)] text-[var(--color-gt-untyped)] hover:text-[var(--color-gt-text)]"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

const CATEGORIES: { id: SettingsCategory; label: string; icon: React.ReactNode }[] = [
  { id: "behavior", label: "Behavior", icon: <Settings className="h-4 w-4" /> },
  { id: "input", label: "Input", icon: <Keyboard className="h-4 w-4" /> },
  { id: "sound", label: "Sound", icon: <Volume2 className="h-4 w-4" /> },
  { id: "caret", label: "Caret", icon: <Minus className="h-4 w-4" /> },
  { id: "appearance", label: "Appearance", icon: <Monitor className="h-4 w-4" /> },
  { id: "theme", label: "Theme", icon: <Palette className="h-4 w-4" /> },
  { id: "language", label: "Language", icon: <Globe className="h-4 w-4" /> },
  { id: "hide", label: "Hide elements", icon: <Eye className="h-4 w-4" /> },
  { id: "danger", label: "Danger zone", icon: <AlertTriangle className="h-4 w-4" /> },
];

export function SettingsPanel({
  onClose,
  onOpenThemes,
  settings,
  onSettingsChange,
  isAuthenticated,
}: SettingsPanelProps) {
  const [category, setCategory] = useState<SettingsCategory>("behavior");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useThemeContext();
  const languagesQuery = useApiQuery<Array<{ code: string; name: string; variant?: string }>>(
    "/api/languages",
    []
  );

  const persist = useCallback((patch: Partial<UserSettings>) => {
    onSettingsChange(patch);
    if (!isAuthenticated) return;
    void apiFetch("/api/settings", {
      method: "PUT",
      body: JSON.stringify({ patch }),
    });
  }, [isAuthenticated, onSettingsChange]);

  const toggle = (key: keyof UserSettings) => {
    persist({ [key]: !settings[key] } as Partial<UserSettings>);
  };

  const setValue = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    persist({ [key]: value } as Partial<UserSettings>);
  };

  type SearchableSetting = {
    label: string;
    description: string;
    category: string;
    render: () => React.ReactNode;
  };

  const searchableSettings: SearchableSetting[] = useMemo(() => [
    // Behavior
    { label: "Quick restart", description: "Press tab or esc to quickly restart the test", category: "Behavior", render: () => (
      <Select label="Quick restart" description="Press tab or esc to quickly restart the test" value={settings.quickRestart} options={["off", "tab", "esc"]} onChange={(v) => setValue("quickRestart", v as UserSettings["quickRestart"])} />
    )},
    { label: "Live WPM", description: "Show live WPM during the test", category: "Behavior", render: () => (
      <Toggle label="Live WPM" description="Show live WPM during the test" checked={settings.liveWpm} onChange={() => toggle("liveWpm")} />
    )},
    { label: "Live accuracy", description: "Show live accuracy during the test", category: "Behavior", render: () => (
      <Toggle label="Live accuracy" description="Show live accuracy during the test" checked={settings.liveAcc} onChange={() => toggle("liveAcc")} />
    )},
    { label: "Live burst", description: "Show live burst speed", category: "Behavior", render: () => (
      <Toggle label="Live burst" description="Show live burst speed" checked={settings.liveBurst} onChange={() => toggle("liveBurst")} />
    )},
    { label: "Key tips", description: "Show key tips below typing area", category: "Behavior", render: () => (
      <Toggle label="Key tips" description="Show key tips below typing area" checked={settings.keyTips} onChange={() => toggle("keyTips")} />
    )},
    { label: "Caps lock warning", description: "Show a warning when caps lock is on", category: "Behavior", render: () => (
      <Toggle label="Caps lock warning" description="Show a warning when caps lock is on" checked={settings.capsWarning} onChange={() => toggle("capsWarning")} />
    )},
    { label: "Show oof message", description: "Show out of focus message", category: "Behavior", render: () => (
      <Toggle label="Show oof message" description="Show out of focus message" checked={settings.showOof} onChange={() => toggle("showOof")} />
    )},
    { label: "Show averages", description: "Show average values in results", category: "Behavior", render: () => (
      <Toggle label="Show averages" description="Show average values in results" checked={settings.showAvg} onChange={() => toggle("showAvg")} />
    )},
    { label: "Lazy mode", description: "Accept lazy inputs", category: "Behavior", render: () => (
      <Toggle label="Lazy mode" description="Accept lazy inputs" checked={settings.lazyMode} onChange={() => toggle("lazyMode")} />
    )},
    // Input
    { label: "Freedom mode", description: "Allow going back to previous words", category: "Input", render: () => (
      <Toggle label="Freedom mode" description="Allow going back to previous words" checked={settings.freedomMode} onChange={() => toggle("freedomMode")} />
    )},
    { label: "Confidence mode", description: "Restrict backspace usage", category: "Input", render: () => (
      <Select label="Confidence mode" description="Restrict backspace usage" value={settings.confidenceMode} options={["off", "on", "max"]} onChange={(v) => setValue("confidenceMode", v as UserSettings["confidenceMode"])} />
    )},
    { label: "Indicate typos", description: "How to show incorrect characters", category: "Input", render: () => (
      <Select label="Indicate typos" description="How to show incorrect characters" value={settings.indicateTypos} options={["off", "below", "replace"]} onChange={(v) => setValue("indicateTypos", v as UserSettings["indicateTypos"])} />
    )},
    { label: "Strict space", description: "Pressing space at the beginning of a word will count as an error", category: "Input", render: () => (
      <Toggle label="Strict space" description="Pressing space at the beginning of a word will count as an error" checked={settings.strictSpace} onChange={() => toggle("strictSpace")} />
    )},
    { label: "Blind mode", description: "Hide character corrections", category: "Input", render: () => (
      <Toggle label="Blind mode" description="Hide character corrections" checked={settings.blindMode} onChange={() => toggle("blindMode")} />
    )},
    // Sound
    { label: "Click sound", description: "Play a sound on each keypress", category: "Sound", render: () => (
      <Toggle label="Click sound" description="Play a sound on each keypress" checked={settings.soundOnClick} onChange={() => toggle("soundOnClick")} />
    )},
    { label: "Error sound", description: "Play a sound on errors", category: "Sound", render: () => (
      <Toggle label="Error sound" description="Play a sound on errors" checked={settings.soundOnError} onChange={() => toggle("soundOnError")} />
    )},
    { label: "Volume", description: "Sound effect volume", category: "Sound", render: () => (
      <Select label="Volume" description="Sound effect volume" value={settings.soundVolume} options={["quiet", "medium", "loud"]} onChange={(v) => setValue("soundVolume", v as UserSettings["soundVolume"])} />
    )},
    // Caret
    { label: "Caret style", description: "The style of the typing caret", category: "Caret", render: () => (
      <Select label="Style" description="The style of the typing caret" value={settings.caretStyle} options={["off", "line", "block", "outline", "underline"]} onChange={(v) => setValue("caretStyle", v as UserSettings["caretStyle"])} />
    )},
    { label: "Caret smoothness", description: "How smooth the caret movement is", category: "Caret", render: () => (
      <Select label="Smoothness" description="How smooth the caret movement is" value={settings.smoothCaret} options={["off", "slow", "medium", "fast"]} onChange={(v) => setValue("smoothCaret", v as UserSettings["smoothCaret"])} />
    )},
    // Appearance
    { label: "Font size", description: "Size of the test text", category: "Appearance", render: () => (
      <Select label="Font size" description="Size of the test text" value={settings.fontSize} options={["small", "medium", "large", "xlarge"]} onChange={(v) => setValue("fontSize", v as UserSettings["fontSize"])} />
    )},
    { label: "Flip colors", description: "Swap text and background colors", category: "Appearance", render: () => (
      <Toggle label="Flip colors" description="Swap text and background colors" checked={settings.flipColors} onChange={() => toggle("flipColors")} />
    )},
    { label: "Colorful mode", description: "Color correct characters based on key position", category: "Appearance", render: () => (
      <Toggle label="Colorful mode" description="Color correct characters based on key position" checked={settings.colorfulMode} onChange={() => toggle("colorfulMode")} />
    )},
    { label: "Timer/progress", description: "How to display test progress", category: "Appearance", render: () => (
      <Select label="Timer/progress" description="How to display test progress" value={settings.timerProgress} options={["off", "bar", "text", "mini"]} onChange={(v) => setValue("timerProgress", v as UserSettings["timerProgress"])} />
    )},
    { label: "Show all lines", description: "Show all lines instead of scrolling", category: "Appearance", render: () => (
      <Toggle label="Show all lines" description="Show all lines instead of scrolling" checked={settings.showAllLines} onChange={() => toggle("showAllLines")} />
    )},
    // Hide elements
    { label: "Hide extra letters", description: "Don't show extra typed characters", category: "Hide elements", render: () => (
      <Toggle label="Hide extra letters" description="Don't show extra typed characters" checked={settings.hideExtraLetters} onChange={() => toggle("hideExtraLetters")} />
    )},
    { label: "Hide keyboard shortcuts", description: "Hide keyboard shortcut hints", category: "Hide elements", render: () => (
      <Toggle label="Hide keyboard shortcuts" description="Hide keyboard shortcut hints" checked={settings.hideKeyboardShortcuts} onChange={() => toggle("hideKeyboardShortcuts")} />
    )},
    { label: "Hide caps lock warning", description: "Don't show caps lock warning", category: "Hide elements", render: () => (
      <Toggle label="Hide caps lock warning" description="Don't show caps lock warning" checked={settings.hideCapsLockWarning} onChange={() => toggle("hideCapsLockWarning")} />
    )},
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [settings, toggle, setValue]);

  const filteredSettings = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return searchableSettings.filter(
      (s) => s.label.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
  }, [searchQuery, searchableSettings]);

  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Slide-out panel from right */}
      <div className="fixed top-0 right-0 z-50 flex h-screen w-full max-w-xl flex-col bg-[var(--color-gt-sub)] shadow-2xl slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-gt-untyped)]/10 px-6 py-4">
          <h2 className="font-heading text-lg font-bold text-[var(--color-gt-text)]">Settings</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--color-gt-untyped)] transition-colors hover:text-[var(--color-gt-text)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="border-b border-[var(--color-gt-untyped)]/10 px-6 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-gt-untyped)]" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings..."
              className="w-full rounded-xl border border-[var(--color-gt-untyped)]/15 bg-[var(--color-gt-bg)] py-2 pl-9 pr-9 font-body text-sm text-[var(--color-gt-text)] placeholder-[var(--color-gt-untyped)] outline-none transition-colors focus:border-[var(--color-gt-accent)]/40 focus:ring-1 focus:ring-[var(--color-gt-accent)]/20"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-[var(--color-gt-untyped)] transition-colors hover:text-[var(--color-gt-text)]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content area with sidebar categories */}
        <div className="flex flex-1 overflow-hidden">
          {isSearchActive ? (
            /* Search results view */
            <div className="gt-scroll flex-1 overflow-y-auto p-6">
              {filteredSettings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="mb-3 h-8 w-8 text-[var(--color-gt-untyped)]/30" />
                  <div className="font-body text-sm text-[var(--color-gt-untyped)]">
                    No settings found for &ldquo;{searchQuery}&rdquo;
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-3 font-body text-xs text-[var(--color-gt-untyped)]">
                    {filteredSettings.length} result{filteredSettings.length !== 1 ? "s" : ""}
                  </div>
                  <div className="divide-y divide-[var(--color-gt-untyped)]/10">
                    {filteredSettings.map((s, i) => (
                      <div key={i}>
                        <div className="pt-1 font-body text-[10px] font-medium uppercase tracking-wider text-[var(--color-gt-accent)]/60">
                          {s.category}
                        </div>
                        {s.render()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
          <>
          {/* Category sidebar */}
          <div className="gt-scroll w-48 shrink-0 overflow-y-auto border-r border-[var(--color-gt-untyped)]/10 p-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  if (cat.id === "theme") {
                    onOpenThemes();
                    onClose();
                  } else {
                    setCategory(cat.id);
                  }
                }}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] transition-all ${
                  category === cat.id
                    ? "bg-[var(--color-gt-accent)]/10 text-[var(--color-gt-accent)]"
                    : "text-[var(--color-gt-untyped)] hover:bg-[var(--color-gt-bg)]/50 hover:text-[var(--color-gt-text)]"
                }`}
              >
                {cat.icon}
                {cat.label}
                {cat.id === "theme" && <ChevronRight className="ml-auto h-3 w-3 opacity-50" />}
              </button>
            ))}
          </div>

          {/* Settings content */}
          <div className="gt-scroll flex-1 overflow-y-auto p-6">
            {category === "behavior" && (
              <div>
                <h3 className="mb-4 font-heading text-sm font-semibold text-[var(--color-gt-text)]">Behavior</h3>
                <div className="divide-y divide-[var(--color-gt-untyped)]/10">
                  <Select
                    label="Quick restart"
                    description="Press tab or esc to quickly restart the test"
                    value={settings.quickRestart}
                    options={["off", "tab", "esc"]}
                    onChange={(v) => setValue("quickRestart", v as UserSettings["quickRestart"])}
                  />
                  <Toggle label="Live WPM" description="Show live WPM during the test" checked={settings.liveWpm} onChange={() => toggle("liveWpm")} />
                  <Toggle label="Live accuracy" description="Show live accuracy during the test" checked={settings.liveAcc} onChange={() => toggle("liveAcc")} />
                  <Toggle label="Live burst" description="Show live burst speed" checked={settings.liveBurst} onChange={() => toggle("liveBurst")} />
                  <Toggle label="Key tips" description="Show key tips below typing area" checked={settings.keyTips} onChange={() => toggle("keyTips")} />
                  <Toggle label="Caps lock warning" description="Show a warning when caps lock is on" checked={settings.capsWarning} onChange={() => toggle("capsWarning")} />
                  <Toggle label="Show oof message" description="Show out of focus message" checked={settings.showOof} onChange={() => toggle("showOof")} />
                  <Toggle label="Show averages" description="Show average values in results" checked={settings.showAvg} onChange={() => toggle("showAvg")} />
                  <Toggle label="Lazy mode" description="Accept lazy inputs" checked={settings.lazyMode} onChange={() => toggle("lazyMode")} />
                </div>
              </div>
            )}

            {category === "input" && (
              <div>
                <h3 className="mb-4 font-heading text-sm font-semibold text-[var(--color-gt-text)]">Input</h3>
                <div className="divide-y divide-[var(--color-gt-untyped)]/10">
                  <Toggle label="Freedom mode" description="Allow going back to previous words" checked={settings.freedomMode} onChange={() => toggle("freedomMode")} />
                  <Select
                    label="Confidence mode"
                    description="Restrict backspace usage"
                    value={settings.confidenceMode}
                    options={["off", "on", "max"]}
                    onChange={(v) => setValue("confidenceMode", v as UserSettings["confidenceMode"])}
                  />
                  <Select
                    label="Indicate typos"
                    description="How to show incorrect characters"
                    value={settings.indicateTypos}
                    options={["off", "below", "replace"]}
                    onChange={(v) => setValue("indicateTypos", v as UserSettings["indicateTypos"])}
                  />
                  <Toggle label="Strict space" description="Pressing space at the beginning of a word will count as an error" checked={settings.strictSpace} onChange={() => toggle("strictSpace")} />
                  <Toggle label="Blind mode" description="Hide character corrections" checked={settings.blindMode} onChange={() => toggle("blindMode")} />
                </div>
              </div>
            )}

            {category === "sound" && (
              <div>
                <h3 className="mb-4 font-heading text-sm font-semibold text-[var(--color-gt-text)]">Sound</h3>
                <div className="divide-y divide-[var(--color-gt-untyped)]/10">
                  <Toggle label="Click sound" description="Play a sound on each keypress" checked={settings.soundOnClick} onChange={() => toggle("soundOnClick")} />
                  <Toggle label="Error sound" description="Play a sound on errors" checked={settings.soundOnError} onChange={() => toggle("soundOnError")} />
                  <Select
                    label="Volume"
                    description="Sound effect volume"
                    value={settings.soundVolume}
                    options={["quiet", "medium", "loud"]}
                    onChange={(v) => setValue("soundVolume", v as UserSettings["soundVolume"])}
                  />
                </div>
              </div>
            )}

            {category === "caret" && (
              <div>
                <h3 className="mb-4 font-heading text-sm font-semibold text-[var(--color-gt-text)]">Caret</h3>
                <div className="divide-y divide-[var(--color-gt-untyped)]/10">
                  <Select
                    label="Style"
                    description="The style of the typing caret"
                    value={settings.caretStyle}
                    options={["off", "line", "block", "outline", "underline"]}
                    onChange={(v) => setValue("caretStyle", v as UserSettings["caretStyle"])}
                  />
                  <Select
                    label="Smoothness"
                    description="How smooth the caret movement is"
                    value={settings.smoothCaret}
                    options={["off", "slow", "medium", "fast"]}
                    onChange={(v) => setValue("smoothCaret", v as UserSettings["smoothCaret"])}
                  />
                </div>
              </div>
            )}

            {category === "appearance" && (
              <div>
                <h3 className="mb-4 font-heading text-sm font-semibold text-[var(--color-gt-text)]">Appearance</h3>
                <div className="divide-y divide-[var(--color-gt-untyped)]/10">
                  <Select
                    label="Font size"
                    description="Size of the test text"
                    value={settings.fontSize}
                    options={["small", "medium", "large", "xlarge"]}
                    onChange={(v) => setValue("fontSize", v as UserSettings["fontSize"])}
                  />
                  <Toggle label="Flip colors" description="Swap text and background colors" checked={settings.flipColors} onChange={() => toggle("flipColors")} />
                  <Toggle label="Colorful mode" description="Color correct characters based on key position" checked={settings.colorfulMode} onChange={() => toggle("colorfulMode")} />
                  <Select
                    label="Timer/progress"
                    description="How to display test progress"
                    value={settings.timerProgress}
                    options={["off", "bar", "text", "mini"]}
                    onChange={(v) => setValue("timerProgress", v as UserSettings["timerProgress"])}
                  />
                  <Toggle label="Show all lines" description="Show all lines instead of scrolling" checked={settings.showAllLines} onChange={() => toggle("showAllLines")} />
                </div>
                {/* Current theme preview */}
                <div className="mt-6 rounded-2xl border border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-bg)] p-4">
                  <div className="mb-2 text-xs text-[var(--color-gt-untyped)]">Current theme</div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="h-6 w-6 rounded-lg" style={{ background: theme.accent }} />
                      <div className="h-6 w-6 rounded-lg" style={{ background: theme.accent2 }} />
                      <div className="h-6 w-6 rounded-lg" style={{ background: theme.text }} />
                      <div className="h-6 w-6 rounded-lg" style={{ background: theme.bg }} />
                    </div>
                    <span className="font-body text-sm text-[var(--color-gt-text)]">{theme.name}</span>
                    <button
                      onClick={() => { onOpenThemes(); onClose(); }}
                      className="ml-auto rounded-xl bg-[var(--color-gt-accent)]/10 px-3 py-1.5 text-xs font-medium text-[var(--color-gt-accent)] transition-colors hover:bg-[var(--color-gt-accent)]/20"
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>
            )}

            {category === "language" && (
              <div>
                <h3 className="mb-4 font-heading text-sm font-semibold text-[var(--color-gt-text)]">Language</h3>
                <div className="grid grid-cols-2 gap-2">
                  {languagesQuery.data.map((lang) => {
                    const label = lang.variant || lang.name;
                    const isActive = settings.selectedLanguageCode === lang.code;
                    return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setValue("selectedLanguageCode", lang.code);
                        void apiFetch("/api/languages/select", {
                          method: "POST",
                          body: JSON.stringify({ languageCode: lang.code }),
                        });
                      }}
                      className={`rounded-xl border px-3 py-2 text-left text-sm transition-all hover:scale-[1.01] ${
                        isActive
                          ? "border-[var(--color-gt-accent)]/30 bg-[var(--color-gt-accent)]/10 text-[var(--color-gt-accent)]"
                          : "border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-bg)] text-[var(--color-gt-untyped)] hover:border-[var(--color-gt-untyped)]/20 hover:text-[var(--color-gt-text)]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
                </div>
              </div>
            )}

            {category === "hide" && (
              <div>
                <h3 className="mb-4 font-heading text-sm font-semibold text-[var(--color-gt-text)]">Hide elements</h3>
                <div className="divide-y divide-[var(--color-gt-untyped)]/10">
                  <Toggle label="Hide extra letters" description="Don't show extra typed characters" checked={settings.hideExtraLetters} onChange={() => toggle("hideExtraLetters")} />
                  <Toggle label="Hide keyboard shortcuts" description="Hide keyboard shortcut hints" checked={settings.hideKeyboardShortcuts} onChange={() => toggle("hideKeyboardShortcuts")} />
                  <Toggle label="Hide caps lock warning" description="Don't show caps lock warning" checked={settings.hideCapsLockWarning} onChange={() => toggle("hideCapsLockWarning")} />
                </div>
              </div>
            )}

            {category === "danger" && (
              <div>
                <h3 className="mb-4 font-heading text-sm font-semibold text-[var(--color-gt-error)]">Danger zone</h3>
                <p className="mb-6 font-body text-sm text-[var(--color-gt-untyped)]">
                  These actions are irreversible. Please be careful.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        onSettingsChange(DEFAULT_SETTINGS);
                        return;
                      }
                      void apiFetch<UserSettings>("/api/danger/reset-settings", { method: "POST" }).then(
                        (next) => onSettingsChange(next)
                      );
                    }}
                    className="rounded-2xl border border-[var(--color-gt-error)]/20 bg-[var(--color-gt-error)]/5 px-4 py-3 text-left text-sm text-[var(--color-gt-error)] transition-colors hover:bg-[var(--color-gt-error)]/10"
                  >
                    <div className="font-medium">Reset all settings</div>
                    <div className="mt-0.5 text-xs opacity-70">Restore all settings to their default values</div>
                  </button>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) return;
                      void apiFetch("/api/danger/reset-pbs", { method: "POST" });
                    }}
                    className="rounded-2xl border border-[var(--color-gt-error)]/20 bg-[var(--color-gt-error)]/5 px-4 py-3 text-left text-sm text-[var(--color-gt-error)] transition-colors hover:bg-[var(--color-gt-error)]/10"
                  >
                    <div className="font-medium">Reset personal bests</div>
                    <div className="mt-0.5 text-xs opacity-70">Clear all your personal best records</div>
                  </button>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) return;
                      const confirmText = window.prompt(
                        'Type "DELETE" to confirm account deletion request.'
                      );
                      if (confirmText !== "DELETE") return;
                      void apiFetch("/api/danger/delete-account", {
                        method: "DELETE",
                        body: JSON.stringify({ confirmText }),
                      }).then(() => {
                        void signOut({ redirect: false });
                        onClose();
                      });
                    }}
                    className="rounded-2xl border border-[var(--color-gt-error)]/30 bg-[var(--color-gt-error)]/10 px-4 py-3 text-left text-sm text-[var(--color-gt-error)] transition-colors hover:bg-[var(--color-gt-error)]/20"
                  >
                    <div className="font-medium">Delete account</div>
                    <div className="mt-0.5 text-xs opacity-70">Schedule account deletion with a 7-day restore window</div>
                  </button>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) return;
                      void fetch("/api/danger/export-data")
                        .then((res) => res.blob())
                        .then((blob) => {
                          const url = URL.createObjectURL(blob);
                          const anchor = document.createElement("a");
                          anchor.href = url;
                          anchor.download = "gorilla-type-export.json";
                          anchor.click();
                          URL.revokeObjectURL(url);
                        });
                    }}
                    className="rounded-2xl border border-[var(--color-gt-untyped)]/20 bg-[var(--color-gt-bg)]/40 px-4 py-3 text-left text-sm text-[var(--color-gt-untyped)] transition-colors hover:text-[var(--color-gt-text)]"
                  >
                    <div className="font-medium">Export account data</div>
                    <div className="mt-0.5 text-xs opacity-70">Download all your stored data as JSON</div>
                  </button>
                </div>
              </div>
            )}
          </div>
          </>
          )}
        </div>
      </div>
    </>
  );
}
