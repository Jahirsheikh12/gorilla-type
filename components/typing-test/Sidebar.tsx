"use client";

import {
  Keyboard,
  Crown,
  BarChart3,
  Palette,
  Settings,
  Terminal,
  Globe,
  Info,
  Bell,
  User,
  LogIn,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

export type NavAction =
  | "command-line"
  | "about"
  | "settings"
  | "themes"
  | "notifications"
  | "leaderboard"
  | "profile"
  | "login"
  | "language";

interface SidebarProps {
  onNavigate: (action: NavAction) => void;
  activeView: string;
  hasNotifications?: boolean;
  isAuthenticated?: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  forceVisible?: boolean;
}

function SidebarItem({
  icon,
  label,
  active,
  collapsed,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed: boolean;
  badge?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150 ${
        active
          ? "bg-[var(--color-gt-accent)]/10 text-[var(--color-gt-accent)]"
          : "text-[var(--color-gt-untyped)] hover:bg-[var(--color-gt-sub)] hover:text-[var(--color-gt-text)]"
      } ${collapsed ? "justify-center px-0" : ""}`}
    >
      {active && (
        <div className="absolute top-1/2 left-0 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-[var(--color-gt-accent)]" />
      )}
      <span className="relative shrink-0">
        {icon}
        {badge && (
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[var(--color-gt-accent)]" />
        )}
      </span>
      {!collapsed && <span>{label}</span>}
    </button>
  );
}

export function Sidebar({
  onNavigate,
  activeView,
  hasNotifications,
  isAuthenticated,
  collapsed,
  onToggleCollapse,
  forceVisible = false,
}: SidebarProps) {
  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen flex-col border-r border-[var(--color-gt-untyped)]/8 bg-[var(--color-gt-bg)]/95 backdrop-blur-sm transition-all duration-300 ${
        forceVisible ? "flex" : "hidden md:flex"
      } ${collapsed ? "w-16" : "w-60"}`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 pt-5 pb-4 ${collapsed ? "justify-center px-2" : ""}`}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-gt-accent)]/10">
          <Keyboard className="h-[18px] w-[18px] text-[var(--color-gt-accent)]" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <h1 className="font-heading text-lg font-bold tracking-tight">
            <span className="text-[var(--color-gt-accent)]">gorilla</span>
            <span className="text-[var(--color-gt-text)]">type</span>
          </h1>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 ${collapsed ? "px-1.5" : "px-3"}`}>
        <div className={`mb-1 ${collapsed ? "hidden" : ""}`}>
          <span className="px-3 text-[10px] font-semibold tracking-widest text-[var(--color-gt-untyped)]/60 uppercase">
            Main
          </span>
        </div>
        <SidebarItem
          icon={<Keyboard className="h-[18px] w-[18px]" />}
          label="Type"
          active={activeView === "test"}
          collapsed={collapsed}
          onClick={() => onNavigate("command-line")}
        />
        <SidebarItem
          icon={<Crown className="h-[18px] w-[18px]" />}
          label="Leaderboard"
          active={activeView === "leaderboard"}
          collapsed={collapsed}
          onClick={() => onNavigate("leaderboard")}
        />
        <SidebarItem
          icon={<BarChart3 className="h-[18px] w-[18px]" />}
          label="Stats"
          active={activeView === "profile"}
          collapsed={collapsed}
          onClick={() => onNavigate("profile")}
        />

        <div className={`mb-1 mt-4 ${collapsed ? "hidden" : ""}`}>
          <span className="px-3 text-[10px] font-semibold tracking-widest text-[var(--color-gt-untyped)]/60 uppercase">
            Customize
          </span>
        </div>
        {collapsed && <div className="my-2 mx-2 h-px bg-[var(--color-gt-untyped)]/10" />}
        <SidebarItem
          icon={<Palette className="h-[18px] w-[18px]" />}
          label="Themes"
          active={activeView === "themes"}
          collapsed={collapsed}
          onClick={() => onNavigate("themes")}
        />
        <SidebarItem
          icon={<Settings className="h-[18px] w-[18px]" />}
          label="Settings"
          active={activeView === "settings"}
          collapsed={collapsed}
          onClick={() => onNavigate("settings")}
        />
        <SidebarItem
          icon={<Terminal className="h-[18px] w-[18px]" />}
          label="Command Palette"
          collapsed={collapsed}
          onClick={() => onNavigate("command-line")}
        />
        <SidebarItem
          icon={<Globe className="h-[18px] w-[18px]" />}
          label="Language"
          collapsed={collapsed}
          onClick={() => onNavigate("language")}
        />
        <SidebarItem
          icon={<Info className="h-[18px] w-[18px]" />}
          label="About"
          active={activeView === "about"}
          collapsed={collapsed}
          onClick={() => onNavigate("about")}
        />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom section */}
        <div className={`mb-1 ${collapsed ? "hidden" : ""}`}>
          <span className="px-3 text-[10px] font-semibold tracking-widest text-[var(--color-gt-untyped)]/60 uppercase">
            Account
          </span>
        </div>
        {collapsed && <div className="my-2 mx-2 h-px bg-[var(--color-gt-untyped)]/10" />}
        <SidebarItem
          icon={<Bell className="h-[18px] w-[18px]" />}
          label="Notifications"
          collapsed={collapsed}
          badge={hasNotifications}
          onClick={() => onNavigate("notifications")}
        />
        <SidebarItem
          icon={<User className="h-[18px] w-[18px]" />}
          label="Profile"
          active={activeView === "profile"}
          collapsed={collapsed}
          onClick={() => onNavigate("profile")}
        />

        {/* Sign in/out button */}
        <button
          onClick={() => onNavigate("login")}
          className={`mt-1 mb-3 flex items-center justify-center gap-2 rounded-xl border border-[var(--color-gt-accent)]/20 bg-[var(--color-gt-accent)]/10 py-2 text-xs font-medium text-[var(--color-gt-accent)] transition-all hover:border-[var(--color-gt-accent)]/40 hover:bg-[var(--color-gt-accent)]/15 ${
            collapsed ? "mx-1 px-0" : "px-3"
          }`}
        >
          <LogIn className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && (isAuthenticated ? "sign out" : "sign in")}
        </button>
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="flex items-center justify-center border-t border-[var(--color-gt-untyped)]/8 py-3 text-[var(--color-gt-untyped)] transition-colors hover:text-[var(--color-gt-text)]"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </aside>
  );
}

/* Mobile sidebar overlay */
export function MobileSidebar({
  open,
  onClose,
  onNavigate,
  activeView,
  hasNotifications,
  isAuthenticated,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (action: NavAction) => void;
  activeView: string;
  hasNotifications?: boolean;
  isAuthenticated?: boolean;
}) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden" onClick={onClose} />
      <div className="fixed top-0 left-0 z-50 h-screen w-64 md:hidden">
        <Sidebar
          onNavigate={(action) => {
            onNavigate(action);
            onClose();
          }}
          activeView={activeView}
          hasNotifications={hasNotifications}
          isAuthenticated={isAuthenticated}
          collapsed={false}
          onToggleCollapse={onClose}
          forceVisible
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-[var(--color-gt-untyped)] hover:text-[var(--color-gt-text)]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}

/* Mobile hamburger button */
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-40 rounded-xl bg-[var(--color-gt-sub)]/80 p-2.5 text-[var(--color-gt-untyped)] backdrop-blur-sm transition-colors hover:text-[var(--color-gt-text)] md:hidden"
      aria-label="Menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
