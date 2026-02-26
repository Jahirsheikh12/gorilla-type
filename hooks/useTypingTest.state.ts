import { createSeededRng, generateWords } from "../lib/words";
import { isLazyMatch } from "../lib/typing-input";
import type {
  TypingMode,
  TimeDuration as SharedTimeDuration,
  WordCount as SharedWordCount,
} from "../lib/types";
import {
  calculateWpm,
  calculateRawWpm,
  computeTestStats,
  type WpmSample,
  type TestStats,
} from "../lib/typing-engine";

export type TestMode = TypingMode;
export type TimeDuration = SharedTimeDuration;
export type WordCount = SharedWordCount;
export type TestPhase = "config" | "running" | "finished";

export interface TestConfig {
  mode: TestMode;
  timeDuration: TimeDuration;
  wordCount: WordCount;
  punctuation: boolean;
  numbers: boolean;
  languageCode: string;
  quoteText?: string;
  customText?: string;
  strictSpace: boolean;
  freedomMode: boolean;
  confidenceMode: "off" | "on" | "max";
  blindMode: boolean;
  hideExtraLetters: boolean;
  indicateTypos: "off" | "below" | "replace";
  quickRestart: "off" | "tab" | "esc";
  lazyMode: boolean;
}

export interface TypingState {
  config: TestConfig;
  phase: TestPhase;
  words: string[];
  typedWords: string[][];
  currentWordIndex: number;
  currentCharIndex: number;
  timeLeft: number;
  elapsedSeconds: number;
  wpmHistory: WpmSample[];
  isFocused: boolean;
  capsLock: boolean;
  lastTypeTime: number;
  stats: TestStats | null;
}

export type TypingAction =
  | { type: "CHAR_TYPED"; char: string }
  | { type: "SPACE_PRESSED" }
  | { type: "BACKSPACE" }
  | { type: "CTRL_BACKSPACE" }
  | { type: "TICK" }
  | { type: "SET_CONFIG"; payload: Partial<TestConfig> }
  | { type: "RESTART" }
  | { type: "FINISH" }
  | { type: "SET_FOCUS"; focused: boolean }
  | { type: "SET_CAPS_LOCK"; on: boolean };

export interface InitialStateOptions {
  seed?: string;
}

const FIXED_LENGTH_MODES: TestMode[] = ["words", "quote", "custom"];

function isFixedLengthMode(mode: TestMode) {
  return FIXED_LENGTH_MODES.includes(mode);
}

function finishWithStats(state: TypingState, elapsedSeconds: number, wpmHistory: WpmSample[]) {
  return {
    ...state,
    phase: "finished" as const,
    stats: computeTestStats(state.words, state.typedWords, elapsedSeconds || 1, wpmHistory),
  };
}

export function hydrationSeedForConfig(config: TestConfig): string {
  return [
    "v1",
    config.mode,
    config.timeDuration,
    config.wordCount,
    config.punctuation ? "1" : "0",
    config.numbers ? "1" : "0",
    config.languageCode,
    config.quoteText ?? "",
    config.customText ?? "",
  ].join("|");
}

export function generateWordList(
  config: TestConfig,
  options: InitialStateOptions = {}
): string[] {
  const rng = options.seed ? createSeededRng(options.seed) : undefined;

  if (config.mode === "custom") {
    const custom = (config.customText ?? "").trim();
    if (custom.length > 0) {
      return custom.split(/\s+/);
    }
  }

  if (config.mode === "quote") {
    const quote = (config.quoteText ?? "").trim();
    if (quote.length > 0) {
      return quote.split(/\s+/);
    }
  }

  const count = config.mode === "words" ? config.wordCount : config.timeDuration * 5;
  return generateWords({
    count,
    punctuation: config.punctuation,
    numbers: config.numbers,
    languageCode: config.languageCode,
    rng,
  });
}

export function createInitialState(
  config: TestConfig,
  options: InitialStateOptions = {}
): TypingState {
  return {
    config,
    phase: "config",
    words: generateWordList(config, options),
    typedWords: [[]],
    currentWordIndex: 0,
    currentCharIndex: 0,
    timeLeft: config.mode === "time" ? config.timeDuration : 0,
    elapsedSeconds: 0,
    wpmHistory: [],
    isFocused: true,
    capsLock: false,
    lastTypeTime: 0,
    stats: null,
  };
}

export const DEFAULT_CONFIG: TestConfig = {
  mode: "time",
  timeDuration: 30,
  wordCount: 25,
  punctuation: false,
  numbers: false,
  languageCode: "en",
  quoteText: "Typing speed is built one accurate keystroke at a time.",
  customText: "",
  strictSpace: false,
  freedomMode: false,
  confidenceMode: "off",
  blindMode: false,
  hideExtraLetters: false,
  indicateTypos: "below",
  quickRestart: "tab",
  lazyMode: false,
};

function handleCharTyped(state: TypingState, char: string): TypingState {
  if (state.phase === "finished") return state;

  const phase: TestPhase = state.phase === "config" ? "running" : state.phase;
  const currentWord = state.words[state.currentWordIndex] || "";
  const typed = [...(state.typedWords[state.currentWordIndex] || [])];

  if (typed.length >= currentWord.length + 10) return state;

  const targetChar = currentWord[typed.length];
  const nextChar =
    state.config.lazyMode && targetChar && isLazyMatch(char, targetChar) ? targetChar : char;

  typed.push(nextChar);

  const newTypedWords = [...state.typedWords];
  newTypedWords[state.currentWordIndex] = typed;

  const shouldFinish =
    isFixedLengthMode(state.config.mode) &&
    state.currentWordIndex === state.words.length - 1 &&
    typed.length === currentWord.length;

  const nextState = {
    ...state,
    phase,
    typedWords: newTypedWords,
    currentCharIndex: typed.length,
    lastTypeTime: Date.now(),
    timeLeft:
      phase === "running" && state.phase === "config"
        ? state.config.mode === "time"
          ? state.config.timeDuration
          : 0
        : state.timeLeft,
  };

  if (!shouldFinish) {
    return nextState;
  }

  return {
    ...nextState,
    phase: "finished",
    stats: computeTestStats(
      nextState.words,
      nextState.typedWords,
      nextState.elapsedSeconds || 1,
      nextState.wpmHistory
    ),
  };
}

function handleSpacePressed(state: TypingState): TypingState {
  if (state.phase === "finished" || state.phase === "config") return state;

  const typed = state.typedWords[state.currentWordIndex] || [];
  if (typed.length === 0) {
    if (!state.config.strictSpace) return state;

    const newTypedWords = [...state.typedWords];
    newTypedWords[state.currentWordIndex] = [" "];

    return {
      ...state,
      typedWords: newTypedWords,
      currentCharIndex: 1,
      lastTypeTime: Date.now(),
    };
  }

  const nextWordIndex = state.currentWordIndex + 1;
  if (isFixedLengthMode(state.config.mode) && nextWordIndex >= state.words.length) {
    return finishWithStats(state, state.elapsedSeconds || 1, state.wpmHistory);
  }

  let words = state.words;
  if ((state.config.mode === "time" || state.config.mode === "zen") && nextWordIndex >= words.length - 20) {
    words = [
      ...words,
      ...generateWords({
        count: 50,
        punctuation: state.config.punctuation,
        numbers: state.config.numbers,
        languageCode: state.config.languageCode,
      }),
    ];
  }

  const newTypedWords = [...state.typedWords];
  newTypedWords[nextWordIndex] = newTypedWords[nextWordIndex] || [];

  return {
    ...state,
    words,
    typedWords: newTypedWords,
    currentWordIndex: nextWordIndex,
    currentCharIndex: 0,
    lastTypeTime: Date.now(),
  };
}

function handleBackspace(state: TypingState): TypingState {
  if (state.phase === "finished" || state.phase === "config") return state;
  if (state.config.confidenceMode === "max") return state;
  if (state.config.blindMode) return state;

  const typed = [...(state.typedWords[state.currentWordIndex] || [])];
  if (typed.length > 0) {
    typed.pop();
    const newTypedWords = [...state.typedWords];
    newTypedWords[state.currentWordIndex] = typed;
    return {
      ...state,
      typedWords: newTypedWords,
      currentCharIndex: typed.length,
      lastTypeTime: Date.now(),
    };
  }

  if (state.currentWordIndex > 0 && state.config.freedomMode) {
    if (state.config.confidenceMode === "on") return state;
    const prevIndex = state.currentWordIndex - 1;
    const prevTyped = state.typedWords[prevIndex] || [];
    return {
      ...state,
      currentWordIndex: prevIndex,
      currentCharIndex: prevTyped.length,
      lastTypeTime: Date.now(),
    };
  }

  return state;
}

function handleCtrlBackspace(state: TypingState): TypingState {
  if (state.phase === "finished" || state.phase === "config") return state;
  if (state.config.confidenceMode !== "off" || state.config.blindMode) return state;

  const newTypedWords = [...state.typedWords];
  newTypedWords[state.currentWordIndex] = [];

  return {
    ...state,
    typedWords: newTypedWords,
    currentCharIndex: 0,
    lastTypeTime: Date.now(),
  };
}

function sampleWpm(state: TypingState, elapsedSeconds: number): WpmSample {
  let correctChars = 0;
  for (let wordIndex = 0; wordIndex < state.typedWords.length; wordIndex++) {
    const target = state.words[wordIndex] || "";
    const typed = state.typedWords[wordIndex] || [];
    for (let charIndex = 0; charIndex < typed.length && charIndex < target.length; charIndex++) {
      if (typed[charIndex] === target[charIndex]) correctChars++;
    }
    if (wordIndex < state.currentWordIndex) {
      correctChars++;
    }
  }

  let totalTyped = 0;
  let errorChars = 0;
  for (let wordIndex = 0; wordIndex < state.typedWords.length; wordIndex++) {
    const target = state.words[wordIndex] || "";
    const typed = state.typedWords[wordIndex] || [];
    totalTyped += typed.length;
    for (let charIndex = 0; charIndex < typed.length; charIndex++) {
      if (charIndex >= target.length || typed[charIndex] !== target[charIndex]) {
        errorChars++;
      }
    }
  }

  return {
    second: elapsedSeconds,
    wpm: calculateWpm(correctChars, elapsedSeconds),
    raw: calculateRawWpm(totalTyped, elapsedSeconds),
    errors: errorChars,
  };
}

function handleTick(state: TypingState): TypingState {
  if (state.phase !== "running") return state;

  const elapsedSeconds = state.elapsedSeconds + 1;
  const sample = sampleWpm(state, elapsedSeconds);
  const wpmHistory = [...state.wpmHistory, sample];

  if (state.config.mode === "time") {
    const timeLeft = state.timeLeft - 1;
    if (timeLeft <= 0) {
      return {
        ...finishWithStats(state, elapsedSeconds, wpmHistory),
        elapsedSeconds,
        timeLeft: 0,
        wpmHistory,
      };
    }
    return { ...state, elapsedSeconds, timeLeft, wpmHistory };
  }

  return { ...state, elapsedSeconds, wpmHistory };
}

function handleSetConfig(state: TypingState, payload: Partial<TestConfig>): TypingState {
  if (state.phase === "running") return state;
  const nextConfig = { ...state.config, ...payload };
  return createInitialState(nextConfig);
}

function handleFinish(state: TypingState): TypingState {
  if (state.phase !== "running") return state;
  return finishWithStats(state, state.elapsedSeconds || 1, state.wpmHistory);
}

export function typingReducer(state: TypingState, action: TypingAction): TypingState {
  switch (action.type) {
    case "CHAR_TYPED":
      return handleCharTyped(state, action.char);
    case "SPACE_PRESSED":
      return handleSpacePressed(state);
    case "BACKSPACE":
      return handleBackspace(state);
    case "CTRL_BACKSPACE":
      return handleCtrlBackspace(state);
    case "TICK":
      return handleTick(state);
    case "SET_CONFIG":
      return handleSetConfig(state, action.payload);
    case "RESTART":
      return createInitialState(state.config);
    case "FINISH":
      return handleFinish(state);
    case "SET_FOCUS":
      return { ...state, isFocused: action.focused };
    case "SET_CAPS_LOCK":
      return { ...state, capsLock: action.on };
    default:
      return state;
  }
}
