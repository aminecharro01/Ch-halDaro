# Ch'hal Daro

*"Ch'hal daro?"* ("what's the score?" in Darija) — a near real-time football live-scores platform with favorites, AI match analysis, and push notifications. Built as a Next.js BFF over the TheSportsDB API with Supabase for auth/data and a dark "live-center" UI.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**Version** `0.1.0` · Academic project — EMSI (4th year)

## Key Features

| Area | Detail |
|---|---|
| **Live scores** | Dashboard with date filter (yesterday/today/tomorrow) across major leagues (PL, La Liga, Serie A, Bundesliga, UCL, Botola Pro...) |
| **Match detail** | Events, stats, lineups, head-to-head, standings, TV info, AI summary |
| **Search** | Teams, players, competitions via `/api/search` |
| **Regions** | Europe, Africa (Botola), South America, Asia |
| **Favorites** | Teams, leagues, matches — persisted in Supabase, restored on login |
| **AI analysis** | On-demand match summaries, tactical analysis, 1X2 predictions (Gemini, with local fallback if quota exceeded) |
| **Notifications** | Web Push (service worker) + email (Resend), driven by a cron job (`/api/cron/notify`) |
| **Admin panel** | `/admin` — stats, user bans, global notification toggle, maintenance banner, manual cron trigger, email broadcast |
| **PWA** | Installable, standalone display mode |
| **World Cup 2026** | Dedicated groups/schedule page |

## Project Structure

```
chhalDaro/
├── src/
│   ├── app/
│   │   ├── api/                  # Route handlers (BFF layer over TheSportsDB)
│   │   │   ├── scores/ match/ league/ region/ player/ team/ search/
│   │   │   ├── predictions/ analyze/     # AI-powered endpoints
│   │   │   ├── favorites/ subscribe/ push/ notify/
│   │   │   ├── admin/ cron/
│   │   ├── admin/                # Admin dashboard (users, settings, notifications)
│   │   ├── match/[id]/ team/[id]/ league/[id]/ player/[id]/ region/[id]/
│   │   ├── world-cup-2026/ favourites/ alerts/ profile/
│   │   └── auth/ login/
│   ├── components/
│   │   ├── match/ team/ league/ admin/ auth/ ui/
│   ├── lib/
│   │   ├── api/                  # TheSportsDB client + normalizers
│   │   ├── auth/ supabase/ email/ push/ cron/ admin/
│   ├── hooks/
│   └── types/
├── supabase/                     # SQL migrations
├── scripts/generateVapid.js      # Web Push VAPID key generator
└── proxy.ts
```

## Getting Started

### Prerequisites

- Node.js 20+, npm 10+
- Accounts/keys (depending on which features you need): [TheSportsDB](https://www.thesportsdb.com/api.php), [Supabase](https://supabase.com), [Google Generative AI](https://ai.google.dev/), [Resend](https://resend.com)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Purpose |
|---|---|
| `THESPORTSDB_KEY` | TheSportsDB API key |
| `GEMINI_API_KEY` | Google Generative AI key (match analysis/predictions) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server-only) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_EMAIL` | Web Push credentials (generate with `npm run vapid`) |
| `RESEND_API_KEY` / `EMAIL_FROM` | Transactional email |
| `CRON_SECRET` | Shared secret to authorize cron-triggered endpoints |
| `ADMIN_EMAILS` | Comma-separated emails granted admin access |
| `NEXT_PUBLIC_SITE_URL` | Public base URL |

### Database Setup

Apply the SQL migrations under `supabase/migrations/` to your Supabase project.

### Installation & Development

```bash
npm install
npm run dev          # clears .next/ and starts the dev server at http://localhost:3000
```

### Build & Run

```bash
npm run build
npm start
```

### Other Scripts

```bash
npm run lint          # ESLint
npm run vapid          # Generate Web Push VAPID keypair
```

## Deployment

Deployed on [Vercel](https://vercel.com) (serverless functions + scheduled cron for `/api/cron/notify`). Set all environment variables above in the Vercel project settings.

## License

MIT
