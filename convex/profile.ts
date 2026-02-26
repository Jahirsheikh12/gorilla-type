import { v } from "convex/values";
import { query } from "./server";

export const getSummary = query({
  args: { authId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.authId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.authId!))
      .first();

    if (!user) return null;

    const results = await ctx.db
      .query("testResults")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const personalBests = await ctx.db
      .query("personalBests")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const testsTaken = results.length;
    const timeTypingSeconds = results.reduce((sum, item) => sum + item.elapsedSeconds, 0);
    const avgAccuracy =
      testsTaken > 0
        ? Math.round(results.reduce((sum, item) => sum + item.accuracy, 0) / testsTaken)
        : 0;
    const avgWpm =
      testsTaken > 0
        ? Math.round(results.reduce((sum, item) => sum + item.wpm, 0) / testsTaken)
        : 0;

    const sortedDays = Array.from(
      new Set(results.map((item) => new Date(item.createdAt).toISOString().slice(0, 10)))
    ).sort((a, b) => (a > b ? -1 : 1));

    let streakDays = 0;
    let cursor = new Date();
    while (true) {
      const key = cursor.toISOString().slice(0, 10);
      if (!sortedDays.includes(key)) break;
      streakDays += 1;
      cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
    }

    return {
      username: user.username,
      joinedAt: user.createdAt,
      streakDays,
      testsTaken,
      timeTypingSeconds,
      avgAccuracy,
      avgWpm,
      personalBests: personalBests
        .sort((a, b) => a.modeKey.localeCompare(b.modeKey))
        .map((pb) => ({ mode: pb.modeKey, wpm: pb.bestWpm })),
    };
  },
});

export const getHistory = query({
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

    const limit = Math.min(Math.max(args.limit ?? 50, 1), 200);

    const results = await ctx.db
      .query("testResults")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);

    return results.map((result) => ({
      id: result._id,
      createdAt: result.createdAt,
      mode: result.mode,
      modeKey: result.modeKey,
      wpm: result.wpm,
      rawWpm: result.rawWpm,
      accuracy: result.accuracy,
      consistency: result.consistency,
      elapsedSeconds: result.elapsedSeconds,
    }));
  },
});
