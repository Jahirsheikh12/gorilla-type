"use client";

import type React from "react";
import type { TestConfig, TypingState } from "@/hooks/useTypingTest";
import type { UserSettings } from "@/lib/types";
import { ConfigBar } from "./ConfigBar";
import { LiveStats } from "./LiveStats";
import { WordsDisplay } from "./WordsDisplay";
import { Results } from "./Results";
import { SettingsPanel } from "./SettingsPanel";
import { ThemeSelector } from "./ThemeSelector";
import { LeaderboardPanel } from "./LeaderboardPanel";
import { ProfilePanel } from "./ProfilePanel";
import { AboutPanel } from "./AboutPanel";
import { TypingKeyboard } from "./TypingKeyboard";
import type { ActiveView } from "./types";

interface TypingTestViewRouterProps {
  view: ActiveView;
  state: TypingState;
  settings: UserSettings;
  restart: () => void;
  setConfig: (payload: Partial<TestConfig>) => void;
  setFocus: (focused: boolean) => void;
  onTypingKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  pressedKeyCodes: ReadonlySet<string>;
  onShare: () => Promise<void>;
  onGoToTest: () => void;
  onSetView: (view: ActiveView) => void;
  onOpenLanguage: () => void;
  onSettingsChange: (patch: Partial<UserSettings>) => void;
  isAuthenticated: boolean;
}

export function TypingTestViewRouter({
  view,
  state,
  settings,
  restart,
  setConfig,
  setFocus,
  onTypingKeyDown,
  pressedKeyCodes,
  onShare,
  onGoToTest,
  onSetView,
  onOpenLanguage,
  onSettingsChange,
  isAuthenticated,
}: TypingTestViewRouterProps) {
  if (view === "test") {
    return (
      <div className="view-animate w-full max-w-[1000px]">
        {state.phase === "finished" && state.stats ? (
          <Results
            stats={state.stats}
            wpmHistory={state.wpmHistory}
            restart={restart}
            onShare={onShare}
            showAverages={settings.showAvg}
          />
        ) : (
          <div className="w-full">
            <ConfigBar
              config={state.config}
              disabled={state.phase === "running"}
              setConfig={setConfig}
              onOpenLanguage={onOpenLanguage}
            />
            <div className="mt-8">
              <LiveStats
                state={state}
                showLiveWpm={settings.liveWpm}
                showLiveAcc={settings.liveAcc}
                showLiveBurst={settings.liveBurst}
                timerProgress={settings.timerProgress}
              />
              <WordsDisplay
                state={state}
                handleKeyDown={onTypingKeyDown}
                setFocus={setFocus}
                hideCapsLockWarning={
                  settings.hideCapsLockWarning || !settings.capsWarning
                }
                hideExtraLetters={settings.hideExtraLetters}
                indicateTypos={settings.indicateTypos}
                showOof={settings.showOof}
                fontSize={settings.fontSize}
                showAllLines={settings.showAllLines}
                colorfulMode={settings.colorfulMode}
                caretStyle={settings.caretStyle}
                smoothCaret={settings.smoothCaret}
              />
              {settings.keyTips && (
                <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-gt-untyped/60">
                  <span className="inline-flex items-center gap-1.5">
                    <kbd className="rounded border border-gt-untyped/15 bg-gt-sub/50 px-1.5 py-0.5 font-mono text-[10px]">
                      tab
                    </kbd>
                    restart
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <kbd className="rounded border border-gt-untyped/15 bg-gt-sub/50 px-1.5 py-0.5 font-mono text-[10px]">
                      ctrl+shift+p
                    </kbd>
                    command palette
                  </span>
                </div>
              )}
              <TypingKeyboard
                pressedCodes={pressedKeyCodes}
                capsLockOn={state.capsLock}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === "settings") {
    return (
      <SettingsPanel
        onClose={onGoToTest}
        onOpenThemes={() => onSetView("themes")}
        settings={settings}
        onSettingsChange={onSettingsChange}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  if (view === "themes") {
    return (
      <div className="view-animate w-full max-w-5xl">
        <ThemeSelector onBack={onGoToTest} />
      </div>
    );
  }

  if (view === "leaderboard") {
    return (
      <div className="view-animate w-full max-w-4xl">
        <LeaderboardPanel
          onClose={onGoToTest}
          mode={state.config.mode === "words" ? "words" : "time"}
          languageCode={state.config.languageCode}
        />
      </div>
    );
  }

  if (view === "profile") {
    return (
      <div className="view-animate w-full max-w-4xl">
        <ProfilePanel onClose={onGoToTest} />
      </div>
    );
  }

  return (
    <div className="view-animate w-full max-w-lg">
      <AboutPanel onClose={onGoToTest} />
    </div>
  );
}
