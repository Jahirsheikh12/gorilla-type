"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { DEFAULT_SETTINGS, type UserSettings } from "@/lib/types";

interface BootstrapPayload {
  session?: {
    user?: {
      authId?: string;
      id?: string;
      name?: string;
      email?: string;
      image?: string;
    };
  } | null;
  settings?: UserSettings;
  user?: {
    selectedLanguageCode?: string;
    username?: string;
  } | null;
}

const GUEST_SETTINGS_KEY = "gt:guest-settings";
const GUEST_LANGUAGE_KEY = "gt:guest-language";

function readGuestSettings() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(GUEST_SETTINGS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UserSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return null;
  }
}

function readGuestLanguage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(GUEST_LANGUAGE_KEY);
  } catch {
    return null;
  }
}

export function usePlatformBootstrap(authKey?: string) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<BootstrapPayload["session"]>(null);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [languageCode, setLanguageCode] = useState("en");

  useEffect(() => {
    let mounted = true;

    void apiFetch<BootstrapPayload>("/api/bootstrap", undefined, {
      settings: DEFAULT_SETTINGS,
      user: { selectedLanguageCode: "en" },
      session: null,
    })
      .then((payload) => {
        if (!mounted) return;
        const nextSession = payload.session ?? null;
        const isAuthenticated = !!nextSession?.user?.authId;
        const guestSettings = readGuestSettings();
        const guestLanguage = readGuestLanguage();

        setSession(nextSession);
        setSettings(
          isAuthenticated
            ? payload.settings ?? DEFAULT_SETTINGS
            : guestSettings ?? payload.settings ?? DEFAULT_SETTINGS
        );
        setLanguageCode(
          isAuthenticated
            ? payload.user?.selectedLanguageCode ??
                payload.settings?.selectedLanguageCode ??
                "en"
            : guestLanguage ??
                guestSettings?.selectedLanguageCode ??
                payload.settings?.selectedLanguageCode ??
                "en"
        );
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [authKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (session?.user?.authId) return;
    window.localStorage.setItem(GUEST_SETTINGS_KEY, JSON.stringify(settings));
  }, [session?.user?.authId, settings]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (session?.user?.authId) return;
    window.localStorage.setItem(GUEST_LANGUAGE_KEY, languageCode);
  }, [languageCode, session?.user?.authId]);

  return {
    loading,
    session,
    settings,
    setSettings,
    languageCode,
    setLanguageCode,
  };
}
