## Gorilla Type (Production Scaffold)

This repository now includes a full-stack Gorilla Type implementation scaffold:

1. Next.js App Router frontend
2. Convex schema/functions for core product data
3. Auth.js authentication (credentials + OAuth providers)
4. API routes wiring UI panels to backend data
5. Share pages and OG image generation

## Local Setup

1. Copy `.env.example` to `.env.local`
2. Fill environment values:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `CONVEX_DEPLOY_KEY`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `ALLOWED_ORIGINS`
   - optional OAuth provider IDs/secrets
   - optional Sentry DSNs + org/project

3. Start the app:

```bash
npm run dev
```

4. In another terminal, start Convex dev sync:

```bash
npx convex dev
```

## Validation

```bash
npm run test
npm run lint
npm run build
```

## Notes

1. Guest test runs are supported.
2. Signed-in users have persisted settings/profile/notifications/history.
3. Shared results are available at `/share/:slug`.
4. Account danger zone supports data export and deletion request (7-day grace window).
5. Leaderboard/profile/notifications use Convex live subscriptions.

## Deploy

Deploy frontend on Vercel and point it to your production Convex deployment.
