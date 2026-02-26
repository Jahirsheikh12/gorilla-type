export interface WpmSample {
  second: number;
  wpm: number;
  raw: number;
  errors: number;
}

export function calculateWpm(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  return Math.round((correctChars / 5) / (elapsedSeconds / 60));
}

export function calculateRawWpm(totalChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  return Math.round((totalChars / 5) / (elapsedSeconds / 60));
}

export function calculateAccuracy(correctChars: number, totalChars: number): number {
  if (totalChars <= 0) return 100;
  return Math.round((correctChars / totalChars) * 100);
}

export function calculateConsistency(wpmSamples: number[]): number {
  if (wpmSamples.length < 2) return 100;
  const mean = wpmSamples.reduce((a, b) => a + b, 0) / wpmSamples.length;
  if (mean === 0) return 0;
  const variance =
    wpmSamples.reduce((sum, v) => sum + (v - mean) ** 2, 0) / wpmSamples.length;
  const sd = Math.sqrt(variance);
  const cv = (sd / mean) * 100;
  return Math.max(0, Math.round(100 - cv));
}

export interface TestStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  totalChars: number;
  elapsedSeconds: number;
}

export function computeTestStats(
  words: string[],
  typedWords: string[][],
  elapsedSeconds: number,
  wpmHistory: WpmSample[]
): TestStats {
  let correctChars = 0;
  let incorrectChars = 0;
  let extraChars = 0;
  let missedChars = 0;

  for (let w = 0; w < typedWords.length; w++) {
    const target = words[w] || "";
    const typed = typedWords[w] || [];

    for (let c = 0; c < typed.length; c++) {
      if (c < target.length) {
        if (typed[c] === target[c]) {
          correctChars++;
        } else {
          incorrectChars++;
        }
      } else {
        extraChars++;
      }
    }

    if (typed.length < target.length && w < typedWords.length - 1) {
      missedChars += target.length - typed.length;
    }
  }

  // Count spaces between completed words as correct chars
  const completedWords = Math.max(0, typedWords.length - 1);
  correctChars += completedWords;

  const totalChars = correctChars + incorrectChars + extraChars + missedChars;

  return {
    wpm: calculateWpm(correctChars, elapsedSeconds),
    rawWpm: calculateRawWpm(correctChars + incorrectChars + extraChars, elapsedSeconds),
    accuracy: calculateAccuracy(correctChars, totalChars),
    consistency: calculateConsistency(wpmHistory.map((s) => s.wpm)),
    correctChars,
    incorrectChars,
    extraChars,
    missedChars,
    totalChars,
    elapsedSeconds,
  };
}
