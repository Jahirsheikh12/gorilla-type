import { describe, expect, it } from "vitest";
import {
  DEFAULT_CONFIG,
  createInitialState,
  typingReducer,
} from "../hooks/useTypingTest.state";

describe("typingReducer", () => {
  it("starts the test on first character input", () => {
    const initial = createInitialState({
      ...DEFAULT_CONFIG,
      mode: "custom",
      customText: "hi",
    });

    const next = typingReducer(initial, { type: "CHAR_TYPED", char: "h" });

    expect(next.phase).toBe("running");
    expect(next.currentCharIndex).toBe(1);
    expect(next.typedWords[0]?.join("")).toBe("h");
  });

  it("finishes fixed-length custom mode on final character", () => {
    const initial = createInitialState({
      ...DEFAULT_CONFIG,
      mode: "custom",
      customText: "a",
    });

    const next = typingReducer(initial, { type: "CHAR_TYPED", char: "a" });

    expect(next.phase).toBe("finished");
    expect(next.stats).not.toBeNull();
  });

  it("respects strictSpace when pressing space on empty typed word", () => {
    const nonStrictInitial = createInitialState({
      ...DEFAULT_CONFIG,
      mode: "custom",
      customText: "a b",
      strictSpace: false,
    });
    const nonStrictRunning = typingReducer(nonStrictInitial, {
      type: "CHAR_TYPED",
      char: "a",
    });
    const nonStrictCleared = typingReducer(nonStrictRunning, { type: "BACKSPACE" });
    const nonStrictResult = typingReducer(nonStrictCleared, { type: "SPACE_PRESSED" });

    expect(nonStrictResult.currentWordIndex).toBe(0);
    expect(nonStrictResult.currentCharIndex).toBe(0);
    expect(nonStrictResult.typedWords[0]).toEqual([]);

    const strictInitial = createInitialState({
      ...DEFAULT_CONFIG,
      mode: "custom",
      customText: "a b",
      strictSpace: true,
    });
    const strictRunning = typingReducer(strictInitial, {
      type: "CHAR_TYPED",
      char: "a",
    });
    const strictCleared = typingReducer(strictRunning, { type: "BACKSPACE" });
    const strictResult = typingReducer(strictCleared, { type: "SPACE_PRESSED" });

    expect(strictResult.currentWordIndex).toBe(0);
    expect(strictResult.currentCharIndex).toBe(1);
    expect(strictResult.typedWords[0]).toEqual([" "]);
  });

  it("finishes time mode when timer reaches zero", () => {
    const initial = createInitialState(DEFAULT_CONFIG);
    const running = { ...initial, phase: "running" as const, timeLeft: 1 };

    const next = typingReducer(running, { type: "TICK" });

    expect(next.phase).toBe("finished");
    expect(next.timeLeft).toBe(0);
    expect(next.elapsedSeconds).toBe(1);
    expect(next.wpmHistory).toHaveLength(1);
    expect(next.stats).not.toBeNull();
  });
});
