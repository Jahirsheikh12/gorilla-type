import { v } from "convex/values";
import { mutation, query } from "./server";
import { COMMON_WORDS_BY_LANGUAGE, DEFAULT_LANGUAGES, DEFAULT_QUOTES } from "./constants";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const dbLanguages = await ctx.db.query("languages").collect();
    const activeDbLanguages = dbLanguages.filter((lang) => lang.isActive);

    const byCode = new Map(
      activeDbLanguages.map((language) => [language.code, language])
    );

    for (const language of DEFAULT_LANGUAGES) {
      if (!byCode.has(language.code)) {
        byCode.set(language.code, {
          ...language,
          isActive: true,
          wordlistRef: `${language.code}:${language.tier ?? "common-200"}`,
        });
      }
    }

    return Array.from(byCode.values()).sort((a, b) =>
      `${a.name} ${a.variant ?? ""}`.localeCompare(`${b.name} ${b.variant ?? ""}`)
    );
  },
});

export const select = mutation({
  args: {
    authId: v.optional(v.string()),
    languageCode: v.string(),
  },
  handler: async (ctx, args) => {
    const dbLanguage = await ctx.db
      .query("languages")
      .withIndex("by_code", (q) => q.eq("code", args.languageCode))
      .first();
    const defaultLanguage = DEFAULT_LANGUAGES.find(
      (language) => language.code === args.languageCode
    );
    if ((dbLanguage && !dbLanguage.isActive) || (!dbLanguage && !defaultLanguage)) {
      throw new Error("Unsupported language");
    }

    if (!args.authId) {
      return { languageCode: args.languageCode };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.authId!))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      selectedLanguageCode: args.languageCode,
      updatedAt: Date.now(),
    });

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (settings) {
      await ctx.db.patch(settings._id, {
        settings: {
          ...settings.settings,
          selectedLanguageCode: args.languageCode,
        },
        updatedAt: Date.now(),
      });
    }

    return { languageCode: args.languageCode };
  },
});

export const getWordPool = query({
  args: {
    languageCode: v.string(),
    tier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tier = args.tier ?? "common-200";

    const lists = await ctx.db
      .query("wordlists")
      .withIndex("by_language_tier", (q) =>
        q.eq("languageCode", args.languageCode)
      )
      .collect();

    const list = lists.find((item) => item.tier === tier);

    if (list) {
      return list.words;
    }

    return (
      COMMON_WORDS_BY_LANGUAGE[args.languageCode] ?? COMMON_WORDS_BY_LANGUAGE.en
    );
  },
});

export const getRandomQuote = query({
  args: {
    languageCode: v.string(),
  },
  handler: async (ctx, args) => {
    const quotes = await ctx.db
      .query("quotes")
      .withIndex("by_language", (q) => q.eq("languageCode", args.languageCode))
      .collect();

    const active = quotes.filter((quote) => quote.isActive);
    const source =
      active.length > 0
        ? active
        : DEFAULT_QUOTES.filter((quote) => quote.languageCode === args.languageCode);

    if (source.length === 0) {
      const fallback = DEFAULT_QUOTES[0];
      return {
        text: fallback.text,
        source: fallback.source,
        difficulty: fallback.difficulty,
      };
    }

    const quote = source[Math.floor(Math.random() * source.length)];
    return {
      text: quote.text,
      source: quote.source,
      difficulty: quote.difficulty,
    };
  },
});
