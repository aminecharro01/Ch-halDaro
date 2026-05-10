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
      );
      
      const { data: dbSubs } = await supabase.from('subscriptions').select('subscription, user_id');
      
      let sent = 0;
      if (dbSubs && liveMatches.length > 0) {
        // Fetch all favorites
        const { data: allFavs } = await supabase.from('favorites').select('user_id, item_id, item_type');
        
        // Cache for seen events in this execution to avoid duplicates across users
        const processedEvents = new Set<string>();

        for (const match of liveMatches) {
          const matchId = match.idEvent;
          const timelineData = await getMatchTimeline(matchId).catch(() => ({ timeline: [] }));
          const timeline = timelineData.timeline || [];

          // Sort by time descending to get newest first if needed, but TSDB usually returns chronological
          // For each event in timeline
          for (const event of timeline) {
            const eventKey = `${matchId}_${event.intTime}_${event.strTimeline}_${event.strPlayer}`;
            
            // In a real app, we'd check a persistent cache here. 
            // For this demo, let's assume we notify about events in the last 5 minutes
            const eventTime = parseInt(event.intTime);
            const matchElapsed = parseInt(match.strProgress) || 0;
            const isRecent = matchElapsed - eventTime <= 5;

            if (isRecent) {
              const eventType = event.strTimeline?.toLowerCase() || "";
              const isGoal = eventType.includes("goal");
              const isCard = eventType.includes("card");
              const isVar = eventType.includes("var");
              const isPenalty = eventType.includes("penalty");

              if (isGoal || isCard || isVar || isPenalty) {
                const title = isGoal ? "⚽ BUT !!!" : isCard ? "🟨 CARTON !" : isVar ? "🖥️ VAR Check" : "⚠️ Pénalty !";
                const body = `${match.strEvent}: ${event.strTimeline} - ${event.strPlayer} (${event.intTime}')`;
                const payload = JSON.stringify({ title, body });

                // Find users who favorite this match's teams or league
                const relevantUsers = dbSubs.filter(sub => {
                  const userFavs = allFavs?.filter(f => f.user_id === sub.user_id) || [];
                  return userFavs.some(f => 
                    (f.item_type === 'team' && (f.item_id === match.idHomeTeam || f.item_id === match.idAwayTeam)) ||
                    (f.item_type === 'league' && f.item_id === match.idLeague)
                  );
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
