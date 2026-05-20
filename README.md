# Ch'hal Daro

> *« Ch'hal daro ? »* — plateforme web de scores football en temps quasi réel, avec favoris, analyses de match et alertes push.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**Version** `0.1.0` · **Branche de release** [`v0.1`](https://github.com/aminecharro01/Ch-halDaro/tree/v0.1) · Projet académique EMSI (4ᵉ année)

---

## Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Base de données Supabase](#base-de-données-supabase)
- [Variables d'environnement](#variables-denvironnement)
- [Scripts npm](#scripts-npm)
- [Structure du projet](#structure-du-projet)
- [Pages principales](#pages-principales)
- [API (aperçu)](#api-aperçu)
- [Déploiement Vercel](#déploiement-vercel)
- [Licence](#licence)

---

## Aperçu

**Ch'hal Daro** agrège les données [TheSportsDB](https://www.thesportsdb.com/), les expose via une couche API Next.js (pattern BFF), et propose une interface sombre type « live center » : scores du jour, détail match, ligues, régions, Coupe du Monde 2026, profil utilisateur, panel admin et notifications.

L'authentification et la persistance (favoris, abonnements push, paramètres app) passent par **Supabase**. Les résumés et analyses textuelles utilisent l'API Google Generative AI (`GEMINI_API_KEY`), avec repli local automatique si quota dépassé.

---

## Fonctionnalités

| Domaine | Détail |
|---------|--------|
| **Scores live** | Tableau de bord avec filtre date (hier / aujourd'hui / demain), ligues (PL, La Liga, Serie A, Bundesliga, LDC, Botola Pro…) |
| **Statut match** | Badge unifié : heure de coup d'envoi, minute en direct, « Full time » |
| **Détail match** | Événements, stats, compositions (effectif en repli), H2H, classement, TV, résumé et duel clé |
| **Recherche** | Équipes, joueurs, compétitions via `/api/search` |
| **Régions** | Europe, Afrique (Botola), Amérique du Sud, Asie |
| **Favoris** | Équipes, ligues, matchs (Supabase) — reprise après connexion |
| **Analyses** | Résumé, analyse tactique, prédictions 1X2 (chargement à la demande, fallback sans IA) |
| **Notifications** | Web Push (Service Worker) + e-mail (Resend) — cron `/api/cron/notify` |
| **Admin** | Dashboard `/admin` : stats, ban utilisateurs, toggle notifications globales, bannière maintenance, cron manuel, broadcast e-mail |
| **UX** | Loader animé Ch'hal Daro (Framer Motion), messages de chargement style football |
| **PWA** | `manifest.json`, mode standalone |
| **CM 2026** | Page dédiée groupes / calendrier |

---

## Stack technique

| Couche | Technologies |
|--------|----------------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4, SWR, Framer Motion, Lucide |
| Backend | Route Handlers Next.js, Server Actions (auth) |
| Données | TheSportsDB v1/v2, normalizers TypeScript |
| Auth / BDD | Supabase (Auth + PostgreSQL + RLS) |
| Analyses | `@google/generative-ai` (gemini-2.0-flash) + fallbacks locaux |
| Push | `web-push` + VAPID |
| E-mail | Resend |
| Hébergement | Vercel (serverless, cron) |

---

## Prérequis

- **Node.js** 20.x ou plus récent
- **npm** 10+
- Comptes (selon les fonctionnalités utilisées) :
  - [TheSportsDB](https://www.thesportsdb.com/api.php) — clé API
  - [Supabase](https://supabase.com) — projet + schéma SQL (`supabase/migrations/`)
  - [Google AI Studio](https://aistudio.google.com) — optionnel, analyses IA
  - [Resend](https://resend.com) — optionnel, e-mails
  - [Vercel](https://vercel.com) — déploiement

---

## Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/aminecharro01/Ch-halDaro.git
cd Ch-halDaro
git checkout v0.1

# 2. Dépendances
npm install

# 3. Variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés

# 4. Supabase — exécuter la migration initiale (voir section suivante)

# 5. (Optionnel) Clés Web Push
npm run vapid

# 6. Lancer en développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

---

## Base de données Supabase

1. Créer un projet sur [Supabase](https://supabase.com).
2. Ouvrir **SQL Editor** et exécuter le fichier :
   ```
   supabase/migrations/000_initial_schema.sql
   ```
3. Renseigner `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local`.
4. Pour le panel admin, définir `ADMIN_EMAILS` (e-mail autorisé, séparés par des virgules).

Guide détaillé : [supabase/README.md](supabase/README.md).

---

## Variables d'environnement

Créer un fichier `.env.local` à la racine (voir `.env.example`).

| Variable | Requis | Description |
|----------|:------:|-------------|
| `THESPORTSDB_KEY` | ✅ | Clé API TheSportsDB |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Clé anonyme Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin / cron | Clé service role (jamais côté client) |
| `ADMIN_EMAILS` | Admin | E-mails admin autorisés (ex. `you@email.com`) |
| `NEXT_PUBLIC_SITE_URL` | Prod | URL publique (`http://localhost:3000` en local) |
| `GEMINI_API_KEY` | — | Résumés, analyses, prédictions |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Push | Clé publique VAPID |
| `VAPID_PRIVATE_KEY` | Push | Clé privée VAPID |
| `VAPID_EMAIL` | Push | Contact VAPID (`mailto:…`) |
| `RESEND_API_KEY` | E-mail | API Resend |
| `EMAIL_FROM` | E-mail | Expéditeur (ex. `Ch'hal Daro <onboarding@resend.dev>`) |
| `CRON_SECRET` | Recommandé | Protège `GET /api/cron/notify` |

> Les fichiers `.env*` sont ignorés par Git. Ne jamais committer de secrets.

---

## Scripts npm

| Commande | Action |
|----------|--------|
| `npm run dev` | Développement (nettoie `.next` puis `next dev`) |
| `npm run build` | Build production |
| `npm run start` | Serveur production (après `build`) |
| `npm run lint` | ESLint |
| `npm run vapid` | Génère une paire de clés VAPID pour le push |

---

## Structure du projet

```
chhalDaro/
├── public/
│   ├── sw.js               # Service Worker (notifications)
│   ├── manifest.json       # PWA
│   └── logo.webp
├── supabase/
│   ├── migrations/         # Schéma SQL (profiles, favorites, push, admin…)
│   └── README.md           # Guide setup Supabase
├── src/
│   ├── app/                # Pages & routes API (App Router)
│   │   ├── page.tsx        # Accueil — scores du jour
│   │   ├── match/[id]/     # Détail match
│   │   ├── league/, team/, region/, player/, tv/
│   │   ├── world-cup-2026/
│   │   ├── admin/          # Panel admin
│   │   ├── login/, profile/, alerts/
│   │   └── api/            # BFF (scores, match, cron, push, admin…)
│   ├── components/
│   │   ├── admin/          # CronTriggerButton…
│   │   ├── match/          # MatchCard, MatchDetailTabs, SquadLineupList…
│   │   ├── team/           # FormGuide
│   │   └── ui/             # ChhalDaroLoader, Sidebar, SearchBar…
│   └── lib/
│       ├── admin/            # require-admin, queries, bootstrap-role
│       ├── api/              # sportsdb.ts, normalizers.ts
│       ├── supabase/         # client, server, queries
│       ├── push/, email/     # webpush, Resend
│       ├── content-fallback.ts # Repli sans Gemini
│       ├── loading-messages.ts
│       ├── match-status.ts, regions.ts, season.ts
│       └── …
├── scripts/generateVapid.js
├── proxy.ts                # Session Supabase + garde admin
├── vercel.json             # Cron quotidien
├── .env.example
└── package.json
```

Alias TypeScript : `@/*` → `./src/*`

---

## Pages principales

| Route | Description |
|-------|-------------|
| `/` | Scores du jour, filtres ligue, sidebar compétitions |
| `/match/[id]` | Détail match (onglets Info, Summary, Events, Stats, Line-ups, H2H, Table, TV) |
| `/league/[id]` | Calendrier, résultats, classement |
| `/team/[id]` | Effectif, forme, résultats saison en cours |
| `/region/[id]` | Ligues par zone géographique |
| `/player/[id]` | Fiche joueur |
| `/world-cup-2026` | Coupe du Monde 2026 |
| `/tv` | Programme TV |
| `/login` | Connexion / inscription |
| `/profile` | Profil et favoris |
| `/alerts` | Notifications push et e-mail |
| `/admin` | Dashboard admin (accès restreint par e-mail) |

---

## API (aperçu)

Routes principales sous `src/app/api/` :

| Route | Rôle |
|-------|------|
| `GET /api/scores?date=` | Matchs du jour |
| `GET /api/match/[id]` | Bundle match |
| `GET /api/match/[id]/summary` | Résumé textuel |
| `GET /api/match/[id]/key-battle` | Duel clé |
| `POST /api/analyze` | Analyse post-match |
| `GET /api/predictions/[id]` | Probabilités 1X2 |
| `GET /api/search?q=` | Recherche |
| `GET/POST/DELETE /api/favorites` | Favoris utilisateur |
| `POST /api/push/subscribe` | Abonnement push |
| `GET /api/cron/notify` | Cron — alertes live (protégé par `CRON_SECRET`) |
| `POST /api/test-notification` | Test alertes |
| `GET /api/admin/stats` | Stats admin |
| `POST /api/admin/cron` | Déclenchement manuel du cron |

Les routes d'analyse exigent une visite préalable de la page match (`X-Match-Visited: 1`). Les notifications push/e-mail redirigent vers la page d'accueil (`/`).

---

## Déploiement Vercel

1. Importer le dépôt [aminecharro01/Ch-halDaro](https://github.com/aminecharro01/Ch-halDaro) sur [Vercel](https://vercel.com/new).
2. Définir la branche de production : **`v0.1`**.
3. Ajouter toutes les [variables d'environnement](#variables-denvironnement) (Production + Preview).
4. Déployer, puis renseigner `NEXT_PUBLIC_SITE_URL` avec l'URL Vercel (`https://….vercel.app`) et **redéployer**.
5. **Supabase** → Authentication → URL Configuration :
   - Site URL : `https://votre-projet.vercel.app`
   - Redirect URLs : `https://votre-projet.vercel.app/**`, `https://votre-projet.vercel.app/auth/callback`

| Paramètre Vercel | Valeur |
|------------------|--------|
| Framework | Next.js |
| Build Command | `npm run build` |
| Install Command | `npm install` |
| Node.js | 20.x |

Le cron (`vercel.json`) appelle `/api/cron/notify` une fois par jour (plan Hobby). Pour des alertes plus fréquentes : plan Pro ou ping externe avec `Authorization: Bearer <CRON_SECRET>`.

---

## Licence

MIT — projet académique EMSI.
