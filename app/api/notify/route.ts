import { NextResponse } from 'next/server';
import webpush from 'web-push';
import fs from 'fs';
import path from 'path';
import os from 'os';

const tmpDir = os.tmpdir();
const filePath = path.join(tmpDir, 'subscriptions.json');

// Need a contact email for VAPID config
webpush.setVapidDetails(
  'mailto:hello@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export async function GET() {
  try {
    let subs: any[] = [];
    
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { createClient } = await import('@/lib/supabase/server');
      const { getEventsByDay, getMatchTimeline } = await import('@/lib/thesportsdb');
      const supabase = await createClient();
      
      const today = new Date().toISOString().split('T')[0];
      const matches = await getEventsByDay(today).catch(() => []);
      
      // Filter for live matches. TSDB status for live is often '1H', '2H', 'HT', or 'Live'
      const liveMatches = matches.filter((m: any) =>
        ['1H', '2H', 'HT', 'LIVE', 'Live'].includes(m.strStatus)
      ) as any[];
      
      const { data: dbSubs } = await supabase.from('subscriptions').select('subscription, user_id, prefs');
      
      let sent = 0;
      if (dbSubs && liveMatches.length > 0) {
        // Fetch all favorites
        const { data: allFavs } = await supabase.from('favorites').select('user_id, item_id, item_type');
        
        for (const match of liveMatches) {
          const matchId = String(match.idEvent ?? '');
          if (!matchId) continue;
          const timeline = await getMatchTimeline(matchId).catch(() => []);

          for (const event of timeline) {
            const eventTime = parseInt(event.intTime);
            const matchElapsed = parseInt(match.strProgress) || 0;
            const isRecent = matchElapsed - eventTime <= 5;

            if (isRecent) {
              const eventType = event.strTimeline?.toLowerCase() || "";
              const isGoal = eventType.includes("goal");
              const isCard = eventType.includes("card");
              const isVar = eventType.includes("var");
              const isPenalty = eventType.includes("penalty");
              const isKickoff = eventType.includes("kick") && !isGoal && !isPenalty;
              const isSub = eventType.includes("subst");

              if (isGoal || isCard || isVar || isPenalty || isKickoff || isSub) {
                let title = "⚽ BUT !!!";
                let body = `${match.strEvent} (${event.intTime}'): ${event.strPlayer}`;
                
                if (isGoal) {
                  title = "⚽ BUT !!!";
                  if (event.strAssist) body += ` (Assist: ${event.strAssist})`;
                } else if (isCard) {
                  const isYellow = eventType.includes("yellow");
                  title = isYellow ? "🟨 CARTON JAUNE" : "🟥 CARTON ROUGE !";
                } else if (isPenalty) {
                  title = "⚠️ PÉNALTY !";
                } else if (isVar) {
                  title = "🖥️ VAR Check";
                  if (event.strTimelineDetail) body += ` - ${event.strTimelineDetail}`;
                } else if (isSub) {
                  title = "🔄 CHANGEMENT";
                  body = `${match.strEvent} (${event.intTime}'): ${event.strPlayer} (${event.strTimelineDetail || 'In'})`;
                } else if (isKickoff) {
                  title = "⏱️ Match Started";
                  body = `C'est parti pour ${match.strEvent} !`;
                }

                const payload = JSON.stringify({ title, body });

                // Find users who favorite this match's teams, league, or the match itself
                const relevantUsers = dbSubs.filter(sub => {
                  const userFavs = allFavs?.filter(f => f.user_id === sub.user_id) || [];
                  const isFavorite = userFavs.some(f => 
                    (f.item_type === 'team' && (f.item_id === match.idHomeTeam || f.item_id === match.idAwayTeam)) ||
                    (f.item_type === 'league' && f.item_id === match.idLeague) ||
                    (f.item_type === 'match' && f.item_id === matchId)
                  );

                  if (!isFavorite) return false;

                  // Check user preferences
                  const userPrefs = sub.prefs || { goals: true, cards: true, yellow_cards: false, penalties: true, var: true, kickoff: true };
                  
                  if (isGoal && !userPrefs.goals) return false;
                  if (isPenalty && !userPrefs.penalties) return false;
                  if (isVar && !userPrefs.var) return false;
                  if (isKickoff && !userPrefs.kickoff) return false;
                  
                  if (isCard) {
                    const isYellow = eventType.includes("yellow");
                    if (isYellow && !userPrefs.yellow_cards) return false;
                    if (!isYellow && !userPrefs.cards) return false; // Red card
                  }

                  return true;
                });

                for (const sub of relevantUsers) {
                  try {
                    await webpush.sendNotification(sub.subscription, payload);
                    sent++;
                  } catch (e) {
                    console.error("Push failed", e);
                  }
                }
              }
            }
          }
        }
        return NextResponse.json({ success: true, sent });
      }
    }

    // Fallback if no Supabase configured
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ status: 'No active subscriptions found' });
    }
    
    subs = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (subs.length === 0) return NextResponse.json({ status: 'Empty subscriptions' });

    const payload = JSON.stringify({ 
      title: '⚽ Action update!', 
      body: `Live update check complete via Vercel Cron.`
    });
    
    let sent = 0;
    for (const sub of subs) {
      try {
        await webpush.sendNotification(sub, payload);
        sent++;
      } catch (e) {
        console.error("Push failed for sub", e);
      }
    }
    
    return NextResponse.json({ success: true, sent });
  } catch (err: any) {
    console.error("Notify Error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
