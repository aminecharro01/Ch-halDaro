# Ch'hal Daro - Football Live Score

A stunning full-stack football live score web application built with Next.js 15, Tailwind CSS, and SWR.

## Features
- **Live Match Updates**: Uses SWR for intelligent 60s background polling, pausing when the tab is hidden.
- **Match Insights**: Automatically analyzes post-match statistics to provide professional journalism-style summaries.
- **Web Push Notifications**: Service Worker integration for serverless push notifications (driven by Vercel cron).
- **Match Predictions**: Visual match prediction probability bars.
- **Dark Mode Tailored UI**: Modern interface featuring micro-animations (`animate-pulse-ring`, `animate-fade-up`) and dynamic layouts.

## Built With
- **Framework**: Next.js 15 (App Router, React 19)
- **Styling**: Tailwind CSS v4 (native nesting, `@theme` configs)
- **Data Fetching**: SWR
- **API Provider**: API-Sports (API-Football)
- **PWA / Notifications**: Web-push API & Next.js static asset service workers

## Getting Started

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables. Create a `.env.local` file:
   ```env
   # API-Sports Key
   FOOTBALL_API_KEY=your_api_key
   
   # Analysis Engine Key
   GEMINI_API_KEY=your_engine_key
   
   # Push Notifications
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_push_pub_key
   VAPID_PRIVATE_KEY=your_push_priv_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment
This application is optimized for Vercel.
- The included `vercel.json` is set to a daily cron schedule (`0 0 * * *`) to comply with the **Vercel Hobby Plan** limits. 
- **Note**: Frequent notifications (e.g., every minute) require a Vercel Pro plan or an external pinger (like UptimeRobot) to hit the `/api/notify` endpoint.

## License
MIT
