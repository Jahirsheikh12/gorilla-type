export type TypingMode = "time" | "words" | "quote" | "zen" | "custom";

export type TimeDuration = 15 | 30 | 60 | 120;
export type WordCount = 10 | 25 | 50 | 100;

export type AntiCheatFlag =
  | "none"
  | "high_wpm"
  | "improbable_accuracy"
  | "duration_mismatch"
  | "invalid_payload"
  | "short_ranked_run"
  | "sparse_wpm_history"
  | "spiky_wpm_series";

export interface LanguageSelection {
  code: string;
  name: string;
  variant?: string;
  tier?: string;
}

export interface PersistedTestConfig {
  mode: TypingMode;
  timeDuration: TimeDuration;
  wordCount: WordCount;
  punctuation: boolean;
  numbers: boolean;
  languageCode: string;
  customText?: string;
}

export interface UserSettings {
  quickRestart: "off" | "tab" | "esc";
  liveWpm: boolean;
  liveAcc: boolean;
  liveBurst: boolean;
  keyTips: boolean;
  smoothCaret: "off" | "slow" | "medium" | "fast";
  caretStyle: "off" | "line" | "block" | "outline" | "underline";
  soundOnClick: boolean;
  soundOnError: boolean;
  soundVolume: "quiet" | "medium" | "loud";
  fontSize: "small" | "medium" | "large" | "xlarge";
  flipColors: boolean;
  colorfulMode: boolean;
  strictSpace: boolean;
  confidenceMode: "off" | "on" | "max";
  indicateTypos: "off" | "below" | "replace";
  freedomMode: boolean;
  blindMode: boolean;
  hideExtraLetters: boolean;
  showOof: boolean;
  showAvg: boolean;
  capsWarning: boolean;
  timerProgress: "off" | "bar" | "text" | "mini";
  showAllLines: boolean;
  lazyMode: boolean;
  hideHeader: boolean;
  hideFooter: boolean;
  hideKeyboardShortcuts: boolean;
  hideCapsLockWarning: boolean;
  selectedThemeId: string;
  selectedLanguageCode: string;
}

export interface RankedEligibility {
  eligible: boolean;
  reasons: AntiCheatFlag[];
}

export interface TestResultDTO {
  id: string;
  testId: string;
  mode: TypingMode;
  modeKey: string;
  languageCode: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  elapsedSeconds: number;
  antiCheatFlags: AntiCheatFlag[];
  createdAt: number;
}

export interface LeaderboardRowDTO {
  rank: number;
  userId: string;
  username: string;
  wpm: number;
  raw: number;
  accuracy: number;
  consistency: number;
  createdAt: number;
  modeKey: string;
}

export interface ProfileSummaryDTO {
  username: string;
  joinedAt: number;
  streakDays: number;
  testsTaken: number;
  timeTypingSeconds: number;
  avgAccuracy: number;
  avgWpm: number;
  personalBests: Array<{ mode: string; wpm: number }>;
}

export interface NotificationDTO {
  id: string;
  type: string;
  title: string;
  message: string;
  payload?: Record<string, string>;
  readAt: number | null;
  createdAt: number;
}

export interface ShareDTO {
  slug: string;
  visibility: "public" | "unlisted" | "private";
  ogImageUrl: string | null;
  createdAt: number;
}

export const DEFAULT_SETTINGS: UserSettings = {
  quickRestart: "tab",
  liveWpm: true,
  liveAcc: true,
  liveBurst: false,
  keyTips: true,
  smoothCaret: "medium",
  caretStyle: "line",
  soundOnClick: false,
  soundOnError: true,
  soundVolume: "medium",
  fontSize: "medium",
  flipColors: false,
  colorfulMode: false,
  strictSpace: false,
  confidenceMode: "off",
  indicateTypos: "below",
  freedomMode: false,
  blindMode: false,
  hideExtraLetters: false,
  showOof: true,
  showAvg: true,
  capsWarning: true,
  timerProgress: "bar",
  showAllLines: false,
  lazyMode: false,
  hideHeader: false,
  hideFooter: false,
  hideKeyboardShortcuts: false,
  hideCapsLockWarning: false,
  selectedThemeId: "jungle-core",
  selectedLanguageCode: "en",
};
