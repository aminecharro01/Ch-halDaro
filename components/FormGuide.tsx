"use client";
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function FormGuide({ teamId }: { teamId: string }) {
  const { data, isLoading } = useSWR(`/api/match/team-fixtures?id=${teamId}`, fetcher);

  if (isLoading || !data?.fixtures) return <div className="h-6 w-32 bg-gray-800 animate-pulse rounded"></div>;

  const results = data.fixtures.slice(0, 5).map((f: any) => {
    const isHome = f.teams.home.id.toString() === teamId;
    const homeGoals = f.goals.home;
    const awayGoals = f.goals.away;

    if (homeGoals === awayGoals) return 'D'; // Draw
    if (isHome) {
      return homeGoals > awayGoals ? 'W' : 'L';
    } else {
      return awayGoals > homeGoals ? 'W' : 'L';
    }
  }).reverse();

  return (
    <div className="flex gap-1.5">
      {results.map((r: string, i: number) => (
        <span 
          key={i} 
          className={`w-5 h-5 flex items-center justify-center rounded-sm text-[10px] font-black text-white ${
            r === 'W' ? 'bg-green-500' : r === 'L' ? 'bg-red-500' : 'bg-gray-500'
          }`}
        >
          {r}
        </span>
      ))}
    </div>
  );
}
