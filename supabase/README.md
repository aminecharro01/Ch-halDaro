# Supabase setup — Ch'hal Daro

Run **one** SQL file in the Supabase dashboard when setting up a new project.

## Steps

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project  
2. Go to **SQL Editor** → **New query**  
3. Copy the entire contents of [`migrations/000_initial_schema.sql`](./migrations/000_initial_schema.sql)  
4. Click **Run**

You should see **Success. No rows returned**.

## What it creates

| Table | Purpose |
|-------|---------|
| `profiles` | User profile + `role` (`user` / `admin`) |
| `favorites` | Teams, leagues, matches |
| `push_subscriptions` | Web Push endpoints |
| `match_states` | Live score snapshots for cron |
| `app_settings` | Maintenance banner (admin) |

It also:

- Creates a profile automatically on signup  
- Promotes **aminecharro@gmail.com** to `admin`  
- Enables RLS with user + admin policies  

## After running SQL

Add to `.env.local` (and Vercel):

```env
ADMIN_EMAILS=aminecharro@gmail.com
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Then **log out and log in again** with `aminecharro@gmail.com` → **Admin** link appears in the header.

## Google sign-in (OAuth)

Two different redirect URLs — do not mix them up:

| Where | URL | Example |
|-------|-----|---------|
| **Google Cloud Console** → Authorized redirect URIs | Supabase callback | `https://htaliwzdyrrfehmmqemg.supabase.co/auth/v1/callback` |
| **Supabase** → URL Configuration → Redirect URLs | Your app callback | `http://localhost:3000/auth/callback` |

### Setup steps

1. **Supabase** → **Authentication** → **Providers** → **Google** → enable  
2. **Google Cloud Console** → Credentials → **OAuth 2.0 Client ID** (Web)  
   - **Authorized redirect URIs**: only the Supabase URL above (shown on `/login` in the green box)  
3. Paste **Client ID** + **Client Secret** into Supabase → Save  
4. **Supabase** → **URL Configuration** → **Redirect URLs**:  
   - `http://localhost:3000/auth/callback`  
   - `https://your-production-domain/auth/callback`  
5. `.env.local`: `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

### Common errors

| Error | Cause |
|-------|--------|
| `provider is not enabled` | Google provider off in Supabase |
| `redirect_uri_mismatch` | Wrong URI in **Google** console (used localhost instead of Supabase `/auth/v1/callback`) |

## Troubleshooting

| Error | Fix |
|-------|-----|
| `relation "profiles" does not exist` | Run `000_initial_schema.sql` (not `001_admin_role.sql` alone) |
| No Admin link | Check email matches `ADMIN_EMAILS`, re-login, confirm `profiles.role = 'admin'` in Table Editor |
| Settings won't save | Add `SUPABASE_SERVICE_ROLE_KEY` |

## Optional: alert preferences column

If missing, run:

```sql
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS alert_prefs jsonb;
```

Already included in `000_initial_schema.sql`.
