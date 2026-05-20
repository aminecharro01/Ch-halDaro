# Documentation — Ch'hal Daro

Index de la documentation du projet **v0.1.0** (branche [`v0.1`](https://github.com/aminecharro01/Ch-halDaro/tree/v0.1)).

Pour l’installation, les variables d’environnement et le déploiement rapide, voir le [README principal](../README.md) à la racine du dépôt.

---

## Documents

| Document | Public | Description |
|----------|--------|-------------|
| [RAPPORT_ACADEMIQUE.md](./RAPPORT_ACADEMIQUE.md) | Académique | Rapport complet : contexte, architecture, UML, API, sécurité, **déploiement Vercel (§16)** |
| [RAPPORT_PROJET.md](./RAPPORT_PROJET.md) | Synthèse | Présentation projet et diagrammes |
| [SPRINTS_PROGRESS.md](./SPRINTS_PROGRESS.md) | Suivi | Checklist des sprints et correctifs |
| [AGENTS.md](./AGENTS.md) | Développement | Règles Next.js 16 pour Cursor / agents |

---

## Référence rapide

### Installation locale

```bash
npm install
cp ../.env.example ../.env.local
npm run dev
```

### Variables d'environnement

| Variable | Requis |
|----------|:------:|
| `THESPORTSDB_KEY` | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ |
| `GEMINI_API_KEY` | optionnel |
| `NEXT_PUBLIC_SITE_URL` | prod |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_EMAIL` | push |
| `RESEND_API_KEY` / `EMAIL_FROM` | e-mail |
| `CRON_SECRET` | recommandé |

```bash
npm run vapid   # depuis la racine du projet
```

### Déploiement Vercel

1. Branche de production : **`v0.1`**
2. Variables : identiques au [README](../README.md#variables-denvironnement)
3. Après deploy : `NEXT_PUBLIC_SITE_URL` + URLs Supabase Auth
4. Détail : [RAPPORT_ACADEMIQUE.md §16.3–16.4](./RAPPORT_ACADEMIQUE.md)

---

## Licence

MIT
