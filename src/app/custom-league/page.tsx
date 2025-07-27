'use client';
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import Link from "next/link";
import { getContrastTextColor } from "@/helpers/Colors";
import { useRouter } from 'next/navigation';

export default function CustomLeaguePage() {
    const [loading, setLoading] = useState(true);
    const [leagues, setLeagues] = useState<any[]>([]);

    const router = useRouter();

    useEffect(() => {
        async function fetchLeagues() {
            try {
                const res = await fetch(`/nextapi/db/get-leagues`);
                if (!res.ok) throw new Error('Failed to fetch leagues!');
                const leagues = await res.json()
                setLeagues(leagues.leagues);
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
        <main className="mt-16">
            <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-24 max-w-2xl mx-auto">
                <div className="text-2xl font-bold text-center mb-6">Custom League Subleagues</div>
                <div className="space-y-6">
                    <div>
                        <div className="space-y-3">
                            <button onClick={() => router.push('/create-league')} className="px-4 py-2 link-hover text-theme-secondary rounded mb-4">
                                Create Subleague
                            </button>
                            {leagues.map((league, index) => (
                                <Link key={index} href={`/custom-league/${league.league_name}`}>
                                    <CustomLeagueHeader league={league} />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </>);
}

export function CustomLeagueHeader({ league }: { league: any }) {
    return (
        <div className='relative w-full h-28 px-6 py-4 border-2 rounded-2xl shadow-xl overflow-hidden mb-4 flex items-center' style={{background: `${league.league_color}`, color: getContrastTextColor(league.league_color ? league.league_color : '')}}>
            <span className="text-7xl flex-shrink-0">
                {league.league_emoji}
            </span>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2">
                <span className="text-2xl font-bold tracking-wide leading-tight text-center">
                    {league.league_name} League
                </span>
                <span>
                    Custom League
                </span>
            </div>
        </div>
    );
}