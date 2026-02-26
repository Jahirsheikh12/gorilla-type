import { v } from "convex/values";
import { mutation, query } from "./server";
import { DEFAULT_USER_SETTINGS } from "./constants";

export const get = query({
  args: { authId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.authId) return DEFAULT_USER_SETTINGS;

    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.authId))
      .first();

    if (!user) return DEFAULT_USER_SETTINGS;

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    return settings?.settings ?? DEFAULT_USER_SETTINGS;
  },
});

export const update = mutation({
  args: {
    authId: v.string(),
    patch: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.authId))
      .first();

    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    const nextSettings = {
      ...(existing?.settings ?? DEFAULT_USER_SETTINGS),
      ...args.patch,
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        settings: nextSettings,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId: user._id,
        settings: nextSettings,
        updatedAt: Date.now(),
      });
    }

    return nextSettings;
  },
});

export const reset = mutation({
  args: { authId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.authId))
      .first();

    if (!user) throw new Error("User not found");

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (settings) {
      await ctx.db.patch(settings._id, {
        settings: DEFAULT_USER_SETTINGS,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId: user._id,
        settings: DEFAULT_USER_SETTINGS,
        updatedAt: Date.now(),
      });
    }

    return DEFAULT_USER_SETTINGS;
  },
});
