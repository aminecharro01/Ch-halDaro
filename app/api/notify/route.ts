import { NextResponse } from 'next/server';
import webpush from 'web-push';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fetchFootballApi } from '@/lib/api-football';

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
      const supabase = await createClient();
      
      const today = new Date().toISOString().split('T')[0];
      const matches = await fetchFootballApi('/fixtures', { date: today, live: 'all' }).catch(() => []);
      const liveMatches = matches.filter((m: any) => ['1H', '2H', 'HT'].includes(m.fixture.status.short));
      
      const { data: dbSubs } = await supabase.from('subscriptions').select('subscription, user_id');
      
      let sent = 0;
      if (dbSubs && liveMatches.length > 0) {
        // Optimisation: Fetch all favorites at once to avoid N+1 queries
        const { data: allFavs } = await supabase.from('favorites').select('user_id, item_id, type');
        
        for (const row of dbSubs) {
          const userFavs = allFavs?.filter(f => f.user_id === row.user_id) || [];
          const userFavTeams = userFavs.filter(f => f.type === 'team').map(f => f.item_id);
          const userFavLeagues = userFavs.filter(f => f.type === 'league').map(f => f.item_id);
          
          const relevantMatches = liveMatches.filter((m: any) => 
            userFavLeagues.includes(m.league.id) || 
            userFavTeams.includes(m.teams.home.id) || 
            userFavTeams.includes(m.teams.away.id)
          );
          
          if (relevantMatches.length > 0) {
            const match = relevantMatches[0]; // just notify about the first relevant one for simplicity
            const payload = JSON.stringify({ 
              title: `⚽ Match en direct !`, 
              body: `${match.teams.home.name} vs ${match.teams.away.name} - ${match.goals.home ?? 0}:${match.goals.away ?? 0}`
            });
            
            try {
              await webpush.sendNotification(row.subscription, payload);
              sent++;
            } catch (e) {
              console.error("Push failed for sub", e);
            }
          }
        }
        return NextResponse.json({ success: true, sent });
      } else if (dbSubs) {
         return NextResponse.json({ success: true, message: "No relevant live matches for any subscriptions" });
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
