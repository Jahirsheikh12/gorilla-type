import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    authId: v.string(),
    email: v.optional(v.string()),
    username: v.string(),
    avatarUrl: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    selectedLanguageCode: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    roles: v.array(v.string()),
    deletedAt: v.optional(v.number()),
    deletionRequestedAt: v.optional(v.number()),
    deletionGraceUntil: v.optional(v.number()),
  })
    .index("by_authId", ["authId"])
    .index("by_email", ["email"]),

  userSettings: defineTable({
    userId: v.id("users"),
    settings: v.any(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  languages: defineTable({
    code: v.string(),
    name: v.string(),
    variant: v.optional(v.string()),
    tier: v.optional(v.string()),
    isActive: v.boolean(),
    wordlistRef: v.optional(v.string()),
    supportsPunctuation: v.boolean(),
    supportsNumbers: v.boolean(),
  }).index("by_code", ["code"]),

  wordlists: defineTable({
    languageCode: v.string(),
    tier: v.string(),
    words: v.array(v.string()),
    version: v.number(),
    createdAt: v.number(),
  }).index("by_language_tier", ["languageCode", "tier"]),

  quotes: defineTable({
    languageCode: v.string(),
    text: v.string(),
    source: v.optional(v.string()),
    difficulty: v.optional(v.number()),
    isActive: v.boolean(),
  }).index("by_language", ["languageCode"]),

  tests: defineTable({
    userId: v.optional(v.id("users")),
    mode: v.string(),
    config: v.any(),
    languageCode: v.string(),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    durationSec: v.optional(v.number()),
    isRanked: v.boolean(),
    antiCheatFlags: v.array(v.string()),
    startToken: v.string(),
  })
    .index("by_user_startedAt", ["userId", "startedAt"])
    .index("by_startToken", ["startToken"]),

  testResults: defineTable({
    testId: v.id("tests"),
    userId: v.optional(v.id("users")),
    mode: v.string(),
    modeKey: v.string(),
    languageCode: v.string(),
    wpm: v.number(),
    rawWpm: v.number(),
    accuracy: v.number(),
    consistency: v.number(),
    charStats: v.object({
      correctChars: v.number(),
      incorrectChars: v.number(),
      extraChars: v.number(),
      missedChars: v.number(),
      totalChars: v.number(),
    }),
    elapsedSeconds: v.number(),
    antiCheatFlags: v.array(v.string()),
    wpmSeries: v.array(
      v.object({
        second: v.number(),
        wpm: v.number(),
        raw: v.number(),
        errors: v.number(),
      })
    ),
    createdAt: v.number(),
  })
    .index("by_test", ["testId"])
    .index("by_user_createdAt", ["userId", "createdAt"])
    .index("by_mode_createdAt", ["modeKey", "createdAt"]),

  personalBests: defineTable({
    userId: v.id("users"),
    modeKey: v.string(),
    bestWpm: v.number(),
    resultId: v.id("testResults"),
    updatedAt: v.number(),
  })
    .index("by_user_mode", ["userId", "modeKey"])
    .index("by_user", ["userId"]),

  leaderboardEntries: defineTable({
    resultId: v.id("testResults"),
    userId: v.id("users"),
    modeKey: v.string(),
    rankScore: v.number(),
    isShadowBanned: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_mode_createdAt", ["modeKey", "createdAt"])
    .index("by_mode_rankScore", ["modeKey", "rankScore"])
    .index("by_user", ["userId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    payload: v.optional(v.any()),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user_createdAt", ["userId", "createdAt"])
    .index("by_user_readAt", ["userId", "readAt"]),

  shares: defineTable({
    resultId: v.id("testResults"),
    userId: v.optional(v.id("users")),
    slug: v.string(),
    visibility: v.string(),
    ogImageUrl: v.optional(v.string()),
    reportsCount: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_result", ["resultId"])
    .index("by_user", ["userId"]),

  shareReports: defineTable({
    shareId: v.id("shares"),
    reporterKey: v.string(),
    reason: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_share", ["shareId"])
    .index("by_reporter", ["reporterKey"]),

  auditEvents: defineTable({
    actorId: v.optional(v.id("users")),
    type: v.string(),
    targetId: v.optional(v.string()),
    meta: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  rateLimits: defineTable({
    key: v.string(),
    count: v.number(),
    resetAt: v.number(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),
});
