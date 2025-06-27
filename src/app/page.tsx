'use client';

import { useEffect, useState } from 'react';
import { GameHeaderFromResponse } from '@/components/GameHeader';
import { Navbar } from '@/components/Navbar';
import Loading from '@/components/Loading';
import { LinkWithLoading } from '@/components/LinkWithLoading';
import Link from 'next/link';

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
        console.log(data);
        setGameHeaders(data);
      } catch (error) {
        console.error(error);
      } finally {
        console.log('error');
        setLoading(false);
      }
    }

    fetchGameHeaders();
  }, []);

  if (loading) return <><Navbar /><Loading /></>;

  if (gameHeaders.length === 0) return <><Navbar /><div className='flex flex-col items-center justify-center h-[80vh] text-white select-none font-sans text-2xl text-[#fef4e5]'>You have no favorite teams<br></br><Link href="/teams" className='text-blue-100'>Go here to add some!</Link></div></>;

  return (
    <div>
      <Navbar />
      <main className="mt-16">
        <div className="min-h-screen bg-[#0c111b] text-white font-sans p-4 pt-20 max-w-3xl mx-auto">
          {gameHeaders.map(({ teamId, gameHeader }) => (
            <Link key={teamId + "link"} href={"/game/" + gameHeader.gameId}>
              <GameHeaderFromResponse
                key={teamId}
                homeTeam={gameHeader.homeTeam}
                awayTeam={gameHeader.awayTeam}
                game={gameHeader.game}
              />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
