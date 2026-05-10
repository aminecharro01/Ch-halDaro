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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get this user's subscriptions
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('subscription')
      .eq('user_id', user.id);

    if (!subs || subs.length === 0) {
      return NextResponse.json({ error: 'No subscription found for this user. Please enable notifications first.' }, { status: 404 });
    }

    const payload = JSON.stringify({
      title: '🔔 Test Notification',
      body: 'This is a test notification from Ch\'hal Daro!',
      icon: '/logo.png'
    });

    let sent = 0;
    for (const sub of subs) {
      try {
        await webpush.sendNotification(sub.subscription, payload);
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
