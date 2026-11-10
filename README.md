# front-zurag

Next.js 16 website + business API for the Zurag photo marketplace. Hosted on Cloudflare Workers (via OpenNext). Database and login: Supabase. See `../ARCHITECTURE.md`.

## One-time setup

1. Create a free project at https://supabase.com.
2. In the Supabase **SQL Editor**, run `../back-zurag/supabase/migrations/20261107000001_users_and_roles.sql`.
3. Supabase → **Authentication → URL Configuration**: Site URL `http://localhost:3000`; add redirect URLs `http://localhost:3000/auth/callback` and `http://127.0.0.1:8787/auth/callback`.
4. Copy `.env.example` to `.env.local` and fill in the project URL and publishable key (Project Settings → API Keys).
5. To make yourself admin: sign up on the site, then run `../back-zurag/supabase/make_admin.sql` with your email.

Note: Supabase's built-in email sender only delivers to your project team's addresses and a few emails per hour. For testing with other addresses, either turn off **Confirm email** (Authentication → Sign In / Providers → Email) during development, or add your own SMTP later.

## Commands

```bash
npm run dev       # local dev server, http://localhost:3000
npm test          # unit tests (Vitest)
npm run lint
npm run preview   # build for Cloudflare and run the Worker locally, http://localhost:8787
npm run deploy    # build and deploy to Cloudflare (needs `npx wrangler login` once)
```

## Local design preview

`npm run dev` can render the home page and the events empty state without Supabase credentials. This development-only mode treats every visitor as a guest; it does not provide sample accounts or bypass role checks. Add the Supabase URL and publishable key to `.env.local` to use real authentication and event data. Production still requires configuration.
