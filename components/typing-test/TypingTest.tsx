"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { signOut, useSession } from "next-auth/react";
import { ThemeContext, useThemeContext, useThemeProvider } from "@/hooks/useTheme";
import { useTypingTest } from "@/hooks/useTypingTest";
import { usePlatformBootstrap } from "@/hooks/usePlatformBootstrap";
import { useApiQuery } from "@/hooks/useApiQuery";
import type { NotificationDTO, UserSettings } from "@/lib/types";
import { Sidebar, MobileSidebar, MobileMenuButton, type NavAction } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { TypingTestViewRouter } from "./TypingTestViewRouter";
import { TypingTestModals } from "./TypingTestModals";
import { useTypingKeyFeedback } from "./useTypingKeyFeedback";
import { useTypingTestLifecycle } from "./useTypingTestLifecycle";
import type { ActiveModal, ActiveView } from "./types";
import { executeTypingCommand, type TypingCommandId } from "./command-executor";

const FLIPPED_THEME_STYLE: CSSProperties = {
  ["--color-gt-bg" as string]: "var(--color-gt-text-base)",
  ["--color-gt-sub" as string]:
    "color-mix(in srgb, var(--color-gt-text-base) 90%, black 10%)",
  ["--color-gt-text" as string]: "var(--color-gt-bg-base)",
  ["--color-gt-untyped" as string]:
    "color-mix(in srgb, var(--color-gt-bg-base) 55%, transparent)",
  ["--background" as string]: "var(--color-gt-text-base)",
  ["--foreground" as string]: "var(--color-gt-bg-base)",
};

function TypingTestInner() {
  const { setThemeById } = useThemeContext();
  const { data: session } = useSession();
  const { state, handleKeyDown, setConfig, restart, setFocus } = useTypingTest();
  const { languageCode, setLanguageCode, settings, setSettings } = usePlatformBootstrap(
    session?.user?.authId
  );
  const [view, setView] = useState<ActiveView>("test");
  const [modal, setModal] = useState<ActiveModal>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notificationsQuery = useApiQuery<NotificationDTO[]>(
    "/api/notifications?limit=20",
    [],
    session?.user?.authId ? 15000 : undefined,
    !!session?.user?.authId
  );
  const notifications = notificationsQuery.data;
  const { handleTypingKeyDown, pressedCodes } = useTypingKeyFeedback({
    settings,
    state,
    handleKeyDown,
  });
  const { handleShare } = useTypingTestLifecycle({
    state,
    setConfig,
    languageCode,
    settings,
    setThemeById,
  });

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.readAt).length,
    [notifications]
  );

  const closeModal = useCallback(() => setModal(null), []);
  const goToTest = useCallback(() => setView("test"), []);
  const applySettingsPatch = useCallback((patch: Partial<UserSettings>) => {
    setSettings((previous) => ({ ...previous, ...patch }));
    if (patch.selectedLanguageCode) {
      setLanguageCode(patch.selectedLanguageCode);
      setConfig({ languageCode: patch.selectedLanguageCode });
    }
  }, [setConfig, setLanguageCode, setSettings]);

  const handleNavigate = useCallback((action: NavAction) => {
    setModal(null);

    switch (action) {
      case "command-line":
        if (view !== "test") {
          setView("test");
        } else {
          setModal("command-line");
        }
        break;
      case "notifications":
        setModal("notifications");
        break;
      case "login":
        if (session?.user?.authId) {
          void signOut();
        } else {
          setModal("login");
        }
        break;
      case "language":
        setModal("language");
        break;
      case "settings":
        setView("settings");
        break;
      case "themes":
        setView("themes");
        break;
      case "leaderboard":
        setView("leaderboard");
        break;
      case "profile":
        setView("profile");
        break;
      case "about":
        setView("about");
        break;
    }
  }, [session?.user?.authId, view]);

  const handleBottomNav = useCallback((viewName: string) => {
    setView(viewName as ActiveView);
  }, []);

  const openLanguage = useCallback(() => {
    setModal("language");
  }, []);

  const handleCommand = useCallback(
    (command: TypingCommandId) => {
      executeTypingCommand(command, {
        restart,
        setView,
        setModal,
        setConfig,
        setThemeById,
        punctuationEnabled: state.config.punctuation,
        numbersEnabled: state.config.numbers,
      });
    },
    [restart, setConfig, setThemeById, state.config.numbers, state.config.punctuation]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "p"
      ) {
        e.preventDefault();
        setModal((m) => (m === "command-line" ? null : "command-line"));
        return;
      }

      const target = e.target as HTMLElement | null;
      const editingField =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (editingField || modal !== null || view !== "test") {
        return;
      }

      if (e.key === "Tab" && settings.quickRestart === "tab") {
        e.preventDefault();
        restart();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [modal, restart, settings.quickRestart, view]);

  return (
    <div
      className="relative z-10 flex min-h-screen"
      style={settings.flipColors ? FLIPPED_THEME_STYLE : undefined}
    >
      <Sidebar
        onNavigate={handleNavigate}
        activeView={view}
        hasNotifications={unreadCount > 0}
        isAuthenticated={!!session?.user?.authId}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />

      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={handleNavigate}
        activeView={view}
        hasNotifications={unreadCount > 0}
        isAuthenticated={!!session?.user?.authId}
      />

      <MobileMenuButton onClick={() => setMobileMenuOpen(true)} />

      <main
        className={`flex flex-1 flex-col items-center justify-center px-6 pb-16 transition-all duration-300 sm:px-8 lg:px-10 md:pb-0 ${
          sidebarCollapsed ? "md:ml-16" : "md:ml-60"
        }`}
      >
        <TypingTestViewRouter
          view={view}
          state={state}
          settings={settings}
          restart={restart}
          setConfig={setConfig}
          setFocus={setFocus}
          onTypingKeyDown={handleTypingKeyDown}
          pressedKeyCodes={pressedCodes}
          onShare={handleShare}
          onGoToTest={goToTest}
          onSetView={setView}
          onOpenLanguage={openLanguage}
          onSettingsChange={applySettingsPatch}
          isAuthenticated={!!session?.user?.authId}
        />
      </main>

      <BottomNav activeView={view} onNavigate={handleBottomNav} />
      <TypingTestModals
        modal={modal}
        onClose={closeModal}
        onCommand={handleCommand}
        languageCode={languageCode}
        onSelectLanguage={(code) => {
          setLanguageCode(code);
          setConfig({ languageCode: code });
        }}
      />
    </div>
  );
}

export function TypingTest() {
  const themeCtx = useThemeProvider();

  return (
    <ThemeContext.Provider value={themeCtx}>
      <TypingTestInner />
    </ThemeContext.Provider>
  );
}
