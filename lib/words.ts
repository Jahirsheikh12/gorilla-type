const COMMON_WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "great", "between", "need", "large", "often", "hand", "high", "place", "hold", "free",
  "real", "life", "few", "north", "open", "seem", "together", "next", "white", "children",
  "begin", "got", "walk", "example", "ease", "paper", "group", "always", "music", "those",
  "both", "mark", "book", "letter", "until", "mile", "river", "car", "feet", "care",
  "second", "enough", "plain", "girl", "usual", "young", "ready", "above", "ever", "red",
  "list", "though", "feel", "talk", "bird", "soon", "body", "dog", "family", "direct",
  "pose", "leave", "song", "measure", "door", "product", "black", "short", "numeral",
  "class", "wind", "question", "happen", "complete", "ship", "area", "half", "rock",
  "order", "fire", "south", "problem", "piece", "told", "knew", "pass", "since", "top",
  "whole", "king", "space", "heard", "best", "hour", "better", "true", "during", "hundred",
];

const PUNCTUATION_MARKS = [".", ",", "!", "?", ";", ":"];

const LANGUAGE_WORDS: Record<string, string[]> = {
  en: COMMON_WORDS,
  "en-1k": COMMON_WORDS,
  es: [
    "el", "la", "de", "que", "y", "a", "en", "un", "ser", "se",
    "no", "haber", "por", "con", "su", "para", "como", "estar", "tener", "le",
  ],
  fr: [
    "le", "de", "un", "etre", "et", "a", "il", "avoir", "ne", "je",
    "son", "que", "se", "qui", "ce", "dans", "en", "du", "elle", "au",
  ],
  de: [
    "der", "die", "und", "in", "den", "von", "zu", "das", "mit", "sich",
    "des", "auf", "fur", "ist", "im", "dem", "nicht", "ein", "eine", "als",
  ],
};

const runtimeLanguageWords: Record<string, string[]> = {};

export interface GenerateWordsOptions {
  count: number;
  punctuation?: boolean;
  numbers?: boolean;
  languageCode?: string;
  rng?: () => number;
}

function xmur3(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSeededRng(seed: string) {
  return mulberry32(xmur3(seed)());
}

export function setLanguageWordPool(languageCode: string, words: string[]) {
  const cleaned = words
    .map((word) => word.trim())
    .filter(Boolean);
  if (cleaned.length === 0) return;
  runtimeLanguageWords[languageCode] = cleaned;
}

export function generateWords({
  count,
  punctuation = false,
  numbers = false,
  languageCode = "en",
  rng = Math.random,
}: GenerateWordsOptions): string[] {
  const words: string[] = [];
  const source =
    runtimeLanguageWords[languageCode] ??
    LANGUAGE_WORDS[languageCode] ??
    COMMON_WORDS;

  for (let i = 0; i < count; i++) {
    if (numbers && rng() < 0.1) {
      words.push(String(Math.floor(rng() * 1000)));
      continue;
    }

    let word = source[Math.floor(rng() * source.length)];

    if (punctuation) {
      if (rng() < 0.1) {
        const mark =
          PUNCTUATION_MARKS[Math.floor(rng() * PUNCTUATION_MARKS.length)];
        word = word + mark;
      }
      if (i > 0 && rng() < 0.05) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
    }

    words.push(word);
  }

  return words;
}
