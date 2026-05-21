import { sportsDB } from '@/lib/api/sportsdb';
import {
  getLiveMatchStates,
  updateMatchState,
  getSubscribersForMatch,
  deleteExpiredSubscription,
} from '@/lib/supabase/queries';
import { sendPush } from '@/lib/push/webpush';
import { sendEmail, matchAlertEmailHtml } from '@/lib/email/send';
import { fetchAppSettings } from '@/lib/admin/queries';

function parseSubscriptionJson(raw: unknown): PushSubscriptionJSON | null {
  if (!raw) return null;
  if (typeof raw === 'object') return raw as PushSubscriptionJSON;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as PushSubscriptionJSON;
    } catch {
      return null;
    }
  }
  return null;
}

type PushSubscriptionJSON = {
  endpoint: string;
  keys?: { p256dh: string; auth: string };
};

export type NotifyCronResult = {
  success: boolean;
  disabled?: boolean;
  reason?: string;
  status?: string;
  processed?: number;
  notificationsSent?: number;
  error?: string;
};

/** Core cron logic — used by GET /api/cron/notify and admin manual trigger. */
export async function runNotifyCron(): Promise<NotifyCronResult> {
  const settings = await fetchAppSettings();
  if (!settings.notifications_enabled) {
    return { success: true, disabled: true, reason: 'notifications disabled by admin' };
  }

  const liveMatches = await sportsDB.getLiveMatches();
  if (!liveMatches || liveMatches.length === 0) {
    return { success: true, status: 'No live matches found', processed: 0, notificationsSent: 0 };
  }

  const storedStates = await getLiveMatchStates();
  const storedMap = new Map(storedStates.map((s) => [s.event_id, s]));

  let notificationsSent = 0;

  for (const matchData of liveMatches) {
    const matchId = String(matchData.idEvent);

    const [details, timeline] = await Promise.all([
      sportsDB.getMatchDetails(matchId),
      sportsDB.getMatchTimeline(matchId),
    ]);

    if (!details) continue;

    const stored = storedMap.get(matchId);
    const currentTimelineCount = timeline.length;

    const hasGoal =
      !stored ||
      details.goals.home !== stored.home_score ||
      details.goals.away !== stored.away_score;

    const hasNewEvent = !stored || currentTimelineCount > (stored.timeline_count || 0);

    if (!hasGoal && !hasNewEvent) continue;

    const latestEvent = timeline[0];
    let title = 'Live Score Update';
    let body = `${details.teams.home.name} ${details.goals.home} - ${details.goals.away} ${details.teams.away.name}`;

    if (latestEvent) {
      if (latestEvent.type === 'goal') {
        title = 'GOAL!';
        body = `${latestEvent.player} scored for ${latestEvent.team === 'home' ? details.teams.home.name : details.teams.away.name}! (${details.goals.home}-${details.goals.away})`;
      } else if (latestEvent.type === 'redcard') {
        title = 'Red card';
        body = `${latestEvent.player} sent off for ${latestEvent.team === 'home' ? details.teams.home.name : details.teams.away.name}`;
      }
    }

    const homeUrl = '/';
    const subscribers = await getSubscribersForMatch(details);

    for (const sub of subscribers) {
      let prefs: Record<string, unknown> = {};
      try {
        prefs =
          typeof sub.alert_prefs === 'object' && sub.alert_prefs
            ? (sub.alert_prefs as Record<string, unknown>)
            : {};
      } catch {
        prefs = {};
      }

      const subscription = parseSubscriptionJson(sub.subscription_json);
      if (!subscription) {
        console.warn('[Cron] Invalid push subscription_json for', sub.endpoint);
        continue;
      }

      const success = await sendPush(subscription, {
        title,
        body,
        url: homeUrl,
      });

      if (!success) {
        await deleteExpiredSubscription(sub.endpoint);
      } else {
        notificationsSent++;
      }

      const emailTo = prefs.notify_email as string | undefined;
      if (prefs.email_alerts && emailTo) {
        await sendEmail({
          to: emailTo,
          subject: title,
          html: matchAlertEmailHtml(title, body, homeUrl),
        });
      }
    }

    await updateMatchState(matchId, {
      ...details,
      timeline_count: currentTimelineCount,
    });
  }

  return {
    success: true,
    processed: liveMatches.length,
    notificationsSent,
  };
}
