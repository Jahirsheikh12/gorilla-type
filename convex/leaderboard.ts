import { v } from "convex/values";
import { query } from "./server";

export const getByModeAndWindow = query({
  args: {
    modeKeyPrefix: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 50, 1), 200);
    const candidates = await ctx.db
      .query("leaderboardEntries")
      .withIndex("by_mode_rankScore", (q) => q.eq("modeKey", args.modeKeyPrefix))
      .order("desc")
      .take(limit * 5);

    const rows = [] as Array<{
      rank: number;
      userId: string;
      username: string;
      wpm: number;
      raw: number;
      accuracy: number;
      consistency: number;
      createdAt: number;
      modeKey: string;
    }>;

    let rank = 0;
    for (const entry of candidates) {
      if (entry.isShadowBanned) continue;
      if (rows.length >= limit) break;

      const result = await ctx.db.get(entry.resultId);
      const user = await ctx.db.get(entry.userId);

      if (!result || !user || user.deletedAt) continue;
      rank += 1;

      rows.push({
        rank,
        userId: String(user._id),
        username: user.username,
        wpm: result.wpm,
        raw: result.rawWpm,
        accuracy: result.accuracy,
        consistency: result.consistency,
        createdAt: entry.createdAt,
        modeKey: entry.modeKey,
      });
    }

    return rows;
  },
});
