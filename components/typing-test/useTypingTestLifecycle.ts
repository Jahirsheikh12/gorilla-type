"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TestConfig, TypingState } from "@/hooks/useTypingTest";
import { apiFetch } from "@/lib/api-client";
import type { UserSettings } from "@/lib/types";
import { setLanguageWordPool } from "@/lib/words";
import type { ActiveRun, SubmitPayload } from "./types";

const PENDING_SUBMISSION_KEY = "gt-pending-submissions";

interface UseTypingTestLifecycleArgs {
  state: TypingState;
  setConfig: (payload: Partial<TestConfig>) => void;
  languageCode: string;
  settings: UserSettings;
  setThemeById: (id: string) => void;
}

function readPendingSubmissions() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(PENDING_SUBMISSION_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SubmitPayload[];
  } catch {
    return [];
  }
}

function writePendingSubmissions(items: SubmitPayload[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PENDING_SUBMISSION_KEY, JSON.stringify(items));
}

export function useTypingTestLifecycle({
  state,
  setConfig,
  languageCode,
  settings,
  setThemeById,
}: UseTypingTestLifecycleArgs) {
  const [activeRun, setActiveRun] = useState<ActiveRun | null>(null);
  const [lastResultId, setLastResultId] = useState<string | null>(null);
  const submitInFlightRef = useRef(false);
  const quoteFetchRef = useRef<string | null>(null);
  const wordPoolFetchRef = useRef<string | null>(null);

  useEffect(() => {
    setConfig({
      languageCode,
      strictSpace: settings.strictSpace,
      freedomMode: settings.freedomMode,
      confidenceMode: settings.confidenceMode,
      blindMode: settings.blindMode,
      hideExtraLetters: settings.hideExtraLetters,
      indicateTypos: settings.indicateTypos,
      quickRestart: settings.quickRestart,
      lazyMode: settings.lazyMode,
    });
  }, [languageCode, setConfig, settings]);

  useEffect(() => {
    if (settings.selectedThemeId) {
      setThemeById(settings.selectedThemeId);
    }
  }, [setThemeById, settings.selectedThemeId]);

  useEffect(() => {
    if (state.config.mode !== "quote" || state.phase !== "config") return;
    const key = `${state.config.languageCode}:${state.config.mode}:${state.phase}`;
    if (quoteFetchRef.current === key) return;
    quoteFetchRef.current = key;

    void apiFetch<{ text: string }>(
      `/api/languages/quote?languageCode=${state.config.languageCode}`
    )
      .then((quote) => {
        if (quote.text) {
          setConfig({ quoteText: quote.text });
        }
      })
      .catch(() => {
        quoteFetchRef.current = null;
      });
  }, [setConfig, state.config.languageCode, state.config.mode, state.phase]);

  useEffect(() => {
    const key = state.config.languageCode || languageCode;
    if (!key) return;
    if (wordPoolFetchRef.current === key) return;
    wordPoolFetchRef.current = key;

    void apiFetch<{ words: string[] }>(
      `/api/languages/words?languageCode=${encodeURIComponent(key)}`
    )
      .then((payload) => {
        if (Array.isArray(payload.words) && payload.words.length > 0) {
          setLanguageWordPool(key, payload.words);
          if (state.phase === "config" && state.config.languageCode === key) {
            setConfig({ languageCode: key });
          }
        }
      })
      .catch(() => {
        wordPoolFetchRef.current = null;
      });
  }, [languageCode, setConfig, state.config.languageCode, state.phase]);

  const flushPendingSubmissions = useCallback(async () => {
    const queue = readPendingSubmissions();
    if (queue.length === 0) return;

    const next: SubmitPayload[] = [];
    for (const payload of queue) {
      try {
        const result = await apiFetch<{ resultId: string }>("/api/tests/submit", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setLastResultId(result.resultId);
      } catch (error) {
        const message = error instanceof Error ? error.message : "submit failed";
        if (!message.toLowerCase().includes("already submitted")) {
          next.push(payload);
        }
      }
    }

    writePendingSubmissions(next);
  }, []);

  useEffect(() => {
    if (state.phase !== "running") return;
    if (activeRun) return;

    void apiFetch<ActiveRun>("/api/tests/start", {
      method: "POST",
      body: JSON.stringify({
        mode: state.config.mode,
        config: state.config,
        languageCode: state.config.languageCode || languageCode,
      }),
    })
      .then((run) => {
        setActiveRun(run);
      })
      .catch(() => {
        setActiveRun(null);
      });
  }, [activeRun, languageCode, state.config, state.phase]);

  useEffect(() => {
    if (state.phase !== "finished" || !state.stats || !activeRun) return;
    if (submitInFlightRef.current) return;

    submitInFlightRef.current = true;
    const payload: SubmitPayload = {
      testId: activeRun.testId,
      startToken: activeRun.startToken,
      elapsedSeconds: state.stats.elapsedSeconds,
      stats: state.stats,
      wpmHistory: state.wpmHistory,
      languageCode: state.config.languageCode || languageCode,
    };

    const queue = readPendingSubmissions();
    writePendingSubmissions([...queue, payload]);

    void flushPendingSubmissions().finally(() => {
      submitInFlightRef.current = false;
    });
  }, [
    activeRun,
    flushPendingSubmissions,
    languageCode,
    state.config.languageCode,
    state.phase,
    state.stats,
    state.wpmHistory,
  ]);

  useEffect(() => {
    if (state.phase === "config") {
      setActiveRun(null);
      submitInFlightRef.current = false;
      quoteFetchRef.current = null;
    }
  }, [state.phase]);

  useEffect(() => {
    void flushPendingSubmissions();

    const onOnline = () => {
      void flushPendingSubmissions();
    };

    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flushPendingSubmissions]);

  const handleShare = useCallback(async () => {
    if (!lastResultId) return;

    const shared = await apiFetch<{ slug: string }>("/api/shares", {
      method: "POST",
      body: JSON.stringify({
        resultId: lastResultId,
        visibility: "public",
      }),
    });

    const url = `${window.location.origin}/share/${shared.slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy your share link:", url);
    }
  }, [lastResultId]);

  return { handleShare };
}
