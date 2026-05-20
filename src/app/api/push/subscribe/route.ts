import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const DEFAULT_PREFS = {
  goals: true,
  cards: true,
  yellow_cards: false,
  penalties: true,
  var: true,
  kickoff: true,
  email_alerts: false,
  notify_email: null as string | null,
};

async function getUserSubscription(supabase: Awaited<ReturnType<typeof createClient>>, userId: string | undefined, endpoint?: string) {
  if (endpoint) {
    const { data } = await supabase.from('push_subscriptions').select('*').eq('endpoint', endpoint).maybeSingle();
    return data;
  }
  if (!userId) return null;
  const { data } = await supabase.from('push_subscriptions').select('*').eq('user_id', userId).limit(1).maybeSingle();
  return data;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const row = await getUserSubscription(supabase, user?.id);
    if (!row) {
      return NextResponse.json({ subscribed: false, prefs: DEFAULT_PREFS });
    }

    let prefs = DEFAULT_PREFS;
    try {
      if (row.alert_prefs) {
        prefs = { ...DEFAULT_PREFS, ...row.alert_prefs };
      }
    } catch {
      /* column may not exist */
    }

    return NextResponse.json({ subscribed: true, prefs, endpoint: row.endpoint });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ subscribed: false, prefs: DEFAULT_PREFS, error: message });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subscription, prefs } = body;

    if (!subscription?.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const payload: Record<string, unknown> = {
      user_id: user?.id || null,
      endpoint: subscription.endpoint,
      subscription_json: JSON.stringify(subscription),
    };

    if (prefs) {
      const merged = { ...DEFAULT_PREFS, ...prefs };
      if (user?.email && merged.email_alerts) {
        merged.notify_email = user.email;
      }
      payload.alert_prefs = merged;
    }

    let { error } = await supabase.from('push_subscriptions').upsert(payload, { onConflict: 'endpoint' });

    if (error && String(error.message).includes('alert_prefs')) {
      delete payload.alert_prefs;
      const retry = await supabase.from('push_subscriptions').upsert(payload, { onConflict: 'endpoint' });
      error = retry.error;
    }

    if (error) throw error;

    return NextResponse.json({ success: true, subscribed: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Subscribe failed';
    console.error('Subscribe Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const endpoint = body.endpoint as string | undefined;

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);

    if (error) throw error;

    return NextResponse.json({ success: true, subscribed: false });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unsubscribe failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
