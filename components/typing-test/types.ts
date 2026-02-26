import type { TestStats, WpmSample } from "@/lib/typing-engine";

export type ActiveView =
  | "test"
  | "settings"
  | "themes"
  | "leaderboard"
  | "profile"
  | "about";

export type ActiveModal =
  | "login"
  | "language"
  | "notifications"
  | "command-line"
  | null;

export interface ActiveRun {
  testId: string;
  startToken: string;
}

export interface SubmitPayload {
  testId: string;
  startToken: string;
  elapsedSeconds: number;
  stats: TestStats;
  wpmHistory: WpmSample[];
  languageCode: string;
}
