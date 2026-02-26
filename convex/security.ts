import { v } from "convex/values";
import { mutation } from "./server";

export const checkRateLimit = mutation({
  args: {
    key: v.string(),
    limit: v.number(),
    windowMs: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("rateLimits")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (!existing || existing.resetAt <= now) {
      if (existing) {
        await ctx.db.patch(existing._id, {
          count: 1,
          resetAt: now + args.windowMs,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("rateLimits", {
          key: args.key,
          count: 1,
          resetAt: now + args.windowMs,
          updatedAt: now,
        });
      }

      return {
        allowed: true,
        remaining: Math.max(0, args.limit - 1),
        retryAfterMs: args.windowMs,
      };
    }

    if (existing.count >= args.limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: Math.max(0, existing.resetAt - now),
      };
    }

    const nextCount = existing.count + 1;
    await ctx.db.patch(existing._id, {
      count: nextCount,
      updatedAt: now,
    });

    return {
      allowed: true,
      remaining: Math.max(0, args.limit - nextCount),
      retryAfterMs: Math.max(0, existing.resetAt - now),
    };
  },
});
