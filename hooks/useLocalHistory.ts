"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "gt-local-history";
const MAX_ENTRIES = 20;

export interface LocalResult {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  mode: string;
  modeKey: string;
  elapsedSeconds: number;
  timestamp: number;
}

function readStorage(): LocalResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as LocalResult[];
  } catch {
    return [];
  }
}

function writeStorage(results: LocalResult[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch {
    // localStorage may be full or unavailable
  }
}

export function useLocalHistory() {
  const [history, setHistory] = useState<LocalResult[]>([]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setHistory(readStorage());
  }, []);

  const addResult = useCallback((result: LocalResult) => {
    setHistory((prev) => {
      const updated = [result, ...prev].slice(0, MAX_ENTRIES);
      writeStorage(updated);
      return updated;
    });
  }, []);

  const getHistory = useCallback((): LocalResult[] => {
    return history;
  }, [history]);

  const clearHistory = useCallback(() => {
    writeStorage([]);
    setHistory([]);
  }, []);

  const totalTests = history.length;

  const averageWpm =
    totalTests > 0
      ? Math.round(history.reduce((sum, r) => sum + r.wpm, 0) / totalTests)
      : 0;

  const bestWpm =
    totalTests > 0
      ? Math.max(...history.map((r) => r.wpm))
      : 0;

  const totalTimeSeconds = history.reduce((sum, r) => sum + r.elapsedSeconds, 0);

  return {
    history,
    addResult,
    getHistory,
    clearHistory,
    averageWpm,
    bestWpm,
    totalTests,
    totalTimeSeconds,
  };
}
