import { NextRequest, NextResponse } from 'next/server';
import { sendPush } from '@/lib/push/webpush';
import { sendEmail, matchAlertEmailHtml } from '@/lib/email/send';
import { createClient } from '@/lib/supabase/server';
import { TEST_ALERT_DELAY_MS } from '@/lib/test-alerts';

const TEST_ALERTS = [
  { key: 'goals', title: 'GOAL!', body: 'Test: Mbappé scores for France! (2-1)' },
  { key: 'cards', title: 'Red card', body: 'Test: Player sent off in the 67th minute' },
  { key: 'yellow_cards', title: 'Yellow card', body: 'Test: Booking for tactical foul' },
  { key: 'penalties', title: 'Penalty', body: 'Test: Penalty awarded after VAR review' },
  { key: 'var', title: 'VAR review', body: 'Test: VAR checking a possible offside' },
  { key: 'kickoff', title: 'Kick-off', body: 'Test: Match has started — enjoy the game!' },
] as const;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function emailSkipReason(userEmail: string | null, includeEmail: boolean): string | null {
  if (!includeEmail) return 'Email tests disabled in request';
  if (!process.env.RESEND_API_KEY) return 'RESEND_API_KEY is not set in .env.local';
  if (!userEmail) return 'Log in so we can send tests to your account email';
  return null;
}

/** Send one alert type (used by client with delays between calls). */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const providedSub = body.subscription;
    const includeEmail = body.includeEmail !== false;
    const alertKey = body.alertKey as string | undefined;
    const sendAll = body.sendAll === true;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userEmail: string | null = user?.email ?? null;

    let subs: { subscription_json?: string }[] = [];

    if (providedSub?.endpoint) {
      subs = [{ subscription_json: JSON.stringify(providedSub) }];
    } else if (user) {
      const { data: dbSubs } = await supabase
        .from('push_subscriptions')
        .select('subscription_json, endpoint')
        .eq('user_id', user.id);

      if (!dbSubs?.length) {
        return NextResponse.json(
          { error: 'No subscription found. Enable notifications first.' },
          { status: 404 }
        );
      }
      subs = dbSubs;
    } else {
      return NextResponse.json({ error: 'Unauthorized — log in or pass subscription' }, { status: 401 });
    }

    const alertsToSend = sendAll
      ? [...TEST_ALERTS]
      : alertKey
        ? TEST_ALERTS.filter((a) => a.key === alertKey)
        : TEST_ALERTS.slice(0, 1);

    if (alertsToSend.length === 0) {
      return NextResponse.json({ error: 'Unknown alert type' }, { status: 400 });
    }

    let pushSent = 0;
    let emailsSent = 0;
    const results: { type: string; push: boolean; email: boolean; emailError?: string }[] = [];
    const skipEmailReason = emailSkipReason(userEmail, includeEmail);

    for (let i = 0; i < alertsToSend.length; i++) {
      const alert = alertsToSend[i];
      let pushOk = false;
      let emailOk = false;

      for (const row of subs) {
        const sub = row.subscription_json ? JSON.parse(row.subscription_json) : row;
        const ok = await sendPush(sub, {
          title: `[Test] ${alert.title}`,
          body: alert.body,
          url: '/alerts',
          tag: `test-${alert.key}-${Date.now()}`,
        });
        if (ok) pushOk = true;
      }
      if (pushOk) pushSent++;

      if (includeEmail && userEmail && process.env.RESEND_API_KEY) {
        emailOk = await sendEmail({
          to: userEmail,
          subject: `[Test] ${alert.title}`,
          html: matchAlertEmailHtml(alert.title, alert.body, '/alerts'),
        });
        if (emailOk) emailsSent++;
      }

      results.push({
        type: alert.key,
        push: pushOk,
        email: emailOk,
        emailError: emailOk ? undefined : skipEmailReason || 'Send failed',
      });

      if (sendAll && i < alertsToSend.length - 1) {
        await delay(TEST_ALERT_DELAY_MS);
      }
    }

    return NextResponse.json({
      success: true,
      pushSent,
      emailsSent,
      emailConfigured: Boolean(process.env.RESEND_API_KEY),
      userEmail: userEmail ? `${userEmail.slice(0, 3)}***` : null,
      emailSkipReason: skipEmailReason,
      results,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Test failed';
    console.error('Test notification error', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
