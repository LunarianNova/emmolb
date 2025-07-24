// components/LeaguePage.tsx
// Author: Navy
'use client'

import Loading from "@/components/Loading";
import { useEffect, useState } from "react";
import LeagueHeader from "./LeagueHeader";
import MiniTeamHeader from "./MiniTeamHeader";
import { MapAPILeagueTeamResponse, Team } from "@/types/Team";
import { League, MapAPILeagueResponse } from "@/types/League";

export default function LeaguePage({ id }: { id: string }) {
    const [loading, setLoading] = useState(true);
    const [league, setLeague] = useState<League | undefined>(undefined);
    const [teams, setTeams] = useState<Team[]>([]);

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
    const gamesPlayed = Math.max(...teams.map((team) => (team.record.regular_season.wins+team.record.regular_season.losses)));
    const gamesLeft = totalGamesInSeason-gamesPlayed;
    const topTeamWinDiff = teams[0].record.regular_season.wins - teams[0].record.regular_season.losses;

    const cutoffIndex = teams.findIndex(team => (((team.record.regular_season.wins + gamesLeft) - team.record.regular_season.losses) < (topTeamWinDiff-gamesLeft)));

    return (
        <main className="mt-16">
            <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-24 max-w-2xl mx-auto">
                <div className="mb-8">
                    <LeagueHeader league={league} />
                    <div className="flex justify-center">
                        <div className="w-full max-w-[36rem] space-y-2">
                            <div className='flex justify-end px-2 text-xs font-semibold uppercase'>
                                <div className='ml-1 w-14 text-right'>Record</div>
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
