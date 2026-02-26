"use client";

import { useCallback, useRef } from "react";
import type React from "react";
import type { TypingState } from "@/hooks/useTypingTest";
import type { UserSettings } from "@/lib/types";
import { isLazyMatch } from "@/lib/typing-input";

interface UseTypingKeyFeedbackArgs {
  settings: UserSettings;
  state: TypingState;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

function soundGainForLevel(
  level: UserSettings["soundVolume"],
  values: { quiet: number; medium: number; loud: number }
) {
  if (level === "loud") return values.loud;
  if (level === "quiet") return values.quiet;
  return values.medium;
}

export function useTypingKeyFeedback({
  settings,
  state,
  handleKeyDown,
}: UseTypingKeyFeedbackArgs) {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playTone = useCallback((frequency: number, duration = 0.02, gain = 0.02) => {
    if (typeof window === "undefined") return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new window.AudioContext();
    }

    const context = audioCtxRef.current;
    const oscillator = context.createOscillator();
    const amplitude = context.createGain();

    oscillator.type = "square";
    oscillator.frequency.value = frequency;
    amplitude.gain.value = gain;

    oscillator.connect(amplitude);
    amplitude.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }, []);

  const handleTypingKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const isPrintable =
        event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;

      if (settings.soundOnClick && (isPrintable || event.key === " " || event.key === "Backspace")) {
        playTone(
          800,
          0.015,
          soundGainForLevel(settings.soundVolume, {
            quiet: 0.008,
            medium: 0.015,
            loud: 0.03,
          })
        );
      }

      if (isPrintable && settings.soundOnError) {
        const targetWord = state.words[state.currentWordIndex] ?? "";
        const targetChar = targetWord[state.currentCharIndex] ?? "";
        const mismatchedChar =
          targetChar &&
          !(settings.lazyMode && isLazyMatch(event.key, targetChar)) &&
          event.key !== targetChar;

        if (mismatchedChar) {
          playTone(
            220,
            0.04,
            soundGainForLevel(settings.soundVolume, {
              quiet: 0.012,
              medium: 0.02,
              loud: 0.04,
            })
          );
        }
      }

      if (event.key === " " && settings.soundOnError) {
        const typedWord = state.typedWords[state.currentWordIndex] ?? [];
        if (typedWord.length === 0 && settings.strictSpace) {
          playTone(
            220,
            0.04,
            soundGainForLevel(settings.soundVolume, {
              quiet: 0.012,
              medium: 0.02,
              loud: 0.04,
            })
          );
        }
      }

      handleKeyDown(event);
    },
    [
      handleKeyDown,
      playTone,
      settings.lazyMode,
      settings.soundOnClick,
      settings.soundOnError,
      settings.soundVolume,
      settings.strictSpace,
      state.currentCharIndex,
      state.currentWordIndex,
      state.typedWords,
      state.words,
    ]
  );

  return { handleTypingKeyDown };
}
