import { sportsDB } from '@/lib/api/sportsdb';

type FavoriteRow = {
  id: string;
  item_id: string;
  item_type: string;
  item_name?: string | null;
  item_logo?: string | null;
};

export async function enrichFavorites(rows: FavoriteRow[]): Promise<FavoriteRow[]> {
  return Promise.all(
    rows.map(async (row) => {
      const name = row.item_name?.trim();
      if (name && name !== 'Unknown' && name !== 'undefined') {
        return row;
      }

      try {
        if (row.item_type === 'team') {
          const team = await sportsDB.getTeam(row.item_id);
          if (team) {
            return {
              ...row,
              item_name: team.name || row.item_name,
              item_logo: team.logo || row.item_logo,
            };
          }
        }
        if (row.item_type === 'league') {
          const league = await sportsDB.getLeagueDetails(row.item_id);
          if (league) {
            return {
              ...row,
              item_name: league.strLeague || row.item_name,
              item_logo: league.strBadge || league.strLogo || row.item_logo,
            };
          }
        }
        if (row.item_type === 'match') {
          const match = await sportsDB.getMatchDetails(row.item_id);
          if (match) {
            return {
              ...row,
              item_name: `${match.teams.home.name} vs ${match.teams.away.name}`,
              item_logo: match.teams.home.logo || row.item_logo,
            };
          }
        }
      } catch {
        /* keep row as-is */
      }
      return row;
    })
  );
}
