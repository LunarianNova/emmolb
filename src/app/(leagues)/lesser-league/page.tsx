'use client';

import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import LeagueHeader from "@/components/leagues/LeagueHeader";
import Link from "next/link";
import { fetchCachedLesserLeagues } from "@/types/Api";

export default function LesserLeaguePage() {
    const [loading, setLoading] = useState(true);
    const [leagues, setLeagues] = useState<any[]>([]);

    useEffect(() => {
        async function getLeagues() {
            setLeagues(await fetchCachedLesserLeagues());
            setLoading(false);
        }
        getLeagues();
    }, [])

    if (loading) return (<>
        <Loading />
    </>);

    return (<>
        <div className="text-2xl font-bold text-center mb-6">Lesser League Subleagues</div>
        <div className="space-y-3">
            {leagues.map((league, index) => (
                <Link key={index} className="flex justify-center"href={`/league/${league.id}`}>
                    <LeagueHeader league={league} />
                </Link>
            ))}
        </div>
    </>);
}
