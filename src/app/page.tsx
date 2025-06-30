'use client';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import Loading from '@/components/Loading';
import Link from 'next/link';
import { LiveGameCompact } from '@/components/LiveGameCompact';
import { FullBlobileDisplay } from '@/components/BlobileLayout';
import { useSettings } from '@/components/Settings';

interface GameHeaderApiResponse {
    teamId: string;
    gameHeader: GameHeaderResponse;
}

interface GameHeaderResponse {
    game: any;
    gameId: any;
    awayTeam: any;
    homeTeam: any;
}

export default function HomePage() {
    const [gameHeaders, setGameHeaders] = useState<GameHeaderApiResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const {settings} = useSettings();

    useEffect(() => {
        async function fetchGameHeaders() {
            const favoriteTeamIDs = JSON.parse(localStorage.getItem('favoriteTeamIDs') || '[]');

            if (favoriteTeamIDs.length === 0) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch('https://lunanova.space/nextapi/gameheaders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ teamIds: favoriteTeamIDs }),
                });
                if (!res.ok) throw new Error('Failed to load game headers');

                const data: GameHeaderApiResponse[] = await res.json();
                setGameHeaders(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchGameHeaders();
    }, []);

    if (loading) return <><Navbar /><Loading /></>;

    if (gameHeaders.length === 0) {
        return (<>
            <Navbar />
            <div className='flex flex-col items-center justify-center h-[80vh] text-white select-none font-sans text-2xl text-theme-secondary'>
                You have no favorite teams<br></br><Link href="/teams" className='text-blue-100'>Go here to add some!</Link>
            </div>
        </>);
    }

    return (<>
        <Navbar />
        <main className="mt-16">
            {settings.useBlasesloaded ? gameHeaders.map(({ teamId, gameHeader }) => (
                <Link key={teamId + "link"} href={"/game/" + gameHeader.gameId}>
                    <FullBlobileDisplay key={teamId} gameId={gameHeader.gameId} homeTeam={gameHeader.homeTeam} awayTeam={gameHeader.awayTeam} game={gameHeader.game} />
                </Link>
            )) : (
                <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-20 max-w-3xl mx-auto">
                    {gameHeaders.map(({ teamId, gameHeader }) => (
                        <Link key={teamId + "link"} href={"/game/" + gameHeader.gameId}>
                            <LiveGameCompact key={teamId} gameId={gameHeader.gameId} homeTeam={gameHeader.homeTeam} awayTeam={gameHeader.awayTeam} game={gameHeader.game} killLinks={true} />
                        </Link>
                    ))}
                </div>
            )}        
        </main>
    </>);
}
