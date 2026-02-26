import { v } from "convex/values";
import { mutation, query } from "./server";
import { createModeKey } from "./utils";
import { evaluateAntiCheat } from "../lib/anti-cheat";

function inferRanked(mode: string) {
  return mode === "time" || mode === "words";
}

export const startTest = mutation({
  args: {
    authId: v.optional(v.string()),
    mode: v.string(),
    config: v.any(),
    languageCode: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const startToken = crypto.randomUUID();

    const user = args.authId
      ? await ctx.db
          .query("users")
          .withIndex("by_authId", (q) => q.eq("authId", args.authId!))
          .first()
      : null;

    const testId = await ctx.db.insert("tests", {
      userId: user?._id,
      mode: args.mode,
      config: args.config,
      languageCode: args.languageCode,
      startedAt: now,
      isRanked: inferRanked(args.mode),
      antiCheatFlags: [],
      startToken,
    });

    return { testId, startToken, startedAt: now };
  },
});

export const submitResult = mutation({
  args: {
    authId: v.optional(v.string()),
    testId: v.id("tests"),
    startToken: v.string(),
    elapsedSeconds: v.number(),
    stats: v.object({
      wpm: v.number(),
      rawWpm: v.number(),
      accuracy: v.number(),
      consistency: v.number(),
      correctChars: v.number(),
      incorrectChars: v.number(),
      extraChars: v.number(),
      missedChars: v.number(),
      totalChars: v.number(),
      elapsedSeconds: v.number(),
    }),
    wpmHistory: v.array(
      v.object({
        second: v.number(),
        wpm: v.number(),
        raw: v.number(),
        errors: v.number(),
      })
    ),
    languageCode: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const test = await ctx.db.get(args.testId);

    if (!test) throw new Error("Test not found");
    if (test.startToken !== args.startToken) throw new Error("Invalid test token");
    if (test.endedAt) throw new Error("Test already submitted");

    const user = args.authId
      ? await ctx.db
          .query("users")
          .withIndex("by_authId", (q) => q.eq("authId", args.authId!))
          .first()
      : null;

    const modeDuration =
      test.mode === "time"
        ? Number(test.config?.timeDuration ?? args.elapsedSeconds)
        : Number(test.config?.wordCount ?? args.elapsedSeconds);

    const modeKey = createModeKey(test.mode, modeDuration, args.languageCode);

    const antiCheatFlags = evaluateAntiCheat({
      mode: test.mode,
      config: test.config,
      durationSec: args.elapsedSeconds,
      wpm: args.stats.wpm,
      rawWpm: args.stats.rawWpm,
      accuracy: args.stats.accuracy,
      wpmHistory: args.wpmHistory,
      isRanked: test.isRanked,
    });

    await ctx.db.patch(test._id, {
      endedAt: now,
      durationSec: args.elapsedSeconds,
      antiCheatFlags,
    });

    const resultId = await ctx.db.insert("testResults", {
      testId: test._id,
      userId: user?._id,
      mode: test.mode,
      modeKey,
      languageCode: args.languageCode,
      wpm: args.stats.wpm,
      rawWpm: args.stats.rawWpm,
      accuracy: args.stats.accuracy,
      consistency: args.stats.consistency,
      charStats: {
        correctChars: args.stats.correctChars,
        incorrectChars: args.stats.incorrectChars,
        extraChars: args.stats.extraChars,
        missedChars: args.stats.missedChars,
        totalChars: args.stats.totalChars,
      },
      elapsedSeconds: args.elapsedSeconds,
      antiCheatFlags,
      wpmSeries: args.wpmHistory,
      createdAt: now,
    });

    const rankedEligibility = {
      eligible: test.isRanked && antiCheatFlags.length === 0,
      reasons: antiCheatFlags,
    };

    if (user && test.isRanked) {
      const shadowBanned = antiCheatFlags.length > 0;
      await ctx.db.insert("leaderboardEntries", {
        resultId,
        userId: user._id,
        modeKey,
        rankScore: args.stats.wpm,
        isShadowBanned: shadowBanned,
        createdAt: now,
      });

      const personalBestCandidates = await ctx.db
        .query("personalBests")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      const pb = personalBestCandidates.find((entry) => entry.modeKey === modeKey);

      if (!pb || args.stats.wpm > pb.bestWpm) {
        if (pb) {
          await ctx.db.patch(pb._id, {
            bestWpm: args.stats.wpm,
            resultId,
            updatedAt: now,
          });
        } else {
          await ctx.db.insert("personalBests", {
            userId: user._id,
            modeKey,
            bestWpm: args.stats.wpm,
            resultId,
            updatedAt: now,
          });
        }

        await ctx.db.insert("notifications", {
          userId: user._id,
          type: "personal_best",
          title: "New personal best",
          message: `You reached ${args.stats.wpm} WPM in ${modeKey}`,
          payload: { modeKey, resultId: String(resultId) },
          createdAt: now,
        });
      }
    }

    return {
      resultId,
      rankedEligibility,
    };
  },
});

export const getRecentResults = query({
  args: {
    authId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!args.authId) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.authId!))
      .first();

    if (!user) return [];

    const limit = Math.min(Math.max(args.limit ?? 20, 1), 100);
    const results = await ctx.db
      .query("testResults")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);

    return results.map((result) => ({
      id: result._id,
      testId: result.testId,
      mode: result.mode,
      modeKey: result.modeKey,
      languageCode: result.languageCode,
      wpm: result.wpm,
      rawWpm: result.rawWpm,
      accuracy: result.accuracy,
      consistency: result.consistency,
      correctChars: result.charStats.correctChars,
      incorrectChars: result.charStats.incorrectChars,
      extraChars: result.charStats.extraChars,
      missedChars: result.charStats.missedChars,
      elapsedSeconds: result.elapsedSeconds,
      antiCheatFlags: result.antiCheatFlags,
      createdAt: result.createdAt,
    }));
  },
});

export const getResultById = query({
  args: { resultId: v.id("testResults") },
  handler: async (ctx, args) => {
    const result = await ctx.db.get(args.resultId);
    if (!result) return null;

    const user = result.userId ? await ctx.db.get(result.userId) : null;

    return {
      id: result._id,
      mode: result.mode,
      modeKey: result.modeKey,
      languageCode: result.languageCode,
      wpm: result.wpm,
      rawWpm: result.rawWpm,
      accuracy: result.accuracy,
      consistency: result.consistency,
      elapsedSeconds: result.elapsedSeconds,
      charStats: result.charStats,
      wpmSeries: result.wpmSeries,
      antiCheatFlags: result.antiCheatFlags,
      createdAt: result.createdAt,
      user: user
        ? {
            username: user.username,
            avatarUrl: user.avatarUrl,
          }
        : null,
    };
  },
});

export const resetPersonalBests = mutation({
  args: { authId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.authId))
      .first();

    if (!user) throw new Error("User not found");

    const pbs = await ctx.db
      .query("personalBests")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const pb of pbs) {
      await ctx.db.delete(pb._id);
    }

    await ctx.db.insert("auditEvents", {
      actorId: user._id,
      type: "personal_bests_reset",
      targetId: String(user._id),
      createdAt: Date.now(),
    });

    return { success: true };
  },
});
