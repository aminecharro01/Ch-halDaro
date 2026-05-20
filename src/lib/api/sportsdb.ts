import {
  normalizeMatch,
  normalizeTimeline,
  normalizeStats,
  normalizeLineup,
  normalizeTeam,
  normalizeHighlights,
} from './normalizers';

const API_KEY = process.env.THESPORTSDB_KEY || '3';
const BASE_V1 = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;
const BASE_V2 = `https://www.thesportsdb.com/api/v2/json`;

class SportsDBClient {
  private async fetchV2(path: string) {
    try {
      const response = await fetch(`${BASE_V2}${path}`, {
        headers: {
          'X-API-KEY': API_KEY,
          Accept: 'application/json',
        },
        next: { revalidate: 60 },
      });
      if (!response.ok) return null;
      const text = await response.text();
      if (!text?.trim()) return null;
      const data = JSON.parse(text);

      const v2RootKeys = ['lookup', 'list', 'search', 'filter', 'schedule', 'livescore', 'all'];
      for (const key of v2RootKeys) {
        if (data && data[key] && Array.isArray(data[key])) return data[key];
      }
      return data;
    } catch (error) {
      console.error(`SportsDB V2 Fetch Failed: ${path}`, error);
      return null;
    }
  }

  private async fetchV1(endpoint: string) {
    try {
      const response = await fetch(`${BASE_V1}/${endpoint}`, {
        next: { revalidate: 60 },
      });
      if (!response.ok) return null;
      const text = await response.text();
      if (!text?.trim()) return null;
      return JSON.parse(text);
    } catch (error) {
      console.error(`SportsDB V1 Fetch Failed: ${endpoint}`, error);
      return null;
    }
  }

  async getLiveMatches(leagueId?: string) {
    const endpoint = leagueId ? `/livescore/${leagueId}` : '/livescore/soccer';
    const data = await this.fetchV2(endpoint);
    return data || [];
  }

  async getMatchDetails(id: string) {
    const data = await this.fetchV2(`/lookup/event/${id}`);
    const event = Array.isArray(data) ? data[0] : data?.event?.[0] || data?.events?.[0];
    return event ? normalizeMatch(event) : null;
  }

  async getMatchTimeline(id: string) {
    const v2Data = await this.fetchV2(`/lookup/event_timeline/${id}`);
    if (v2Data && Array.isArray(v2Data) && v2Data.length > 0) {
      return normalizeTimeline(v2Data);
    }
    const v1Data = await this.fetchV1(`lookuptimeline.php?id=${id}`);
    return normalizeTimeline(v1Data?.timeline || []);
  }

  async getMatchTV(id: string) {
    const data = await this.fetchV2(`/lookup/event_tv/${id}`);
    return Array.isArray(data) ? data : [];
  }

  async getMatchHighlights(id: string) {
    const data = await this.fetchV2(`/lookup/event_highlights/${id}`);
    if (!data) {
      const details = await this.fetchV2(`/lookup/event/${id}`);
      const event = Array.isArray(details) ? details[0] : details;
      if (event) return normalizeHighlights(event);
      return {};
    }
    return normalizeHighlights(data);
  }

  /** @deprecated Use getMatchHighlights */
  async getMatchMedia(id: string) {
    return this.getMatchHighlights(id);
  }

  async getMatchStats(id: string) {
    const v2Data = await this.fetchV2(`/lookup/event_stats/${id}`);
    if (v2Data && Array.isArray(v2Data) && v2Data.length > 0) {
      return normalizeStats(v2Data);
    }
    const v1Data = await this.fetchV1(`lookupeventstats.php?id=${id}`);
    return normalizeStats(v1Data?.eventstats || []);
  }

  async getMatchLineup(id: string) {
    const v2Data = await this.fetchV2(`/lookup/event_lineup/${id}`);
    if (v2Data && Array.isArray(v2Data) && v2Data.length > 0) {
      return normalizeLineup(v2Data);
    }
    const v1Data = await this.fetchV1(`lookuplineup.php?id=${id}`);
    return normalizeLineup(v1Data?.lineup || []);
  }

  async getLeagueStandings(leagueId: string, season: string = '2025-2026') {
    const data = await this.fetchV1(`lookuptable.php?l=${leagueId}&s=${season}`);
    return data?.table || [];
  }

  async getLeagueSeasons(leagueId: string) {
    const data = await this.fetchV2(`/list/seasons/${leagueId}`);
    return Array.isArray(data) ? data : [];
  }

  async getLeagueSchedule(leagueId: string, season: string) {
    const encoded = encodeURIComponent(season);
    const data = await this.fetchV2(`/schedule/league/${leagueId}/${encoded}`);
    return Array.isArray(data) ? data : [];
  }

  async getLeagueFixtures(leagueId: string) {
    return (await this.fetchV2(`/schedule/next/league/${leagueId}`)) || [];
  }

  async getLeagueResults(leagueId: string) {
    return (await this.fetchV2(`/schedule/previous/league/${leagueId}`)) || [];
  }

  async getLeagueDetails(id: string) {
    const data = await this.fetchV2(`/lookup/league/${id}`);
    return Array.isArray(data) ? data[0] : data;
  }

  async getLeagueTeams(id: string) {
    const data = await this.fetchV2(`/list/teams/league/${id}`);
    return Array.isArray(data) ? data : [];
  }

  async getEventsByDay(date: string) {
    const data = await this.fetchV1(`eventsday.php?d=${date}&s=Soccer`);
    return data?.events || [];
  }

  async getTVByDay(date: string) {
    const data = await this.fetchV2(`/filter/tv/day/${date}`);
    return Array.isArray(data) ? data : [];
  }

  async getTVByCountry(country: string) {
    const data = await this.fetchV2(`/filter/tv/country/${encodeURIComponent(country)}`);
    return Array.isArray(data) ? data : [];
  }

  async getTeam(id: string) {
    const data = await this.fetchV2(`/lookup/team/${id}`);
    const team = Array.isArray(data) ? data[0] : data?.teams?.[0] || null;
    return normalizeTeam(team);
  }

  async getTeamFixtures(id: string) {
    const data = await this.fetchV2(`/schedule/next/team/${id}`);
    return Array.isArray(data) ? data : [];
  }

  async getTeamResults(id: string) {
    const data = await this.fetchV2(`/schedule/previous/team/${id}`);
    return Array.isArray(data) ? data : [];
  }

  async getTeamSquad(id: string) {
    const v2Data = await this.fetchV2(`/lookup/team_squad/${id}`);
    if (v2Data && Array.isArray(v2Data) && v2Data.length > 0) {
      return v2Data;
    }
    const v1Data = await this.fetchV1(`lookup_all_players.php?id=${id}`);
    return v1Data?.player || [];
  }

  async getPlayer(id: string) {
    const data = await this.fetchV2(`/lookup/player/${id}`);
    return Array.isArray(data) ? data[0] : data;
  }

  private normalizeSearchQuery(query: string) {
    return query.trim().replace(/\s+/g, '_');
  }

  async searchTeams(query: string) {
    const q = query.trim();
    if (!q) return [];
    const underscored = this.normalizeSearchQuery(q);
    const v2 =
      (await this.fetchV2(`/search/team/${encodeURIComponent(underscored)}`)) ||
      (await this.fetchV2(`/search/team/${encodeURIComponent(q)}`));
    if (Array.isArray(v2) && v2.length > 0) return v2;

    const v1 = await this.fetchV1(`searchteams.php?t=${encodeURIComponent(q)}`);
    return v1?.teams || [];
  }

  async searchLeagues(query: string) {
    const q = query.trim();
    if (!q) return [];
    const underscored = this.normalizeSearchQuery(q);
    const v2 =
      (await this.fetchV2(`/search/league/${encodeURIComponent(underscored)}`)) ||
      (await this.fetchV2(`/search/league/${encodeURIComponent(q)}`));
    if (Array.isArray(v2) && v2.length > 0) return v2;

    const v1 = await this.fetchV1(`searchallleagues.php?s=${encodeURIComponent(q)}`);
    const leagues = v1?.countries?.flatMap((c: { leagues?: unknown[] }) => c.leagues || []) || v1?.leagues;
    if (Array.isArray(leagues) && leagues.length) return leagues;

    const v1l = await this.fetchV1(`searchallleagues.php?l=${encodeURIComponent(q)}`);
    return v1l?.leagues || [];
  }

  async searchPlayers(query: string) {
    const q = query.trim();
    if (!q) return [];
    const underscored = this.normalizeSearchQuery(q);
    const v2 =
      (await this.fetchV2(`/search/player/${encodeURIComponent(underscored)}`)) ||
      (await this.fetchV2(`/search/player/${encodeURIComponent(q)}`));
    if (Array.isArray(v2) && v2.length > 0) return v2;

    const v1 = await this.fetchV1(`searchplayers.php?p=${encodeURIComponent(q)}`);
    return v1?.player || v1?.players || [];
  }

  async getAllLeagues() {
    return (await this.fetchV2('/all/leagues')) || [];
  }
}

export const sportsDB = new SportsDBClient();
