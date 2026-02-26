import { describe, expect, it } from "vitest";
import { userSettingsPatchSchema } from "../lib/server/validation";

describe("userSettingsPatchSchema", () => {
  it("accepts valid settings patch", () => {
    const parsed = userSettingsPatchSchema.parse({
      quickRestart: "esc",
      liveWpm: false,
      timerProgress: "mini",
      selectedThemeId: "jungle-core",
    });

    expect(parsed.quickRestart).toBe("esc");
    expect(parsed.timerProgress).toBe("mini");
  });

  it("rejects unknown keys", () => {
    expect(() =>
      userSettingsPatchSchema.parse({
        badFlag: true,
      })
    ).toThrow();
  });
});
