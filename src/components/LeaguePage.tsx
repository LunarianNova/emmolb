'use client'

import Loading from "@/components/Loading";
import { Navbar } from "@/components/Navbar";
import { useEffect, useState } from "react";
import LeagueHeader from "./LeagueHeader";
import MiniTeamHeader from "./MiniTeamHeader";

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
      <Navbar />
      <Loading />
    </>
  );

  if (!league || !teams.length) return (
    <>
      <Navbar />
      <div className="text-white text-center mt-10">Can't find that league</div>
    </>
  );

  return (
    <>
      <Navbar />
      <main className="mt-16">
        <div className='min-h-screen bg-[#0c111b] text-white font-sans p-4 pt-24 max-w-2xl mx-auto'>
            <div className='mb-8'>
                <div>
                    <LeagueHeader league={league} />
                    <div className='flex justify-center'>
                        <div className='w-full max-w-[32rem] space-y-2'>
                            {teams.map((team: any, index) => (
                                <MiniTeamHeader key={index} team={team} index={index+1} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </>
  );
}
