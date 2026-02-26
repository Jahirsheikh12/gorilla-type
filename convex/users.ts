import { v } from "convex/values";
import { mutation, query } from "./server";
import { DEFAULT_NOTIFICATION_TEMPLATES } from "./constants";

export const upsertOAuthUser = mutation({
  args: {
    authId: v.string(),
    email: v.optional(v.string()),
    username: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.authId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        username: args.username,
        avatarUrl: args.avatarUrl,
        updatedAt: now,
      });
      return existing._id;
    }

    const userId = await ctx.db.insert("users", {
      authId: args.authId,
      email: args.email,
      username: args.username,
      avatarUrl: args.avatarUrl,
      createdAt: now,
      updatedAt: now,
      roles: ["user"],
      selectedLanguageCode: "en",
    });

    await ctx.db.insert("userSettings", {
      userId,
      settings: {
        quickRestart: "tab",
        liveWpm: true,
        liveAcc: true,
        liveBurst: false,
        keyTips: true,
        smoothCaret: "medium",
        caretStyle: "line",
        soundOnClick: false,
        soundOnError: true,
        soundVolume: "medium",
        fontSize: "medium",
        flipColors: false,
        colorfulMode: false,
        strictSpace: false,
        confidenceMode: "off",
        indicateTypos: "below",
        freedomMode: false,
        blindMode: false,
        hideExtraLetters: false,
        showOof: true,
        showAvg: true,
        capsWarning: true,
        timerProgress: "bar",
        showAllLines: false,
        lazyMode: false,
        hideHeader: false,
        hideFooter: false,
        hideKeyboardShortcuts: false,
        hideCapsLockWarning: false,
        selectedThemeId: "jungle-core",
        selectedLanguageCode: "en",
      },
      updatedAt: now,
    });

    for (const template of DEFAULT_NOTIFICATION_TEMPLATES) {
      await ctx.db.insert("notifications", {
        userId,
        type: template.type,
        title: template.title,
        message: template.message,
        createdAt: now,
      });
    }

    return userId;
  },
});

export const registerWithPassword = mutation({
  args: {
    email: v.string(),
    username: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const existingByEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingByEmail) {
      throw new Error("Email already in use");
    }

    const authId = `credentials:${args.email.toLowerCase()}`;
    const userId = await ctx.db.insert("users", {
      authId,
      email: args.email.toLowerCase(),
      username: args.username,
      passwordHash: args.passwordHash,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      roles: ["user"],
      selectedLanguageCode: "en",
    });

    await ctx.db.insert("userSettings", {
      userId,
      settings: {
        quickRestart: "tab",
        liveWpm: true,
        liveAcc: true,
        liveBurst: false,
        keyTips: true,
        smoothCaret: "medium",
        caretStyle: "line",
        soundOnClick: false,
        soundOnError: true,
        soundVolume: "medium",
        fontSize: "medium",
        flipColors: false,
        colorfulMode: false,
        strictSpace: false,
        confidenceMode: "off",
        indicateTypos: "below",
        freedomMode: false,
        blindMode: false,
        hideExtraLetters: false,
        showOof: true,
        showAvg: true,
        capsWarning: true,
        timerProgress: "bar",
        showAllLines: false,
        lazyMode: false,
        hideHeader: false,
        hideFooter: false,
        hideKeyboardShortcuts: false,
        hideCapsLockWarning: false,
        selectedThemeId: "jungle-core",
        selectedLanguageCode: "en",
      },
      updatedAt: Date.now(),
    });

    return { userId, authId };
  },
});

export const getCredentialsByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user || !user.passwordHash) return null;
    if (user.deletedAt && (!user.deletionGraceUntil || Date.now() > user.deletionGraceUntil)) {
      return null;
    }

    return {
      authId: user.authId,
      userId: user._id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      passwordHash: user.passwordHash,
    };
  },
});

export const getByAuthId = query({
  args: { authId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.authId) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.authId))
      .first();
    if (!user) return null;
    if (user.deletedAt && (!user.deletionGraceUntil || Date.now() > user.deletionGraceUntil)) {
      return null;
    }
    return {
      id: user._id,
      authId: user.authId,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      selectedLanguageCode: user.selectedLanguageCode ?? "en",
      pendingDeletion: Boolean(user.deletedAt),
      deletionGraceUntil: user.deletionGraceUntil ?? null,
    };
  },
});

export const deleteAccount = mutation({
  args: { authId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.authId))
      .first();

    if (!user) throw new Error("User not found");

    const now = Date.now();
    const graceUntil = now + 7 * 24 * 60 * 60 * 1000;

    await ctx.db.patch(user._id, {
      deletedAt: now,
      deletionRequestedAt: now,
      deletionGraceUntil: graceUntil,
      updatedAt: now,
    });

    await ctx.db.insert("auditEvents", {
      actorId: user._id,
      type: "account_delete_requested",
      targetId: String(user._id),
      meta: { graceUntil },
      createdAt: Date.now(),
    });

    return { success: true, graceUntil };
  },
});

export const restoreAccount = mutation({
  args: { authId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.authId))
      .first();

    if (!user) throw new Error("User not found");
    if (!user.deletedAt || !user.deletionGraceUntil) {
      throw new Error("Account is not pending deletion");
    }
    if (Date.now() > user.deletionGraceUntil) {
      throw new Error("Restoration window expired");
    }

    await ctx.db.patch(user._id, {
      deletedAt: undefined,
      deletionRequestedAt: undefined,
      deletionGraceUntil: undefined,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("auditEvents", {
      actorId: user._id,
      type: "account_delete_cancelled",
      targetId: String(user._id),
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const exportAccountData = query({
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

    const results = await ctx.db
      .query("testResults")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const personalBests = await ctx.db
      .query("personalBests")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const shares = await ctx.db
      .query("shares")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return {
      exportedAt: Date.now(),
      user: {
        id: user._id,
        authId: user.authId,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      settings: settings?.settings ?? null,
      results,
      personalBests,
      notifications,
      shares,
    };
  },
});
