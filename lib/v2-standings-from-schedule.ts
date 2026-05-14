/**
 * Build league-table rows from V2 `schedule/league/{idLeague}/{season}` events
 * (OpenAPI — no separate V2 standings endpoint). Output shape matches V1 `lookuptable.php` rows so `mapStandings` still works.
 */

type ScheduleEv = Record<string, unknown>;

function finished(ev: ScheduleEv): boolean {
  const st = String(ev.strStatus || ev.status || '').toUpperCase();
  if (!st) return false;
  if (st.includes('FT') || st.includes('FINISH') || st.includes('FULL TIME')) return true;
  if (st.includes('AET') || st.includes('PEN')) return true;
  if (st.includes('NS') || st.includes('NOT STARTED') || st.includes('SCHEDULED')) return false;
  if (st.includes('LIVE') || st.includes('1H') || st.includes('2H') || st.includes('HT')) return false;
  return false;
}

type Acc = {
  id: number;
  strTeam: string;
  strBadge: string;
  played: number;
  win: number;
  draw: number;
  loss: number;
  gf: number;
  ga: number;
  strGroup: string | null;
};

export function standingsRowsFromV2Schedule(events: ScheduleEv[]): Record<string, string | number | null>[] {
  if (!events?.length) return [];
  const map = new Map<number, Acc>();

  const ensure = (id: number, name: string, badge: string, group: string | null) => {
    if (!id) return;
    if (!map.has(id)) {
      map.set(id, {
        id,
        strTeam: name || 'Team',
        strBadge: badge || '',
        played: 0,
        win: 0,
        draw: 0,
        loss: 0,
        gf: 0,
        ga: 0,
        strGroup: group,
      });
    }
  };

  for (const ev of events) {
    const hid = parseInt(String(ev.idHomeTeam ?? ''), 10);
    const aid = parseInt(String(ev.idAwayTeam ?? ''), 10);
    const g = (ev.strGroup as string) || null;
    ensure(hid, String(ev.strHomeTeam || ''), String(ev.strHomeTeamBadge || ''), g);
    ensure(aid, String(ev.strAwayTeam || ''), String(ev.strAwayTeamBadge || ''), g);
    if (!finished(ev)) continue;

    const hs = parseInt(String(ev.intHomeScore ?? ''), 10);
    const aws = parseInt(String(ev.intAwayScore ?? ''), 10);
    if (Number.isNaN(hs) || Number.isNaN(aws)) continue;

    const h = map.get(hid)!;
    const a = map.get(aid)!;
    h.played++;
    a.played++;
    h.gf += hs;
    h.ga += aws;
    a.gf += aws;
    a.ga += hs;
    if (hs > aws) {
      h.win++;
      a.loss++;
    } else if (hs < aws) {
      a.win++;
      h.loss++;
    } else {
      h.draw++;
      a.draw++;
    }
  }

  const sorted = Array.from(map.values()).sort((a, b) => {
    const pa = a.win * 3 + a.draw;
    const pb = b.win * 3 + b.draw;
    if (pb !== pa) return pb - pa;
    const gda = a.gf - a.ga;
    const gdb = b.gf - b.ga;
    if (gdb !== gda) return gdb - gda;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.strTeam.localeCompare(b.strTeam);
  });

  return sorted.map((t, i) => {
    const pts = t.win * 3 + t.draw;
    const gd = t.gf - t.ga;
    return {
      intRank: String(i + 1),
      idTeam: String(t.id),
      strTeam: t.strTeam,
      strBadge: t.strBadge,
      intPoints: String(pts),
      intGoalDifference: String(gd),
      intPlayed: String(t.played),
      intWin: String(t.win),
      intDraw: String(t.draw),
      intLoss: String(t.loss),
      strGroup: t.strGroup,
    };
  });
}
