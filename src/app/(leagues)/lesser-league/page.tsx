'use client';

import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import { Navbar } from "@/components/Navbar";
import LeagueHeader from "@/components/leagues/LeagueHeader";
import Link from "next/link";
import { League, lesserLeagueIds } from "@/types/League";
import { fetchLeague } from "@/types/Api";

export default function LesserLeaguePage() {
    const [loading, setLoading] = useState(true);
    const [leagues, setLeagues] = useState<any[]>([]);

    useEffect(() => {
        async function fetchLeagues() {
            try {
                const responses = await Promise.all(lesserLeagueIds.map(id => fetchLeague(id)));
                setLeagues(responses);
            } catch (error) {
                console.error("Failed to fetch leagues", error);
            } finally {
                setLoading(false);
            }
        }

        fetchLeagues();
    }, []);

    if (loading) return (<>
        <Loading />
    </>);

    return (<>
        <div className="text-2xl font-bold text-center mb-6">Lesser League Subleagues</div>
        <div className="flex flex-col mx-auto">
            {leagues.map((league, index) => (
                <Link key={index} className="flex justify-center"href={`/league/${league.id}`}>
                    <LeagueHeader league={league} />
                </Link>
            ))}
        </div>
    </>);
}
