// components/LeaguePage.tsx
'use client'

import Loading from "@/components/Loading";
import { useEffect, useState } from "react";
import LeagueHeader from "./LeagueHeader";
import MiniTeamHeader from "./MiniTeamHeader";
import { MapAPILeagueTeamResponse, Team } from "@/types/Team";
import { League, MapAPILeagueResponse } from "@/types/League";

function getCurrentPhase(now: Date, phases: { name: string, start: string }[]): string {
    const preview = phases.find(p => p.name === "PostseasonPreview");
    if (!preview) return "Unknown";
    return now >= new Date(preview.start) ? "Postseason" : "Regular Season";
}

export default function LeaguePage({ id }: { id: string }) {
    const [loading, setLoading] = useState(true);
    const [league, setLeague] = useState<League | undefined>(undefined);
    const [teams, setTeams] = useState<Team[]>([]);
    const [time, setTime] = useState<any>();

    useEffect(() => {
        async function APICalls() {
            try {
                const leagueRes = await fetch(`/nextapi/league/${id}`);
                if (!leagueRes.ok) throw new Error('Failed to load league data');
                setLeague(MapAPILeagueResponse(await leagueRes.json()));

                const teamsRes = await fetch(`/nextapi/league-top-teams/${id}`);
                if (!teamsRes.ok) throw new Error('Failed to load teams');
                const json = await teamsRes.json();

                if (!Array.isArray(json.teams)) throw new Error('Teams response was not an array');
                setTeams(json.teams.map((team: any) => MapAPILeagueTeamResponse(team)));

                const timeRes = await fetch(`/nextapi/time`);
                if (!timeRes.ok) throw new Error('Failed to load time');
                setTime(await timeRes.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        APICalls();
    }, [id]);

    if (loading) return (<Loading />);

    if (!league || !teams.length) return (<div className="text-white text-center mt-10">Can't find that league</div>);

    const totalGamesInSeason = 120;
    const gamesPlayed = Math.floor(time.season_day / 2);
    const gamesLeft = totalGamesInSeason-gamesPlayed;
    const topTeamWinDiff = teams[0].record.regular_season.wins - teams[0].record.regular_season.losses;

    const worstCaseTopTeam = time.season_day%2 == 0 ? topTeamWinDiff-gamesLeft+1 : topTeamWinDiff-gamesLeft;
    let cutoffIndex = teams.findIndex(team => (((team.record.regular_season.wins + gamesLeft) - team.record.regular_season.losses) < (worstCaseTopTeam)));
    cutoffIndex = cutoffIndex === 0 ? 1 : cutoffIndex;
    
    const phase = getCurrentPhase(new Date(), Object.entries(time.phase_times as Record<string, string>).map(([name, start]) => ({name, start})));
    const isPostseason = phase === 'Postseason';
    const postSeasonGL = `Final Standings for Season ${time.season_number}`

    const isEvenDay = time.season_day % 2 === 0;
    const pluralGamesLeft = gamesLeft !== 1;
    const formattedGL = `${gamesLeft}${isEvenDay ? `-${gamesLeft + 1}` : ''} Game${pluralGamesLeft ? 's' : ''} Remain${pluralGamesLeft ? '' : 's'}`;

    return (
        <main className="mt-16">
            <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-24 max-w-2xl mx-auto">
                <div className="mb-8">
                    <LeagueHeader league={league} />
                    <div className="flex justify-center">
                        <div className="w-full max-w-[36rem] space-y-2">
                            <div className="text-center mt-0 mb-4 text-lg font-bold">{isPostseason ? postSeasonGL : formattedGL}</div>
                            <div className='flex justify-end px-2 text-xs font-semibold uppercase'>
                                <div className='ml-1 w-14 text-right'>Record</div>
                                <div className='ml-1 w-9 text-right'>WD</div>
                                <div className='ml-1 w-10 text-right'>RD</div>
                                <div className='ml-1 w-9 text-right'>GB</div>
                            </div>
                            {teams.map((team: any, index) => (
                                <div key={team.id || index}>
                                    {index === cutoffIndex && (
                                        <div className="relative my-4 flex items-center" aria-label="Cutoff line">
                                            <div className="absolute -left-2 sm:left-0 sm:-translate-x-full bg-theme-text text-xs font-bold px-2 py-0.5 rounded-sm select-none text-theme-background whitespace-nowrap">
                                                #1 CUTOFF
                                            </div>
                                            <div className="flex-grow border-t-2 border-theme-text"></div>
                                        </div>
                                    )}
                                    <MiniTeamHeader team={team} leader={teams[0]} index={index + 1} alignValues={true} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
  );
}
