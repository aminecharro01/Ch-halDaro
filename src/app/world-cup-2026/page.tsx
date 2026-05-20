import { sportsDB } from '@/lib/api/sportsdb';
import { mapStandings, mapMatch } from '@/lib/api/normalizers';
import Image from 'next/image';
import Link from 'next/link';
import { Trophy, MapPin, Calendar } from 'lucide-react';
import {
  WC_LEAGUE_ID,
  WC_SEASON,
  WC_GROUPS,
  WC_KNOCKOUT_ROUNDS,
  WC_HOST_CITIES,
  WC_GROUP_STAGE_DATES,
} from '@/lib/world-cup-2026-schedule';

export default async function WorldCup() {
  const leagueRaw = await sportsDB.getLeagueDetails(WC_LEAGUE_ID).catch(() => null);
  const league = Array.isArray(leagueRaw) ? leagueRaw[0] : leagueRaw;

  const logo = league?.strBadge || league?.strLogo || '';
  const poster = league?.strPoster || league?.strFanart1 || '';
  const banner = league?.strBanner || league?.strFanart || '';

  let standings: unknown[][] = [];
  try {
    const data = await sportsDB.getLeagueStandings(WC_LEAGUE_ID, WC_SEASON);
    const tableData = Array.isArray(data) ? data : [];
    if (tableData.length > 0) {
      const rawStandings = mapStandings(tableData);
      const groupsMap: Record<string, unknown[]> = {};
      rawStandings.forEach((row) => {
        const group = row.group || 'Group A';
        if (!groupsMap[group]) groupsMap[group] = [];
        groupsMap[group].push(row);
      });
      standings = Object.values(groupsMap);
    }
  } catch (e) {
    console.error('Failed to fetch WC standings', e);
  }

  let fixtures: ReturnType<typeof mapMatch>[] = [];
  try {
    const data = await sportsDB.getLeagueFixtures(WC_LEAGUE_ID);
    const eventData = Array.isArray(data) ? data : [];
    fixtures = eventData.map(mapMatch).filter(Boolean) as ReturnType<typeof mapMatch>[];
    fixtures.sort(
      (a, b) =>
        new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
    );
  } catch (e) {
    console.error('Failed to fetch WC fixtures', e);
  }

  const groupsFromApi =
    standings.length > 0
      ? standings
      : WC_GROUPS.map((g) =>
          g.teams.map((name) => ({
            team: { name, logo: null },
            points: 0,
            goalsDiff: 0,
            group: g.label,
          }))
        );

  return (
    <div className="space-y-10 animate-fade-up pb-16">
      {/* Hero with SportsDB branding */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-800/40 min-h-[220px]">
        {banner ? (
          <img src={banner} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-indigo-950/90 to-blue-950" />
        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          {logo ? (
            <Image
              src={logo}
              alt="FIFA World Cup 2026"
              width={120}
              height={120}
              className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-2xl"
            />
          ) : (
            <Trophy className="w-20 h-20 text-yellow-400" />
          )}
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
              FIFA World Cup 2026
            </h1>
            <p className="text-blue-300 font-medium mt-2">
              USA · Canada · Mexico — {WC_GROUP_STAGE_DATES}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-xs font-bold text-white/60 uppercase tracking-widest">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> 48 teams · 12 groups
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> 16 host cities
              </span>
            </div>
          </div>
          {poster ? (
            <Image
              src={poster}
              alt="World Cup poster"
              width={200}
              height={280}
              className="hidden lg:block w-40 rounded-xl border border-white/10 shadow-2xl object-cover"
            />
          ) : null}
        </div>
      </div>

      {/* Official group stage (schedule reference) */}
      <section>
        <h2 className="text-xl font-bold text-gray-200 mb-2 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" /> Group stage
        </h2>
        <p className="text-sm text-gray-500 mb-6">{WC_GROUP_STAGE_DATES}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {WC_GROUPS.map((g) => (
            <div
              key={g.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4"
            >
              <h3 className="font-bold text-blue-400 mb-3 border-b border-gray-800 pb-2">
                {g.label}
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                {g.teams.map((team, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-5 text-center text-gray-600 font-mono text-xs">
                      {i + 1}
                    </span>
                    {team}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Live standings from API when available */}
      {standings.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-200 mb-6">Live standings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {groupsFromApi.map((group: unknown[], idx: number) => {
              const groupName =
                (group[0] as { group?: string })?.group ||
                WC_GROUPS[idx]?.label ||
                `Group ${String.fromCharCode(65 + idx)}`;
              return (
                <div
                  key={idx}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4"
                >
                  <h3 className="font-bold text-gray-400 mb-3 border-b border-gray-800 pb-2">
                    {groupName}
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {(group as { team: { name: string; logo?: string }; points: number; goalsDiff: number }[]).map(
                      (row, i) => (
                        <li
                          key={i}
                          className="flex justify-between items-center text-gray-300"
                        >
                          <div className="flex items-center gap-2">
                            {row.team.logo && (
                              <Image
                                src={row.team.logo}
                                alt=""
                                width={16}
                                height={16}
                                className="w-4 h-4 object-contain"
                              />
                            )}
                            <span>{row.team.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-gray-500 text-xs w-6 text-right">
                              {row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}
                            </span>
                            <span className="font-bold w-6 text-right">{row.points}</span>
                          </div>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Knockout calendar */}
      <section>
        <h2 className="text-xl font-bold text-gray-200 mb-6">Knockout phase</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {WC_KNOCKOUT_ROUNDS.map((round) => (
            <div
              key={round.phase}
              className="bg-gray-900/60 border border-white/5 rounded-2xl p-5"
            >
              <h3 className="font-black text-white uppercase tracking-widest text-sm">
                {round.label}
              </h3>
              <p className="text-gray-500 text-sm mt-2">{round.dates}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Host cities */}
      <section>
        <h2 className="text-xl font-bold text-gray-200 mb-4">Host cities</h2>
        <div className="flex flex-wrap gap-2">
          {WC_HOST_CITIES.map((city) => (
            <span
              key={city}
              className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-full text-xs font-bold text-gray-400"
            >
              {city}
            </span>
          ))}
        </div>
      </section>

      {/* Fixtures from SportsDB */}
      <section>
        <h2 className="text-xl font-bold text-gray-200 mb-6">Fixtures</h2>
        {fixtures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fixtures.map((match) => (
              <Link
                key={match.fixture.id}
                href={`/match/${match.fixture.id}`}
                className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-blue-500/30 transition"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {match.teams.home.logo && (
                    <Image src={match.teams.home.logo} alt="" width={24} height={24} />
                  )}
                  <span className="text-sm font-bold truncate">{match.teams.home.name}</span>
                </div>
                <div className="text-center shrink-0 px-2">
                  <div className="text-xs text-gray-500 tabular-nums">
                    {new Date(match.fixture.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="text-[10px] font-bold text-gray-600">
                    {new Date(match.fixture.date).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                  <span className="text-sm font-bold truncate">{match.teams.away.name}</span>
                  {match.teams.away.logo && (
                    <Image src={match.teams.away.logo} alt="" width={24} height={24} />
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center border-dashed text-gray-500">
            Fixtures will appear when TheSportsDB publishes WC 2026 events.
          </div>
        )}
      </section>
    </div>
  );
}
