import { NextResponse } from 'next/server';
import { sportsDB } from '@/lib/api/sportsdb';
import { getLiveMatchStates, updateMatchState, getSubscribersForMatch, deleteExpiredSubscription } from '@/lib/supabase/queries';
import { sendPush } from '@/lib/push/webpush';
import { sendEmail, matchAlertEmailHtml } from '@/lib/email/send';
import { fetchAppSettings } from '@/lib/admin/queries';

export async function GET(req: Request) {
  try {
    // 1. Verify Vercel Cron Secret (if set)
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const settings = await fetchAppSettings();
    if (!settings.notifications_enabled) {
      return NextResponse.json({ success: true, disabled: true, reason: 'notifications disabled by admin' });
    }

    console.log('[Cron] Checking for live match updates...');

    // 2. Fetch live matches from API
    const liveMatches = await sportsDB.getLiveMatches();
    if (!liveMatches || liveMatches.length === 0) {
      return NextResponse.json({ status: 'No live matches found' });
    }

    // 3. Fetch stored snapshots from Supabase
    const storedStates = await getLiveMatchStates();
    const storedMap = new Map(storedStates.map(s => [s.event_id, s]));

    let notificationsSent = 0;

    // 4. Process each live match for DELTA detection
    for (const matchData of liveMatches) {
      const matchId = String(matchData.idEvent);
      
      // Fetch full details and timeline for this match to get the latest state
      // Note: In production with many matches, you might want to optimize this
      const [details, timeline] = await Promise.all([
        sportsDB.getMatchDetails(matchId),
        sportsDB.getMatchTimeline(matchId)
      ]);

      if (!details) continue;

      const stored = storedMap.get(matchId);
      const currentTimelineCount = timeline.length;
      
      // Delta detection logic
      const hasGoal = !stored || 
                      details.goals.home !== stored.home_score || 
                      details.goals.away !== stored.away_score;
      
      const hasNewEvent = !stored || currentTimelineCount > (stored.timeline_count || 0);

      if (hasGoal || hasNewEvent) {
        console.log(`[Cron] Delta detected for ${details.teams.home.name} vs ${details.teams.away.name}`);

        // Construct notification payload based on the newest event
        const latestEvent = timeline[0]; // Assuming normalizer sorts descending or we take index 0
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

        // 5. Send push / email to relevant subscribers
        const subscribers = await getSubscribersForMatch(details);
        for (const sub of subscribers) {
          let prefs: Record<string, unknown> = {};
          try {
            prefs = typeof sub.alert_prefs === 'object' && sub.alert_prefs ? sub.alert_prefs : {};
          } catch {
            prefs = {};
          }

          const success = await sendPush(JSON.parse(sub.subscription_json), {
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

        // 6. Update snapshot in Supabase
        await updateMatchState(matchId, {
          ...details,
          timeline_count: currentTimelineCount
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: liveMatches.length,
      notificationsSent 
    });

  } catch (error: any) {
    console.error('[Cron Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
