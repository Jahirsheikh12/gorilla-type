/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as bootstrap from "../bootstrap.js";
import type * as constants from "../constants.js";
import type * as languages from "../languages.js";
import type * as leaderboard from "../leaderboard.js";
import type * as notifications from "../notifications.js";
import type * as profile from "../profile.js";
import type * as security from "../security.js";
import type * as server from "../server.js";
import type * as settings from "../settings.js";
import type * as shares from "../shares.js";
import type * as tests from "../tests.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  bootstrap: typeof bootstrap;
  constants: typeof constants;
  languages: typeof languages;
  leaderboard: typeof leaderboard;
  notifications: typeof notifications;
  profile: typeof profile;
  security: typeof security;
  server: typeof server;
  settings: typeof settings;
  shares: typeof shares;
  tests: typeof tests;
  users: typeof users;
  utils: typeof utils;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
