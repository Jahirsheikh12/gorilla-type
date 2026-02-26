export interface AntiCheatInput {
  mode: string;
  config: unknown;
  durationSec: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  wpmHistory: Array<{ second: number; wpm: number; raw: number; errors: number }>;
  isRanked: boolean;
}

const WPM_SUSPECT_THRESHOLD = 260;
const ACCURACY_SUSPECT_THRESHOLD = 100;

export function evaluateAntiCheat(input: AntiCheatInput) {
  const flags: string[] = [];

  if (input.wpm > WPM_SUSPECT_THRESHOLD) {
    flags.push("high_wpm");
  }
  if (input.accuracy > ACCURACY_SUSPECT_THRESHOLD || input.accuracy < 0) {
    flags.push("improbable_accuracy");
  }

  if (input.mode === "time") {
    const expected = Number(
      (input.config as { timeDuration?: number } | undefined)?.timeDuration ?? 0
    );
    if (expected > 0 && Math.abs(expected - input.durationSec) > 5) {
      flags.push("duration_mismatch");
    }
  }

  if (!Number.isFinite(input.durationSec) || input.durationSec <= 0) {
    flags.push("invalid_payload");
  }
  if (
    !Number.isFinite(input.wpm) ||
    !Number.isFinite(input.rawWpm) ||
    !Number.isFinite(input.accuracy) ||
    input.wpm < 0 ||
    input.rawWpm < 0
  ) {
    flags.push("invalid_payload");
  }

  if (
    input.isRanked &&
    input.mode === "time" &&
    input.durationSec > 0 &&
    input.durationSec < 10
  ) {
    flags.push("short_ranked_run");
  }

  if (
    input.durationSec >= 10 &&
    input.wpmHistory.length < Math.min(5, Math.floor(input.durationSec))
  ) {
    flags.push("sparse_wpm_history");
  }

  const maxSampleWpm = input.wpmHistory.reduce(
    (max, sample) => Math.max(max, sample.wpm),
    0
  );
  if (maxSampleWpm > Math.max(WPM_SUSPECT_THRESHOLD, input.wpm * 2 + 40)) {
    flags.push("spiky_wpm_series");
  }

  return Array.from(new Set(flags));
}
