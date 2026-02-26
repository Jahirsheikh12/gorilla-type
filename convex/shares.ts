import { v } from "convex/values";
import { mutation, query } from "./server";

export const create = mutation({
  args: {
    authId: v.optional(v.string()),
    resultId: v.id("testResults"),
    visibility: v.optional(v.string()),
    ogImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.get(args.resultId);
    if (!result) throw new Error("Result not found");

    const user = args.authId
      ? await ctx.db
          .query("users")
          .withIndex("by_authId", (q) => q.eq("authId", args.authId!))
          .first()
      : null;

    if (user && result.userId && result.userId !== user._id) {
      throw new Error("Cannot share another user result");
    }

    const slug = crypto.randomUUID().split("-").slice(0, 3).join("");
    await ctx.db.insert("shares", {
      resultId: args.resultId,
      userId: user?._id,
      slug,
      visibility: args.visibility ?? "public",
      ogImageUrl: args.ogImageUrl,
      reportsCount: 0,
      createdAt: Date.now(),
    });

    return {
      slug,
      visibility: args.visibility ?? "public",
      ogImageUrl: args.ogImageUrl ?? null,
      createdAt: Date.now(),
    };
  },
});

export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const share = await ctx.db
      .query("shares")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!share || share.visibility === "private") return null;

    const result = await ctx.db.get(share.resultId);
    if (!result) return null;

    const user = result.userId ? await ctx.db.get(result.userId) : null;

    return {
      slug: share.slug,
      visibility: share.visibility,
      ogImageUrl: share.ogImageUrl ?? null,
      reportsCount: share.reportsCount ?? 0,
      createdAt: share.createdAt,
      result: {
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
        user: user ? { username: user.username, avatarUrl: user.avatarUrl } : null,
      },
    };
  },
});

export const report = mutation({
  args: {
    slug: v.string(),
    reporterKey: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const share = await ctx.db
      .query("shares")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!share) throw new Error("Share not found");

    const existing = await ctx.db
      .query("shareReports")
      .withIndex("by_reporter", (q) => q.eq("reporterKey", args.reporterKey))
      .collect();

    const duplicate = existing.some((item) => item.shareId === share._id);
    if (!duplicate) {
      await ctx.db.insert("shareReports", {
        shareId: share._id,
        reporterKey: args.reporterKey,
        reason: args.reason,
        createdAt: Date.now(),
      });
    }

    const reports = await ctx.db
      .query("shareReports")
      .withIndex("by_share", (q) => q.eq("shareId", share._id))
      .collect();

    const reportsCount = reports.length;
    if ((share.reportsCount ?? 0) !== reportsCount) {
      await ctx.db.patch(share._id, {
        reportsCount,
        visibility: reportsCount >= 5 ? "private" : share.visibility,
      });
    }

    return { success: true, reportsCount };
  },
});
