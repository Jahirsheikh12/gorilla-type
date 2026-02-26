"use client";

import { useCallback, useEffect, useReducer, useRef, type KeyboardEvent } from "react";
import {
  DEFAULT_CONFIG,
  createInitialState,
  hydrationSeedForConfig,
  typingReducer,
  type TestConfig,
} from "./useTypingTest.state";

export type {
  TestMode,
  TimeDuration,
  WordCount,
  TestPhase,
  TestConfig,
  TypingState,
  TypingAction,
} from "./useTypingTest.state";

export function useTypingTest() {
  const [state, dispatch] = useReducer(
    typingReducer,
    DEFAULT_CONFIG,
    (initialConfig) =>
      createInitialState(initialConfig, {
        seed: hydrationSeedForConfig(initialConfig),
      })
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.phase === "running") {
      timerRef.current = setInterval(() => {
        dispatch({ type: "TICK" });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.phase]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.getModifierState("CapsLock") !== state.capsLock) {
        dispatch({ type: "SET_CAPS_LOCK", on: event.getModifierState("CapsLock") });
      }

      if (event.key === "Tab" && state.config.quickRestart === "tab") {
        event.preventDefault();
        dispatch({ type: "RESTART" });
        return;
      }

      if (event.key === "Escape" && state.config.quickRestart !== "off") {
        event.preventDefault();
        if (state.phase === "running") {
          dispatch({ type: "FINISH" });
        } else if (state.config.quickRestart === "esc") {
          dispatch({ type: "RESTART" });
        }
        return;
      }

      if (state.phase === "finished") return;

      if (event.key === "Backspace") {
        event.preventDefault();
        if (event.ctrlKey || event.metaKey) {
          dispatch({ type: "CTRL_BACKSPACE" });
        } else {
          dispatch({ type: "BACKSPACE" });
        }
        return;
      }

      if (event.key === " ") {
        event.preventDefault();
        dispatch({ type: "SPACE_PRESSED" });
        return;
      }

      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        dispatch({ type: "CHAR_TYPED", char: event.key });
      }
    },
    [state.capsLock, state.config.quickRestart, state.phase]
  );

  const setConfig = useCallback((payload: Partial<TestConfig>) => {
    dispatch({ type: "SET_CONFIG", payload });
  }, []);

  const restart = useCallback(() => {
    dispatch({ type: "RESTART" });
  }, []);

  const setFocus = useCallback((focused: boolean) => {
    dispatch({ type: "SET_FOCUS", focused });
  }, []);

  return {
    state,
    handleKeyDown,
    setConfig,
    restart,
    setFocus,
  };
}
