import { v } from "convex/values";
import { mutation, query } from "./server";

export const list = query({
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

    const limit = Math.min(Math.max(args.limit ?? 30, 1), 200);

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);

    return notifications.map((item) => ({
      id: item._id,
      type: item.type,
      title: item.title,
      message: item.message,
      payload: item.payload,
      readAt: item.readAt ?? null,
      createdAt: item.createdAt,
    }));
  },
});

export const markRead = mutation({
  args: {
    authId: v.string(),
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.authId))
      .first();

    if (!user) throw new Error("User not found");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== user._id) {
      throw new Error("Notification not found");
    }

    await ctx.db.patch(notification._id, {
      readAt: Date.now(),
    });

    return { success: true };
  },
});

export const markAllRead = mutation({
  args: {
    authId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.authId))
      .first();

    if (!user) throw new Error("User not found");

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", user._id))
      .collect();

    const now = Date.now();
    for (const item of notifications) {
      if (!item.readAt) {
        await ctx.db.patch(item._id, { readAt: now });
      }
    }

    return { success: true };
  },
});
