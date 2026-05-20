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
