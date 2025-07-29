'use client';
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import Link from "next/link";
import { getContrastTextColor } from "@/helpers/ColorHelper";
import { useRouter } from 'next/navigation';
import CustomLeagueHeader from "@/components/CustomLeagueHeader";

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