# Suivi d'implémentation — Ch'hal Daro

**Dernière mise à jour :** 2026-05-19  
**Statut global :** ✅ Sprints 0–4 implémentés  
**Point d'arrêt actuel :** Build production OK — prêt pour tests manuels

---

## Légende

- [x] Terminé
- [ ] À faire (manuel / hors scope)

---

## Sprint 0 — Préparation

- [ ] Valider clé TheSportsDB premium (**manuel — équipe**)
- [x] Créer `.env.example` à jour
- [x] Copier spec OpenAPI → `docs/thesportsdb-openapi.yaml`
- [x] Fichier de suivi `Doc/SPRINTS_PROGRESS.md`

---

## Sprint 1 — Stabilisation (P0)

- [x] Étendre `/api/push/subscribe` (GET/POST/DELETE + prefs) + alias `/api/subscribe`
- [x] Corriger `vercel.json` → `/api/cron/notify`
- [x] Fix `normalizeStats` V1 + V2
- [x] Fix `EventTimeline` (schéma normalisé)
- [x] Fix mapping statuts (`status-map.ts` + `normalizeMatch`)
- [x] Fix régions (casse URL sidebar + API)
- [x] Remplacer `event_media` → `event_highlights`
- [x] Fix `test-notification` table `push_subscriptions`
- [x] Page `auth/auth-code-error`

---

## Sprint 2 — Données & UX (P1)

- [x] Fix `FormGuide` + route `team-results`
- [x] Fix `MatchAnalysis` + `/api/analyze`
- [x] Enrichir `normalizeMatch` (description, spectators, official, season, media)
- [x] Lineup remplaçants (bench) dans `MatchDetailTabs`
- [x] Stats dynamiques (toutes) dans `MatchDetailTabs`
- [x] Table classement complète (W/D/L/GD)
- [x] SWR refresh live sur page match (30s si live)
- [x] Retirer mock top scorers ligue
- [x] Lazy-load analyse match (`/api/match/[id]/analysis`, retiré du GET bundle)
- [x] Fix `analysis-engine` prompts (schéma events)

---

## Sprint 3 — Enrichissement API

- [x] Route `/api/tv` + page `/tv`
- [x] Route `/api/search` + `SearchBar` header
- [x] Saisons ligue (`getLeagueSeasons` dans API league)
- [x] Routes `team-results` + `team-fixtures` séparées
- [x] Page `/player/[id]` + `/api/player/[id]`
- [x] Sidebar lien TV ce soir

---

## Sprint 4 — Polish & prod

- [x] Supprimer code mort (`api-football.ts`, `v2-standings-from-schedule.ts`, `AISummary.tsx`)
- [x] `npm run build` sans erreur ✅
- [ ] `npm run lint` — warnings/errors préexistants `any` (non bloquant build)
- [ ] Tests automatisés normalizers (optionnel)
- [ ] i18n FR complet (partiel : prompts d’analyse en français)

---

## Checklist finale (merge)

### Fonctionnel
- [x] Alerts : routes `/api/subscribe` opérationnelles
- [x] Cron `/api/cron/notify` dans vercel.json
- [x] Onglet Events — schéma corrigé
- [x] Onglet Stats — normalizer V2
- [x] FormGuide — `team-results`
- [x] `/region/europe` — clés harmonisées
- [x] Live badge — statuts `LIVE` inclus

### Code
- [x] Build passe
- [x] Pas d'endpoint `event_media` inventé
- [x] `.env.example` documenté

---

## Journal des sessions

| Date | Sprint | Tâches complétées | Prochaine étape |
|------|--------|-------------------|-----------------|
| 2026-05-19 | 0→4 | Tous sprints code | Tests manuels Alerts + match live en prod |
| 2026-05-19 | — | `npm run build` OK | Configurer `CRON_SECRET` + clé TSDB premium sur Vercel |

---

## Notes Supabase (optionnel)

Pour persister les préférences alerts côté serveur, ajouter la colonne :

```sql
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS alert_prefs jsonb;
```

Sans cette colonne, les prefs restent en `localStorage` (fallback déjà géré).

---

## Fichiers principaux modifiés

| Fichier | Changement |
|---------|------------|
| `src/lib/api/normalizers.ts` | Stats V2, statuts, lineup bench, match enrichi |
| `src/lib/api/sportsdb.ts` | Highlights, search, TV, saisons, player |
| `src/lib/api/status-map.ts` | **Nouveau** |
| `src/app/api/push/subscribe/route.ts` | GET/POST/DELETE |
| `src/app/api/subscribe/route.ts` | **Nouveau** alias |
| `vercel.json` | Cron path corrigé |
| `src/components/match/EventTimeline.tsx` | Schéma normalisé |
| `src/components/ui/SearchBar.tsx` | **Nouveau** |
| `src/app/tv/page.tsx` | **Nouveau** |
| `src/app/player/[id]/page.tsx` | **Nouveau** |
