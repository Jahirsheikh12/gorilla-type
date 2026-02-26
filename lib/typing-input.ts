const LAZY_EQUIVALENTS: Record<string, string[]> = {
  "'": ["’", "`"],
  "\"": ["“", "”"],
  "-": ["–", "—", "_"],
};

export function isLazyMatch(inputChar: string, targetChar: string) {
  if (inputChar === targetChar) return true;

  if (
    inputChar.length === 1 &&
    targetChar.length === 1 &&
    inputChar.toLowerCase() === targetChar.toLowerCase()
  ) {
    return true;
  }

  const candidates = LAZY_EQUIVALENTS[targetChar];
  if (candidates && candidates.includes(inputChar)) {
    return true;
  }

  return false;
}
