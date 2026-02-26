import { mutation } from "./server";
import { COMMON_WORDS_BY_LANGUAGE, DEFAULT_LANGUAGES, DEFAULT_QUOTES } from "./constants";

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existingLanguages = await ctx.db.query("languages").collect();
    const languagesByCode = new Map(
      existingLanguages.map((language) => [language.code, language])
    );

    for (const language of DEFAULT_LANGUAGES) {
      const existing = languagesByCode.get(language.code);
      if (!existing) {
        await ctx.db.insert("languages", {
          ...language,
          isActive: true,
          wordlistRef: `${language.code}:${language.tier ?? "common-200"}`,
        });
      } else {
        await ctx.db.patch(existing._id, {
          name: language.name,
          variant: language.variant,
          tier: language.tier,
          supportsPunctuation: language.supportsPunctuation,
          supportsNumbers: language.supportsNumbers,
          wordlistRef: `${language.code}:${language.tier ?? "common-200"}`,
        });
      }
    }

    const existingWordlists = await ctx.db.query("wordlists").collect();
    const wordlistByKey = new Map(
      existingWordlists.map((wordlist) => [`${wordlist.languageCode}:${wordlist.tier}`, wordlist])
    );

    for (const [languageCode, words] of Object.entries(COMMON_WORDS_BY_LANGUAGE)) {
      const key = `${languageCode}:common-200`;
      const existing = wordlistByKey.get(key);
      if (!existing) {
        await ctx.db.insert("wordlists", {
          languageCode,
          tier: "common-200",
          words,
          version: 1,
          createdAt: Date.now(),
        });
      } else {
        await ctx.db.patch(existing._id, {
          words,
          version: Math.max(existing.version, 1),
        });
      }
    }

    const existingQuotes = await ctx.db.query("quotes").collect();
    const quoteKeys = new Set(
      existingQuotes.map((quote) => `${quote.languageCode}:${quote.text}`)
    );
    for (const quote of DEFAULT_QUOTES) {
      const key = `${quote.languageCode}:${quote.text}`;
      if (!quoteKeys.has(key)) {
        await ctx.db.insert("quotes", {
          languageCode: quote.languageCode,
          text: quote.text,
          source: quote.source,
          difficulty: quote.difficulty,
          isActive: true,
        });
      }
    }

    return { ok: true };
  },
});
