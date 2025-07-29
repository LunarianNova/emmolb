'use client';

import { useEffect, useState, useRef } from 'react';
import Loading from '@/components/Loading';
import MockGameHeader from '@/components/MockupGameHeader';
import { LiveGameCompact } from '@/components/LiveGameCompact';
import { MapAPITeamResponse } from '@/types/Team';
import { MapAPIGameResponse } from '@/types/Game';
import Link from 'next/link';

type BracketTeam = {
    id?: string;
    name: string;
    emoji: string;
    color: string;
    record?: string;
};

type BracketResponse = {
    [key: string]: BracketTeam;
};

type GameInfo = {
    gameId: string;
    homeTeam: any;
    awayTeam: any;
    game: any;
};

export default function PostseasonPage() {
    const [bracket, setBracket] = useState<BracketResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeGames, setActiveGames] = useState<Record<string, GameInfo>>({});
    const gamePollingRefs = useRef<Record<string, NodeJS.Timeout>>({});

  // Fetch bracket
    useEffect(() => {
        const fetchBracket = async () => {
            try {
                const res = await fetch('/nextapi/postseason-bracket');
                const data = await res.json();
                setBracket(data);
            } catch (err) {
                console.error('Failed to load bracket:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBracket();
        const interval = setInterval(fetchBracket, 30000);
        return () => clearInterval(interval);
    }, []);

  // Check which teams are playing
  useEffect(() => {
    if (!bracket) return;

    const teamIds = Object.values(bracket)
      .map(team => team?.id)
      .filter(Boolean) as string[];

    const pollTeams = async () => {
      for (const teamId of teamIds) {
        try {
          const res = await fetch(`/nextapi/game-by-team/${teamId}`);
          if (!res.ok) continue;

          const json = await res.json();
          if (!json?.game_id) continue;

          // Only start polling if we aren’t already
          if (!activeGames[json.game_id]) {
            try {
              const liveRes = await fetch(`/nextapi/gameheader/${json.game_id}`);
              if (!liveRes.ok) continue;
              const liveData = await liveRes.json();

              setActiveGames(prev => ({
                ...prev,
                [json.game_id]: {
                  ...liveData,
                },
              }));

              // Begin polling this game
              gamePollingRefs.current[json.game_id] = setInterval(async () => {
                try {
                  const updateRes = await fetch(`/nextapi/gameheader/${json.game_id}`);
                  const updateData = await updateRes.json();
                  if (!updateRes.ok || !updateData?.entries?.length) return;

                  setActiveGames(prev => ({
                    ...prev,
                    [json.game_id]: {
                      ...prev[json.game_id],
                    },
                  }));
                } catch (err) {
                  console.error('Polling game failed:', err);
                }
              }, 6000);
            } catch (err) {
              console.error('Failed to fetch live data for new game', err);
            }
          }
        } catch (err) {
          console.error(`Failed to poll team ${teamId}`, err);
        }
      }
    };

    pollTeams();
    const interval = setInterval(pollTeams, 30000);
    return () => {
      clearInterval(interval);
      Object.values(gamePollingRefs.current).forEach(clearInterval);
    };
  }, [bracket, activeGames]);

  if (loading || !bracket) return <Loading />;
  const renderMockGame = (away: BracketTeam, home: BracketTeam, label: string) => (
    <MockGameHeader key={label} awayTeam={away} homeTeam={home} label={label} />
  );

  return (
    <main className="mt-16">
      <div className="max-w-5xl mx-auto px-4 pt-16">
        <h1 className="text-2xl font-bold text-center mb-8">Postseason Bracket</h1>

        <div className="overflow-x-auto">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 min-w-[600px] sm:min-w-full">
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-center">Clover League</h2>
              <div className="space-y-1">
                <div className="text-xs uppercase opacity-70 mb-1">Wildcard</div>
                {renderMockGame(bracket.WildcardSeed1, bracket.CloverSeed2, 'Best of 3')}
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase opacity-70 mb-1">Semifinal</div>
                {renderMockGame(bracket.CloverWildcardWinner, bracket.CloverSeed1, 'Best of 5')}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-center">Pineapple League</h2>
              <div className="space-y-1">
                <div className="text-xs uppercase opacity-70 mb-1">Wildcard</div>
                {renderMockGame(bracket.WildcardSeed2, bracket.PineappleSeed2, 'Best of 3')}
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase opacity-70 mb-1">Semifinal</div>
                {renderMockGame(bracket.PineappleWildcardWinner, bracket.PineappleSeed1, 'Best of 5')}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <div className="w-full max-w-2xl">
            {renderMockGame(bracket.CloverLeagueChamp, bracket.PineappleLeagueChamp, 'Best of 7')}
          </div>
        </div>

        {Object.values(activeGames).length > 0 && (
          <div className="mt-12 space-y-8">
            <h2 className="text-xl font-semibold text-center">Live Games</h2>
            {Object.entries(activeGames).map(([gameId, gameInfo]) => (
              <Link key={gameId} href={`/watch/${gameId}`}>
                <LiveGameCompact
                  key={gameId}
                  gameId={gameInfo.gameId}
                  homeTeam={MapAPITeamResponse(gameInfo.homeTeam)}
                  awayTeam={MapAPITeamResponse(gameInfo.awayTeam)}
                  game={MapAPIGameResponse(gameInfo.game)}
                  killLinks={true}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
