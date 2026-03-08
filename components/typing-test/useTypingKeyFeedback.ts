"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";
import type { TypingState } from "@/hooks/useTypingTest";
import type { UserSettings } from "@/lib/types";
import { isLazyMatch } from "@/lib/typing-input";

interface UseTypingKeyFeedbackArgs {
  settings: UserSettings;
  state: TypingState;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

/* ------------------------------------------------------------------ */
/*  Volume scaling                                                     */
/* ------------------------------------------------------------------ */

function volumeScale(
  level: UserSettings["soundVolume"],
  values: { quiet: number; medium: number; loud: number },
) {
  if (level === "loud") return values.loud;
  if (level === "quiet") return values.quiet;
  return values.medium;
}

/* ------------------------------------------------------------------ */
/*  Mechanical switch sound synthesis (Cherry MX style)                */
/* ------------------------------------------------------------------ */

function createMechanicalClickSound(
  ctx: AudioContext,
  gain: number,
  isSpace: boolean,
) {
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = gain;

  /* --- Click transient (the initial "tick" of the switch actuation) --- */
  const clickLen = isSpace ? 0.012 : 0.008;
  const clickBuf = ctx.createBuffer(
    1,
    Math.ceil(ctx.sampleRate * clickLen),
    ctx.sampleRate,
  );
  const clickData = clickBuf.getChannelData(0);
  for (let i = 0; i < clickData.length; i++) {
    const t = i / ctx.sampleRate;
    const freq = isSpace ? 1800 : 2400 + Math.random() * 600;
    clickData[i] =
      Math.sin(2 * Math.PI * freq * t) *
      Math.exp(-t * (isSpace ? 350 : 500)) *
      (0.7 + Math.random() * 0.3);
  }
  const clickSrc = ctx.createBufferSource();
  clickSrc.buffer = clickBuf;
  const clickGain = ctx.createGain();
  clickGain.gain.setValueAtTime(1.0, now);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + clickLen);
  clickSrc.connect(clickGain);
  clickGain.connect(master);
  clickSrc.start(now);

  /* --- Thock body (low "thunk" of the switch bottoming out) --- */
  const thockLen = isSpace ? 0.06 : 0.035;
  const thockBuf = ctx.createBuffer(
    1,
    Math.ceil(ctx.sampleRate * thockLen),
    ctx.sampleRate,
  );
  const thockData = thockBuf.getChannelData(0);
  const thockFreq = isSpace ? 120 : 180 + Math.random() * 80;
  for (let i = 0; i < thockData.length; i++) {
    const t = i / ctx.sampleRate;
    thockData[i] =
      (Math.sin(2 * Math.PI * thockFreq * t) * 0.6 +
        Math.sin(2 * Math.PI * thockFreq * 2.3 * t) * 0.25 +
        (Math.random() * 2 - 1) * 0.15) *
      Math.exp(-t * (isSpace ? 55 : 80));
  }
  const thockSrc = ctx.createBufferSource();
  thockSrc.buffer = thockBuf;
  const thockGain = ctx.createGain();
  thockGain.gain.setValueAtTime(isSpace ? 0.85 : 0.65, now);
  thockGain.gain.exponentialRampToValueAtTime(0.001, now + thockLen);
  thockSrc.connect(thockGain);
  thockGain.connect(master);
  thockSrc.start(now + 0.001);

  /* --- Plate resonance (subtle metallic ring) --- */
  const resLen = isSpace ? 0.09 : 0.055;
  const resBuf = ctx.createBuffer(
    1,
    Math.ceil(ctx.sampleRate * resLen),
    ctx.sampleRate,
  );
  const resData = resBuf.getChannelData(0);
  const resFreq = isSpace ? 350 : 600 + Math.random() * 300;
  for (let i = 0; i < resData.length; i++) {
    const t = i / ctx.sampleRate;
    resData[i] =
      Math.sin(2 * Math.PI * resFreq * t) *
      Math.exp(-t * (isSpace ? 40 : 60)) *
      0.15;
  }
  const resSrc = ctx.createBufferSource();
  resSrc.buffer = resBuf;
  const resGain = ctx.createGain();
  resGain.gain.setValueAtTime(0.3, now);
  resGain.gain.exponentialRampToValueAtTime(0.001, now + resLen);
  resSrc.connect(resGain);
  resGain.connect(master);
  resSrc.start(now + 0.002);

  /* --- Low-pass filter for warmth --- */
  const lpf = ctx.createBiquadFilter();
  lpf.type = "lowpass";
  lpf.frequency.value = isSpace ? 3000 : 4500;
  lpf.Q.value = 0.7;
  master.connect(lpf);
  lpf.connect(ctx.destination);

  // Cleanup
  const cleanupTime = Math.max(clickLen, thockLen, resLen) * 1000 + 150;
  setTimeout(() => {
    try {
      clickSrc.disconnect();
      thockSrc.disconnect();
      resSrc.disconnect();
      clickGain.disconnect();
      thockGain.disconnect();
      resGain.disconnect();
      master.disconnect();
      lpf.disconnect();
    } catch {
      /* already disconnected */
    }
  }, cleanupTime);
}

function createErrorSound(ctx: AudioContext, gain: number) {
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = gain;

  /* Harsh low buzz — distinct from the pleasant click */
  const len = 0.05;
  const buf = ctx.createBuffer(
    1,
    Math.ceil(ctx.sampleRate * len),
    ctx.sampleRate,
  );
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate;
    data[i] =
      (Math.sin(2 * Math.PI * 180 * t) * 0.5 +
        Math.sin(2 * Math.PI * 240 * t) * 0.3 +
        (Math.random() * 2 - 1) * 0.2) *
      Math.exp(-t * 60);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const srcGain = ctx.createGain();
  srcGain.gain.setValueAtTime(1.0, now);
  srcGain.gain.exponentialRampToValueAtTime(0.001, now + len);
  src.connect(srcGain);
  srcGain.connect(master);
  master.connect(ctx.destination);
  src.start(now);

  setTimeout(() => {
    try {
      src.disconnect();
      srcGain.disconnect();
      master.disconnect();
    } catch {
      /* already disconnected */
    }
  }, len * 1000 + 100);
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useTypingKeyFeedback({
  settings,
  state,
  handleKeyDown,
}: UseTypingKeyFeedbackArgs) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastClickRef = useRef<number>(0);
  const [pressedCodes, setPressedCodes] = useState<Set<string>>(
    () => new Set(),
  );

  const getCtx = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  useEffect(() => {
    const addPressedCode = (event: KeyboardEvent) => {
      if (!event.code) return;
      setPressedCodes((previous) => {
        if (previous.has(event.code)) return previous;
        const next = new Set(previous);
        next.add(event.code);
        return next;
      });
    };

    const removePressedCode = (event: KeyboardEvent) => {
      if (!event.code) return;
      setPressedCodes((previous) => {
        if (!previous.has(event.code)) return previous;
        const next = new Set(previous);
        next.delete(event.code);
        return next;
      });
    };

    const clearPressedCodes = () => {
      setPressedCodes((previous) =>
        previous.size === 0 ? previous : new Set(),
      );
    };

    window.addEventListener("keydown", addPressedCode);
    window.addEventListener("keyup", removePressedCode);
    window.addEventListener("blur", clearPressedCodes);
    document.addEventListener("visibilitychange", clearPressedCodes);

    return () => {
      window.removeEventListener("keydown", addPressedCode);
      window.removeEventListener("keyup", removePressedCode);
      window.removeEventListener("blur", clearPressedCodes);
      document.removeEventListener("visibilitychange", clearPressedCodes);
    };
  }, []);

  const handleTypingKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const isPrintable =
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey;
      const isSpace = event.key === " ";
      const isBackspace = event.key === "Backspace";

      /* --- Mechanical click sound --- */
      if (
        settings.soundOnClick &&
        (isPrintable || isSpace || isBackspace)
      ) {
        const ctx = getCtx();
        if (ctx) {
          const now = ctx.currentTime;
          // Debounce: at most one sound per 20ms
          if (now - lastClickRef.current >= 0.02) {
            lastClickRef.current = now;
            createMechanicalClickSound(
              ctx,
              volumeScale(settings.soundVolume, {
                quiet: 0.02,
                medium: 0.04,
                loud: 0.07,
              }),
              isSpace,
            );
          }
        }
      }

      /* --- Error sound --- */
      if (isPrintable && settings.soundOnError) {
        const targetWord = state.words[state.currentWordIndex] ?? "";
        const targetChar = targetWord[state.currentCharIndex] ?? "";
        const mismatchedChar =
          targetChar &&
          !(settings.lazyMode && isLazyMatch(event.key, targetChar)) &&
          event.key !== targetChar;

        if (mismatchedChar) {
          const ctx = getCtx();
          if (ctx) {
            createErrorSound(
              ctx,
              volumeScale(settings.soundVolume, {
                quiet: 0.015,
                medium: 0.025,
                loud: 0.045,
              }),
            );
          }
        }
      }

      if (isSpace && settings.soundOnError) {
        const typedWord = state.typedWords[state.currentWordIndex] ?? [];
        if (typedWord.length === 0 && settings.strictSpace) {
          const ctx = getCtx();
          if (ctx) {
            createErrorSound(
              ctx,
              volumeScale(settings.soundVolume, {
                quiet: 0.015,
                medium: 0.025,
                loud: 0.045,
              }),
            );
          }
        }
      }

      handleKeyDown(event);
    },
    [
      getCtx,
      handleKeyDown,
      settings.lazyMode,
      settings.soundOnClick,
      settings.soundOnError,
      settings.soundVolume,
      settings.strictSpace,
      state.currentCharIndex,
      state.currentWordIndex,
      state.typedWords,
      state.words,
    ],
  );

  return { handleTypingKeyDown, pressedCodes };
}
