import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server';

webpush.setVapidDetails(
  'mailto:hello@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const providedSub = body.subscription;

    let subs = [];

    if (providedSub) {
      // Use the provided subscription
      subs = [providedSub];
    } else {
      // Fallback to DB
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get this user's subscriptions
      const { data: dbSubs } = await supabase
        .from('subscriptions')
        .select('subscription')
        .eq('user_id', user.id);

      if (!dbSubs || dbSubs.length === 0) {
        return NextResponse.json({ error: 'No subscription found for this user. Please enable notifications first.' }, { status: 404 });
      }

      subs = dbSubs.map(s => s.subscription);
    }

    const payload = JSON.stringify({
      title: '🔔 Test Notification',
      body: 'This is a test notification from Ch\'hal Daro!',
      icon: '/logo.png'
    });

    let sent = 0;
    for (const sub of subs) {
      try {
        // sub is either the object from providedSub or a mapped subscription object from DB
        // In both cases, if we reached here via the maps above, 'sub' IS the subscription object
        await webpush.sendNotification(sub, payload);
        sent++;
      } catch (err) {
        console.error("Test push failed", err);
      }
    }

    return NextResponse.json({ success: true, sent });
  } catch (err: any) {
    console.error("Test notification error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
