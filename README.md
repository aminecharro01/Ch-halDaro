# ch'hal Daro - Football Live Score

A stunning full-stack football live score web application built with Next.js 15, Tailwind CSS, SWR, and Google Gemini AI.

## Features
- **Live Match Updates**: Uses SWR for intelligent 60s background polling, pausing when the tab is hidden.
- **AI Match Analysis**: Gemini 2.0 Flash automatically analyzes post-match statistics to provide broadcast-journalism-style intelligence summaries.
- **Web Push Notifications**: Service Worker integration for serverless push notifications (driven by Vercel cron).
- **Match Predictions**: Visual match prediction probability bars.
- **Dark Mode Tailored UI**: "Wow-factor" pure TailwindCSS interface featuring micro-animations (`animate-pulse-ring`, `animate-fade-up`) and dynamic layouts.

## Built With
- **Framework**: Next.js 15 (App Router, React 19)
- **Styling**: Tailwind CSS v4 (native nesting, `@theme` configs)
- **Data Fetching**: SWR
- **API Provider**: API-Football via RapidAPI
- **Generative AI**: Google Gemini SDK (`@google/generative-ai`)
- **PWA / Notifications**: Web-push API & Next.js static asset service workers

## Getting Started

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables. You will need to generate VAPID keys for push notifications. The `generate-vapid-keys` module helps:
   ```bash
   npx web-push generate-vapid-keys
   ```
   Add them along with your API-Football and Gemini keys to a `.env.local` file:
   ```env
   RAPIDAPI_KEY=your_rapidapi_key
   RAPIDAPI_HOST=api-football-v1.p.rapidapi.com
   GEMINI_API_KEY=your_gemini_key
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_push_pub_key
   VAPID_PRIVATE_KEY=your_push_priv_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment
This application is fully optimized for the Vercel Free Tier.
- Push notifications subscription storage defaults to `/tmp` in development. On Vercel, attach a Vercel KV datastore and update the `fs`/`/tmp` persistence logic inside `api/subscribe/route.ts` and `api/notify/route.ts` to `@vercel/kv`.
- The included `vercel.json` operates `/api/notify` on a cron-job lifecycle to check for live football data changes and trigger Service Worker push notifications down to the client.

## License
MIT
