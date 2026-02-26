import { describe, expect, it } from "vitest";
import { evaluateAntiCheat } from "../lib/anti-cheat";

describe("evaluateAntiCheat", () => {
  it("accepts realistic ranked results", () => {
    const flags = evaluateAntiCheat({
      mode: "time",
      config: { timeDuration: 30 },
      durationSec: 30,
      wpm: 92,
      rawWpm: 97,
      accuracy: 96,
      wpmHistory: Array.from({ length: 30 }, (_, i) => ({
        second: i + 1,
        wpm: 90 + (i % 4),
        raw: 95 + (i % 5),
        errors: 0,
      })),
      isRanked: true,
    });

    expect(flags).toEqual([]);
  });

  it("flags impossible payloads", () => {
    const flags = evaluateAntiCheat({
      mode: "time",
      config: { timeDuration: 60 },
      durationSec: 4,
      wpm: 420,
      rawWpm: 430,
      accuracy: 101,
      wpmHistory: [{ second: 1, wpm: 420, raw: 430, errors: 0 }],
      isRanked: true,
    });

    expect(flags).toContain("high_wpm");
    expect(flags).toContain("improbable_accuracy");
    expect(flags).toContain("short_ranked_run");
  });
});
