'use client';
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import MiniTeamHeader from "@/components/MiniTeamHeader";
import { MapAPILeagueTeamResponse } from "@/types/Team";

export default function TwoLeaguesTeamsPage() {
    const [loading, setLoading] = useState(true);
    const [leagueTeams, setLeagueTeams] = useState<{ leagueId: string; teams: any[] }[]>([]);

    const leagueIds = ['6805db0cac48194de3cd3fe4', '6805db0cac48194de3cd3fe5',];
    const leagueNames = ['Clover', 'Pineapple',];

    useEffect(() => {
        async function fetchTeamsForLeagues() {
            try {
                const responses = await Promise.all(
                leagueIds.map(id =>
                    fetch(`/nextapi/league-top-teams/${id}`).then(async res => {
                        if (!res.ok) return null;
                        const data = await res.json();
                        return { leagueId: id, teams: data.teams };
                    })
                ));
                setLeagueTeams(responses.filter(Boolean) as { leagueId: string; teams: any[] }[]);
            } catch (err) {
                console.error("Failed to load league teams:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchTeamsForLeagues();
    }, []);

    if (loading) return (<>
        <Loading />
    </>);

    return (
        <>
            <main className="mt-16">
                <div className='min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-20 max-w-3xl mx-auto'>
                    <h1 className="text-2xl font-bold text-center mb-6">Greater League Standings</h1>
                    <div className='flex flex-col md:flex-row gap-6'>
                        {leagueTeams.map((entry, i) => (
                            <div key={entry.leagueId} className="w-full md:w-1/2 px-2">
                                <h2 className="text-xl font-bold text-center mb-4">{leagueNames[i]} Division</h2>
                                {entry.teams.map((team, idx) => (
                                    <div key={idx} className="rounded-xl shadow-md mb-4 overflow-hidden max-w-md mx-auto border border-[#1c2a3a]">
                                        <MiniTeamHeader team={MapAPILeagueTeamResponse(team)} />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}
