"use client";

import React, {
  useRef,
  useLayoutEffect,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { TypingState } from "@/hooks/useTypingTest";
import { Caret } from "./Caret";
import { Keyboard } from "lucide-react";

interface WordsDisplayProps {
  state: TypingState;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  setFocus: (focused: boolean) => void;
  hideCapsLockWarning?: boolean;
  hideExtraLetters?: boolean;
  indicateTypos?: "off" | "below" | "replace";
  showOof?: boolean;
  fontSize?: "small" | "medium" | "large" | "xlarge";
  showAllLines?: boolean;
  colorfulMode?: boolean;
  caretStyle?: "off" | "line" | "block" | "outline" | "underline";
  smoothCaret?: "off" | "slow" | "medium" | "fast";
}

const FONT_SIZE_MAP = {
  small: 22,
  medium: 26,
  large: 32,
  xlarge: 40,
} as const;

const DEFAULT_LINE_HEIGHT = 48;
const VISIBLE_LINES = 3;

const colorfulPalette = [
  "var(--color-gt-accent)",
  "color-mix(in srgb, var(--color-gt-accent) 75%, var(--color-gt-accent2) 25%)",
  "var(--color-gt-accent2)",
  "color-mix(in srgb, var(--color-gt-accent2) 65%, var(--color-gt-text) 35%)",
  "color-mix(in srgb, var(--color-gt-accent) 50%, var(--color-gt-text) 50%)",
];

const CharSpan = React.memo(function CharSpan({
  char,
  status,
  charRef,
  colorfulMode,
}: {
  char: string;
  status: "correct" | "incorrect" | "extra" | "pending";
  charRef?: React.Ref<HTMLSpanElement>;
  colorfulMode: boolean;
}) {
  let color = {
    correct: "var(--color-gt-text)",
    incorrect: "var(--color-gt-error)",
    extra: "var(--color-gt-extra)",
    pending: "var(--color-gt-untyped)",
  }[status];

  if (colorfulMode && status === "correct") {
    const index = Math.abs(char.charCodeAt(0)) % colorfulPalette.length;
    color = colorfulPalette[index];
  }

  return (
    <span
      ref={charRef}
      style={{ color }}
      className="transition-colors duration-75"
    >
      {char}
    </span>
  );
});

const CompletedWord = React.memo(function CompletedWord({
  word,
  typed,
  hideExtraLetters,
  indicateTypos,
  colorfulMode,
}: {
  word: string;
  typed: string[];
  hideExtraLetters: boolean;
  indicateTypos: "off" | "below" | "replace";
  colorfulMode: boolean;
}) {
  return (
    <span className="mr-[0.5em]">
      {word.split("").map((char, ci) => {
        const typedChar = typed[ci];
        let status: "correct" | "incorrect" | "pending" = "pending";
        if (typedChar !== undefined) {
          status =
            typedChar === char
              ? "correct"
              : indicateTypos === "off"
                ? "pending"
                : "incorrect";
        }
        return (
          <CharSpan
            key={ci}
            char={char}
            status={status}
            colorfulMode={colorfulMode}
          />
        );
      })}
      {!hideExtraLetters &&
        typed
          .slice(word.length)
          .map((char, ci) => (
            <CharSpan
              key={`extra-${ci}`}
              char={char}
              status="extra"
              colorfulMode={colorfulMode}
            />
          ))}
    </span>
  );
});

export function WordsDisplay({
  state,
  handleKeyDown,
  setFocus,
  hideCapsLockWarning = false,
  hideExtraLetters = false,
  indicateTypos = "below",
  showOof = true,
  fontSize = "medium",
  showAllLines = false,
  colorfulMode = false,
  caretStyle = "line",
  smoothCaret = "medium",
}: WordsDisplayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentCharRef = useRef<HTMLSpanElement | null>(null);
  const [caretPos, setCaretPos] = useState({
    top: 0,
    left: 0,
    height: DEFAULT_LINE_HEIGHT,
  });
  const [scrollLine, setScrollLine] = useState(0);
  const caretPosRef = useRef(caretPos);

  const computedFontSize = FONT_SIZE_MAP[fontSize];
  const lineHeight = Math.round(computedFontSize * 1.85);

  const [blurTimestamp, setBlurTimestamp] = useState(0);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const charEl = currentCharRef.current;
    if (!container || !charEl) return;

    const containerRect = container.getBoundingClientRect();
    const rect = charEl.getBoundingClientRect();

    const typed = state.typedWords[state.currentWordIndex] || [];
    const word = state.words[state.currentWordIndex] || "";

    const top = rect.top - containerRect.top;
    const left =
      typed.length > word.length
        ? rect.right - containerRect.left
        : rect.left - containerRect.left;

    const nextCaret = {
      top: Math.round(top),
      left: Math.round(left),
      height: Math.round(rect.height),
    };
    if (
      caretPosRef.current.top !== nextCaret.top ||
      caretPosRef.current.left !== nextCaret.left ||
      caretPosRef.current.height !== nextCaret.height
    ) {
      caretPosRef.current = nextCaret;
      setCaretPos(nextCaret);
    }

    if (showAllLines) {
      if (scrollLine !== 0) {
        setScrollLine(0);
      }
      return;
    }

    const contentLine = Math.round(top / lineHeight);
    if (contentLine >= scrollLine + VISIBLE_LINES - 1) {
      const nextScrollLine = contentLine - 1;
      if (nextScrollLine !== scrollLine) {
        setScrollLine(nextScrollLine);
      }
    }
  }, [
    lineHeight,
    scrollLine,
    showAllLines,
    state.currentWordIndex,
    state.typedWords,
    state.words,
  ]);

  // Auto-refocus: if focus was lost recently (within 3s) and user starts typing, refocus automatically
  useEffect(() => {
    if (!state.isFocused && state.phase !== "finished") {
      setBlurTimestamp(Date.now());
    }
  }, [state.isFocused, state.phase]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (state.isFocused || state.phase === "finished") return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      ) {
        return;
      }

      if (
        event.key.length === 1 ||
        event.key === "Backspace" ||
        event.key === " " ||
        event.key === "Tab" ||
        event.key === "Escape"
      ) {
        focusInput();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [focusInput, state.isFocused, state.phase]);

  // Auto-refocus within 3 seconds of blur
  useEffect(() => {
    if (state.isFocused || state.phase === "finished" || blurTimestamp === 0)
      return;

    const timeout = setTimeout(() => {
      // After 3 seconds, the auto-refocus window expires (no action needed,
      // the overlay stays as-is until user clicks or presses a key)
    }, 3000);

    const onKeyDown = (event: KeyboardEvent) => {
      const elapsed = Date.now() - blurTimestamp;
      if (elapsed <= 3000) {
        const target = event.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
        )
          return;
        focusInput();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [blurTimestamp, focusInput, state.isFocused, state.phase]);

  const wi = state.currentWordIndex;
  const currentWord = state.words[wi] || "";
  const currentTyped = state.typedWords[wi] || [];
  const effectiveScrollLine =
    state.phase === "config" || showAllLines ? 0 : scrollLine;
  const isTyping = state.lastTypeTime > 0 && state.phase === "running";
  const showGradientBorder = state.phase === "running";
  const showBlurOverlay = !state.isFocused && state.phase !== "finished" && showOof;

  return (
    <div
      role="textbox"
      aria-label="Typing test area"
      aria-readonly="true"
      className={`relative cursor-text rounded-2xl p-4 transition-all duration-300 ${
        showGradientBorder ? "gt-gradient-border" : ""
      }`}
      onClick={focusInput}
    >
      <input
        ref={inputRef}
        className="absolute h-0 w-0 opacity-0"
        autoFocus
        onKeyDown={handleKeyDown}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        aria-label="Typing test input - type here to begin"
        aria-describedby={state.capsLock ? "caps-lock-warning" : undefined}
        role="textbox"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      {/* Focus overlay with pill */}
      <div
        className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl transition-opacity duration-300 ease-out ${
          showBlurOverlay ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      >
        {showBlurOverlay && (
          <div
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-[var(--color-gt-untyped)]/15 bg-[var(--color-gt-sub)]/90 px-3.5 py-1.5 shadow-lg backdrop-blur-sm"
          >
            <Keyboard className="h-3.5 w-3.5 text-[var(--color-gt-untyped)]" />
            <span className="font-body text-xs text-[var(--color-gt-untyped)]">
              Click or press any key to focus
            </span>
          </div>
        )}
      </div>

      {state.capsLock && !hideCapsLockWarning && (
        <div
          id="caps-lock-warning"
          role="alert"
          aria-live="polite"
          className="mb-3 flex items-center justify-center gap-2 text-sm text-[var(--color-gt-error)]"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-gt-error)]" />
          Caps Lock is on
        </div>
      )}

      <div
        className={`relative ${showAllLines ? "overflow-visible" : "overflow-hidden"}`}
        style={{
          height: showAllLines ? "auto" : VISIBLE_LINES * lineHeight,
          fontSize: computedFontSize,
          lineHeight: `${lineHeight}px`,
          filter: showBlurOverlay ? "blur(4px)" : "blur(0px)",
          opacity: showBlurOverlay ? 0.5 : 1,
          transition: "filter 0.3s ease-out, opacity 0.3s ease-out",
        }}
      >
        <div
          ref={containerRef}
          className="relative flex flex-wrap font-mono"
          style={{
            transform: showAllLines
              ? "none"
              : `translateY(-${effectiveScrollLine * lineHeight}px)`,
            transition: showAllLines ? "none" : "transform 0.15s ease-out",
          }}
        >
          {state.isFocused && state.phase !== "finished" && (
            <Caret
              top={caretPos.top}
              left={caretPos.left}
              height={caretPos.height}
              isTyping={isTyping}
              styleVariant={caretStyle}
              smoothness={smoothCaret}
            />
          )}

          {state.words.map((word, wordIdx) => {
            if (wordIdx === wi) {
              const typed = currentTyped;
              const refCharIdx =
                typed.length < currentWord.length ? typed.length : null;
              const refExtraIdx =
                typed.length > currentWord.length
                  ? typed.length - currentWord.length - 1
                  : null;

              return (
                <span key={wordIdx} className="mr-[0.5em]">
                  {word.split("").map((char, ci) => {
                    const typedChar = typed[ci];
                    let status: "correct" | "incorrect" | "pending" = "pending";
                    if (typedChar !== undefined) {
                      status =
                        typedChar === char
                          ? "correct"
                          : indicateTypos === "off"
                            ? "pending"
                            : "incorrect";
                    }
                    const isRefChar = ci === refCharIdx;
                    return (
                      <CharSpan
                        key={ci}
                        char={char}
                        status={status}
                        charRef={isRefChar ? currentCharRef : undefined}
                        colorfulMode={colorfulMode}
                      />
                    );
                  })}
                  {!hideExtraLetters &&
                    typed.slice(word.length).map((char, ci) => {
                      const isRefChar = ci === refExtraIdx;
                      return (
                        <CharSpan
                          key={`extra-${ci}`}
                          char={char}
                          status="extra"
                          charRef={isRefChar ? currentCharRef : undefined}
                          colorfulMode={colorfulMode}
                        />
                      );
                    })}
                  {typed.length === word.length && word.length > 0 && (
                    <span ref={currentCharRef} className="inline-block w-0" />
                  )}
                </span>
              );
            }

            if (wordIdx < wi) {
              return (
                <CompletedWord
                  key={wordIdx}
                  word={word}
                  typed={state.typedWords[wordIdx] || []}
                  hideExtraLetters={hideExtraLetters}
                  indicateTypos={indicateTypos}
                  colorfulMode={colorfulMode}
                />
              );
            }

            return (
              <span key={wordIdx} className="mr-[0.5em]">
                {word.split("").map((char, ci) => (
                  <CharSpan
                    key={ci}
                    char={char}
                    status="pending"
                    colorfulMode={colorfulMode}
                  />
                ))}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
