import { createClient } from './server';
import { createServiceClient } from './admin';

async function db() {
  return createServiceClient() || (await createClient());
}

export async function getLiveMatchStates() {
  const supabase = await db();
  const { data } = await supabase.from('match_states').select('*');
  return data || [];
}

export async function updateMatchState(eventId: string, state: {
  goals: { home: number; away: number };
  fixture: { status: { elapsed?: number; short?: string } };
  timeline_count: number;
}) {
  const supabase = await db();
  const { error } = await supabase.from('match_states').upsert({
    event_id: eventId,
    home_score: state.goals.home,
    away_score: state.goals.away,
    minute: state.fixture.status.elapsed,
    status: state.fixture.status.short,
    timeline_count: state.timeline_count,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error('Supabase updateMatchState Error:', error);
}

export async function getSubscribersForMatch(match: {
  teams: { home: { id: number }; away: { id: number } };
  league: { id: number };
  fixture: { id: number };
}) {
  const supabase = await db();

  const { data: favorites } = await supabase.from('favorites').select('user_id').or(
    `and(item_type.eq.team,item_id.eq.${match.teams.home.id}),` +
      `and(item_type.eq.team,item_id.eq.${match.teams.away.id}),` +
      `and(item_type.eq.league,item_id.eq.${match.league.id}),` +
      `and(item_type.eq.match,item_id.eq.${match.fixture.id})`
  );

  if (!favorites || favorites.length === 0) return [];

  const userIds = [...new Set(favorites.map((f) => f.user_id))];

  const { data: subs } = await supabase.from('push_subscriptions').select('*').in('user_id', userIds);

  return subs || [];
}

export async function deleteExpiredSubscription(endpoint: string) {
  const supabase = await db();
  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
}
