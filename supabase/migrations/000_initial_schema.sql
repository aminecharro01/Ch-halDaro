-- =============================================================================
-- Ch'hal Daro — Full Supabase setup (run once in SQL Editor)
-- Creates: profiles, favorites, push_subscriptions, match_states, app_settings
--          + user RLS + admin role + admin policies
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. PROFILES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  birthdate date,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_banned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false;

-- Backfill profiles for existing auth users (if any signed up before this script)
INSERT INTO public.profiles (id, first_name, last_name, role)
SELECT u.id, '', '', 'user'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- Auto-create profile on new signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (NEW.id, '', '', 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 2. FAVORITES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  item_id text NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('team', 'league', 'match')),
  item_name text,
  item_logo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id, item_type)
);

CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites (user_id);

-- -----------------------------------------------------------------------------
-- 3. PUSH SUBSCRIPTIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  endpoint text PRIMARY KEY,
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  subscription_json text NOT NULL,
  alert_prefs jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON public.push_subscriptions (user_id);

-- -----------------------------------------------------------------------------
-- 4. MATCH STATES (cron delta detection — server-side only)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.match_states (
  event_id text PRIMARY KEY,
  home_score integer NOT NULL DEFAULT 0,
  away_score integer NOT NULL DEFAULT 0,
  minute integer,
  status text,
  timeline_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 5. APP SETTINGS (admin)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users (id)
);

INSERT INTO public.app_settings (key, value)
VALUES
  ('maintenance_mode', 'false'::jsonb),
  ('banner_message', '""'::jsonb),
  ('notifications_enabled', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 6. ADMIN HELPERS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.prevent_self_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role AND NOT public.is_admin() THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_role_guard ON public.profiles;
CREATE TRIGGER profiles_role_guard
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_role_change();

-- -----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY — PROFILES
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;
CREATE POLICY "Admins read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins update any profile" ON public.profiles;
CREATE POLICY "Admins update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY — FAVORITES
-- -----------------------------------------------------------------------------
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own favorites" ON public.favorites;
CREATE POLICY "Users read own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own favorites" ON public.favorites;
CREATE POLICY "Users insert own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own favorites" ON public.favorites;
CREATE POLICY "Users update own favorites"
  ON public.favorites FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own favorites" ON public.favorites;
CREATE POLICY "Users delete own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin read all favorites" ON public.favorites;
CREATE POLICY "Admin read all favorites"
  ON public.favorites FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin delete favorites" ON public.favorites;
CREATE POLICY "Admin delete favorites"
  ON public.favorites FOR DELETE
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY — PUSH SUBSCRIPTIONS
-- -----------------------------------------------------------------------------
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone insert push subscription" ON public.push_subscriptions;
CREATE POLICY "Anyone insert push subscription"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users read own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users read own push subscriptions"
  ON public.push_subscriptions FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users update own push subscriptions"
  ON public.push_subscriptions FOR UPDATE
  USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users delete own push subscriptions"
  ON public.push_subscriptions FOR DELETE
  USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin read push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Admin read push subscriptions"
  ON public.push_subscriptions FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin delete push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Admin delete push subscriptions"
  ON public.push_subscriptions FOR DELETE
  USING (public.is_admin());

-- Cron reads all subscriptions (server routes without user session)
DROP POLICY IF EXISTS "Service read all push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Service read all push subscriptions"
  ON public.push_subscriptions FOR SELECT
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service read all favorites" ON public.favorites;
CREATE POLICY "Service read all favorites"
  ON public.favorites FOR SELECT
  USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- 10. MATCH STATES — no RLS (cron uses anon/server client)
-- -----------------------------------------------------------------------------
ALTER TABLE public.match_states DISABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 11. APP SETTINGS RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone read app_settings" ON public.app_settings;
CREATE POLICY "Anyone read app_settings"
  ON public.app_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin write app_settings" ON public.app_settings;
CREATE POLICY "Admin write app_settings"
  ON public.app_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Service write app_settings" ON public.app_settings;
CREATE POLICY "Service write app_settings"
  ON public.app_settings FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- 12. BOOTSTRAP ADMIN
-- -----------------------------------------------------------------------------
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE lower(email) = lower('aminecharro@gmail.com')
);

-- If admin signed up before profiles existed, ensure row exists then promote
INSERT INTO public.profiles (id, first_name, last_name, role)
SELECT u.id, '', '', 'admin'
FROM auth.users u
WHERE lower(u.email) = lower('aminecharro@gmail.com')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
