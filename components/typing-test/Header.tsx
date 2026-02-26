"use client";

import {
  Keyboard,
  Bell,
  Crown,
  Settings,
  User,
  Terminal,
  Info,
  Palette,
  LogIn,
} from "lucide-react";

export type NavAction =
  | "command-line"
  | "about"
  | "settings"
  | "themes"
  | "notifications"
  | "leaderboard"
  | "profile"
  | "login";

interface HeaderProps {
  onNavigate: (action: NavAction) => void;
  hasNotifications?: boolean;
  isAuthenticated?: boolean;
}

function NavIcon({
  children,
  label,
  onClick,
  badge,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: boolean;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="relative rounded-lg p-2 text-[var(--color-gt-untyped)] transition-colors duration-150 hover:text-[var(--color-gt-text)]"
    >
      {children}
      {badge && (
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[var(--color-gt-accent)]" />
      )}
    </button>
  );
}

export function Header({ onNavigate, hasNotifications, isAuthenticated }: HeaderProps) {
  return (
    <header className="relative z-10">
      <div className="flex items-center justify-between px-6 pt-5 pb-3 sm:px-8 lg:px-10">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-gt-accent)]/10">
            <Keyboard className="h-[18px] w-[18px] text-[var(--color-gt-accent)]" strokeWidth={2.5} />
          </div>
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-[var(--color-gt-accent)]">gorilla</span>
            <span className="text-[var(--color-gt-text)]">type</span>
          </h1>
        </div>

        {/* Center nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          <NavIcon label="Command line (Ctrl+Shift+P)" onClick={() => onNavigate("command-line")}>
            <Terminal className="h-[18px] w-[18px]" />
          </NavIcon>
          <NavIcon label="Themes" onClick={() => onNavigate("themes")}>
            <Palette className="h-[18px] w-[18px]" />
          </NavIcon>
          <NavIcon label="About" onClick={() => onNavigate("about")}>
            <Info className="h-[18px] w-[18px]" />
          </NavIcon>
          <NavIcon label="Settings" onClick={() => onNavigate("settings")}>
            <Settings className="h-[18px] w-[18px]" />
          </NavIcon>
        </nav>

        {/* Right nav */}
        <nav className="flex items-center gap-0.5">
          <NavIcon label="Notifications" onClick={() => onNavigate("notifications")} badge={hasNotifications}>
            <Bell className="h-[18px] w-[18px]" />
          </NavIcon>
          <NavIcon label="Leaderboard" onClick={() => onNavigate("leaderboard")}>
            <Crown className="h-[18px] w-[18px]" />
          </NavIcon>
          <NavIcon label="Profile" onClick={() => onNavigate("profile")}>
            <User className="h-[18px] w-[18px]" />
          </NavIcon>

          {/* Login button */}
          <button
            onClick={() => onNavigate("login")}
            className="ml-2 flex items-center gap-1.5 rounded-lg border border-[var(--color-gt-accent)]/20 bg-[var(--color-gt-accent)]/10 px-3 py-1.5 text-xs font-medium text-[var(--color-gt-accent)] transition-all hover:border-[var(--color-gt-accent)]/40 hover:bg-[var(--color-gt-accent)]/15"
          >
            <LogIn className="h-3.5 w-3.5" />
            {isAuthenticated ? "sign out" : "sign in"}
          </button>
        </nav>
      </div>

      {/* Separator */}
      <div className="mx-6 h-px bg-[var(--color-gt-untyped)]/10 sm:mx-8 lg:mx-10" />
    </header>
  );
}
