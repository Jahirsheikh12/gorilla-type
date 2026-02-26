"use client";

import { Keyboard, Crown, Palette, Settings, User } from "lucide-react";

interface BottomNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

function BottomNavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center justify-center gap-1 py-1.5 transition-colors ${
        active
          ? "text-[var(--color-gt-accent)]"
          : "text-[var(--color-gt-untyped)]"
      }`}
      aria-label={label}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

export function BottomNav({ activeView, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center border-t border-[var(--color-gt-untyped)]/8 bg-[var(--color-gt-bg)]/95 backdrop-blur-sm md:hidden">
      <BottomNavItem
        icon={<Keyboard className="h-5 w-5" />}
        label="Type"
        active={activeView === "test"}
        onClick={() => onNavigate("test")}
      />
      <BottomNavItem
        icon={<Crown className="h-5 w-5" />}
        label="Ranks"
        active={activeView === "leaderboard"}
        onClick={() => onNavigate("leaderboard")}
      />
      <BottomNavItem
        icon={<Palette className="h-5 w-5" />}
        label="Theme"
        active={activeView === "themes"}
        onClick={() => onNavigate("themes")}
      />
      <BottomNavItem
        icon={<Settings className="h-5 w-5" />}
        label="Settings"
        active={activeView === "settings"}
        onClick={() => onNavigate("settings")}
      />
      <BottomNavItem
        icon={<User className="h-5 w-5" />}
        label="Profile"
        active={activeView === "profile"}
        onClick={() => onNavigate("profile")}
      />
    </nav>
  );
}
