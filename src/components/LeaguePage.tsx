'use client'

import Loading from "@/components/Loading";
import { Navbar } from "@/components/Navbar";
import { useEffect, useState } from "react";
import LeagueHeader from "./LeagueHeader";
import MiniTeamHeader from "./MiniTeamHeader";
import { MapAPILeagueTeamResponse, MapAPITeamResponse } from "@/types/Team";

export default function LeaguePage({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [league, setLeague] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    async function APICalls() {
      try {
        const leagueRes = await fetch(`/nextapi/league/${id}`);
        if (!leagueRes.ok) throw new Error('Failed to load league data');
        setLeague(await leagueRes.json());

        const teamsRes = await fetch(`/nextapi/league-top-teams/${id}`);
        if (!teamsRes.ok) throw new Error('Failed to load teams');
        const json = await teamsRes.json();

        if (!Array.isArray(json.teams)) throw new Error('Teams response was not an array');
        setTeams(json.teams);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    APICalls();
  }, [id]);

  if (loading) return (
    <>
      <Loading />
    </>
  );

  if (!league || !teams.length) return (
    <>
      <div className="text-white text-center mt-10">Can't find that league</div>
    </>
  );

    const totalGamesInSeason = 120;
    const firstTeamGamesPlayed = teams[0].Record["Regular Season"].Wins + teams[0].Record["Regular Season"].Losses;
    const gamesLeft = totalGamesInSeason - firstTeamGamesPlayed;

    const cutoffIndex = teams.findIndex(team => (teams[0].Record["Regular Season"].Wins - team.Record["Regular Season"].Wins) > gamesLeft);
    console.log(cutoffIndex, gamesLeft, firstTeamGamesPlayed)

    return (
        <>
            <main className="mt-16">
                <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-24 max-w-2xl mx-auto">
                    <div className="mb-8">
                        <LeagueHeader league={league} />
                        <div className="flex justify-center">
                            <div className="w-full max-w-[32rem] space-y-2">
                                {teams.map((team: any, index) => (
                                    <div key={team.id || index}>
                                        {index === cutoffIndex && (
                                            <div className="relative my-4 flex items-center" aria-label="Cutoff line">
                                                <div className="bg-theme-text absolute left-0 -translate-x-full bg-theme-primary text-xs font-bold px-2 py-0.5 rounded-sm select-none" style={{color: 'var(--theme-background)'}}>
                                                #1 CUTOFF
                                                </div>
                                                <div className="flex-grow border-t-2 border-theme-text"></div>
                                            </div>
                                        )}
                                        <MiniTeamHeader
                                            team={MapAPILeagueTeamResponse(team)}
                                            index={index + 1}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
  );
}
