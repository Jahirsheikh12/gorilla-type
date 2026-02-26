"use client";

import { Bell, Trophy, Star, Zap, Gift, X } from "lucide-react";
import { useQuery } from "convex/react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api-client";
import { queryRef } from "@/lib/convex-react";
import type { NotificationDTO } from "@/lib/types";

interface NotificationPanelProps {
  onClose: () => void;
}

function iconForType(type: string) {
  if (type === "personal_best") return <Trophy className="h-4 w-4 text-amber-400" />;
  if (type === "achievement") return <Star className="h-4 w-4 text-[var(--color-gt-accent2)]" />;
  if (type === "streak") return <Zap className="h-4 w-4 text-[var(--color-gt-accent)]" />;
  if (type === "theme") return <Gift className="h-4 w-4 text-green-400" />;
  return <Bell className="h-4 w-4 text-[var(--color-gt-accent)]" />;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { data: session } = useSession();
  const notifications =
    useQuery(
      queryRef<{ authId?: string; limit?: number }, NotificationDTO[]>("notifications:list"),
      {
        authId: session?.user?.authId,
        limit: 30,
      }
    ) ?? [];

  const unread = notifications.filter((n) => !n.readAt).length;

  const markRead = (notificationId: string) => {
    void apiFetch("/api/notifications/mark-read", {
      method: "POST",
      body: JSON.stringify({ notificationId }),
    });
  };

  const markAllRead = () => {
    void apiFetch("/api/notifications/mark-all", { method: "POST" });
  };

  if (!session?.user?.authId) {
    return (
      <div className="results-animate w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-sub)] shadow-2xl">
        <div className="px-4 py-5 text-sm text-[var(--color-gt-untyped)]">Sign in to view notifications.</div>
      </div>
    );
  }

  return (
    <div className="results-animate w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--color-gt-untyped)]/10 bg-[var(--color-gt-sub)] shadow-2xl">
      <div className="flex items-center justify-between border-b border-[var(--color-gt-untyped)]/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[var(--color-gt-accent)]" />
          <span className="text-sm font-semibold text-[var(--color-gt-text)]">Notifications</span>
          {unread > 0 && (
            <span className="rounded-full bg-[var(--color-gt-accent)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--color-gt-bg)]">
              {unread}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-[var(--color-gt-untyped)] transition-colors hover:text-[var(--color-gt-text)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="gt-scroll max-h-[400px] overflow-y-auto">
        {notifications.length === 0 && (
          <div className="px-4 py-5 text-sm text-[var(--color-gt-untyped)]">No notifications yet.</div>
        )}
        {notifications.map((notif) => (
          <button
            key={notif.id}
            onClick={() => {
              if (!notif.readAt) {
                markRead(notif.id);
              }
            }}
            className={`flex w-full gap-3 border-b border-[var(--color-gt-untyped)]/5 px-4 py-3 text-left transition-colors hover:bg-[var(--color-gt-bg)]/50 ${
              !notif.readAt ? "bg-[var(--color-gt-accent)]/[0.03]" : ""
            }`}
          >
            <div className="mt-0.5 shrink-0">{iconForType(notif.type)}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <span className={`text-sm font-medium ${!notif.readAt ? "text-[var(--color-gt-text)]" : "text-[var(--color-gt-text)]/70"}`}>
                  {notif.title}
                </span>
                {!notif.readAt && (
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-gt-accent)]" />
                )}
              </div>
              <p className="mt-0.5 text-xs text-[var(--color-gt-untyped)]">{notif.message}</p>
              <span className="mt-1 block text-[10px] text-[var(--color-gt-untyped)]/60">
                {new Date(notif.createdAt).toLocaleString()}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="border-t border-[var(--color-gt-untyped)]/10 p-3">
        <button
          onClick={markAllRead}
          className="w-full rounded-lg py-1.5 text-center text-xs text-[var(--color-gt-untyped)] transition-colors hover:text-[var(--color-gt-accent)]"
        >
          Mark all as read
        </button>
      </div>
    </div>
  );
}
