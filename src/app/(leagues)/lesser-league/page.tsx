'use client';

import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import { Navbar } from "@/components/Navbar";
import LeagueHeader from "@/components/leagues/LeagueHeader";
import Link from "next/link";
import { League } from "@/types/League";
import { fetchLeague } from "@/types/Api";

export default function LesserLeaguePage() {
    const [loading, setLoading] = useState(true);
    const [leagues, setLeagues] = useState<any[]>([]);

    const league_ids: string[] = [
        '6805db0cac48194de3cd3fe7',
        '6805db0cac48194de3cd3fe8',
        '6805db0cac48194de3cd3fe9',
        '6805db0cac48194de3cd3fea',
        '6805db0cac48194de3cd3feb',
        '6805db0cac48194de3cd3fec',
        '6805db0cac48194de3cd3fed',
        '6805db0cac48194de3cd3fee',
        '6805db0cac48194de3cd3fef',
        '6805db0cac48194de3cd3ff0',
        '6805db0cac48194de3cd3ff1',
        '6805db0cac48194de3cd3ff2',
        '6805db0cac48194de3cd3ff3',
        '6805db0cac48194de3cd3ff4',
        '6805db0cac48194de3cd3ff5',
        '6805db0cac48194de3cd3ff6',
    ];

    useEffect(() => {
        async function fetchLeagues() {
            try {
                const responses = await Promise.all(league_ids.map(id => fetchLeague(id)));
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
        <div className="flex flex-col items-center">
            {leagues.map((league, index) => (
                <Link key={index} href={`/league/${league.id}`}>
                    <LeagueHeader league={league} />
                </Link>
            ))}
        </div>
    </>);
}
