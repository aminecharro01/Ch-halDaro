# Ch'hal Daro — Documentation

Application web de scores football (Next.js 16, React 19, TheSportsDB, Supabase).

| Document | Description |
|----------|-------------|
| [RAPPORT_ACADEMIQUE.md](./RAPPORT_ACADEMIQUE.md) | Rapport académique complet (v0.1) |
| [RAPPORT_PROJET.md](./RAPPORT_PROJET.md) | Rapport projet synthétique |
| [AUDIT_AVANT_IMPLEMENTATION.md](./AUDIT_AVANT_IMPLEMENTATION.md) | Audit technique |
| [SPRINTS_PROGRESS.md](./SPRINTS_PROGRESS.md) | Suivi des sprints |
| [AGENTS.md](./AGENTS.md) | Règles Next.js pour les agents |

## Démarrage local

```bash
npm install
npm run dev
```

## Variables d'environnement (`.env.local`)

| Variable | Obligatoire | Usage |
|----------|-------------|--------|
| `THESPORTSDB_KEY` | Oui | Données sportives |
| `NEXT_PUBLIC_SUPABASE_URL` | Oui | Auth + base |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Oui | Auth + base |
| `GEMINI_API_KEY` | Non | Résumés, analyses, prédictions |
| `NEXT_PUBLIC_SITE_URL` | Prod | Callbacks auth |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Push | Notifications |
| `VAPID_PRIVATE_KEY` | Push | Notifications |
| `VAPID_EMAIL` | Push | `mailto:…` |
| `RESEND_API_KEY` | E-mail | Alertes e-mail |
| `EMAIL_FROM` | E-mail | Expéditeur Resend |
| `CRON_SECRET` | Recommandé | Sécurise `/api/cron/notify` |

```bash
npm run vapid   # génère NEXT_PUBLIC_VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY
```

## Déploiement Vercel (branche `v0.1`)

1. Importer `https://github.com/aminecharro01/Ch-halDaro` sur Vercel.
2. **Production Branch** = `v0.1`.
3. Coller les variables ci-dessus dans **Settings → Environment Variables**.
4. Après le premier déploiement, définir `NEXT_PUBLIC_SITE_URL` sur l’URL Vercel et redéployer.
5. Configurer les redirect URLs Supabase avec la même URL.

Voir la section **16.3–16.4** du [rapport académique](./RAPPORT_ACADEMIQUE.md) pour le détail.

## Licence

MIT
