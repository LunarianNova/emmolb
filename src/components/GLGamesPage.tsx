'use client'
import { DayGame, MapDayGameAPIResponse } from "@/types/DayGame";
import { useEffect, useState } from "react";
import Loading from "./Loading";
import { MapAPIGameResponse } from "@/types/Game";
import { MapAPITeamResponse } from "@/types/Team";
import { useSettings } from "./Settings";
import { FullBlobileDisplay } from "./BlobileLayout";
import Link from "next/link";
import { LiveGameCompact } from "./LiveGameCompact";
import { GameHeader, MinifiedGameHeader } from "./GameHeader";

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

export default function GLGamesPage({ season, initialDay }: {season: number, initialDay: number}) {
    const { settings } = useSettings();
    const [dayGames, setDayGames] = useState<DayGame[]>([]);
    const [games, setGames] = useState<GameHeaderApiResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [day, setDay] = useState<number>(initialDay);

    useEffect(() => {
        async function APICalls() {
            try {
                const gamesRes = await fetch(`/nextapi/day-games/${day}`);
                if (!gamesRes.ok) throw new Error('Failed to load player data');
                const gamesData = await gamesRes.json();
                const games = gamesData.games.map((game: any) => MapDayGameAPIResponse(game));
                setDayGames(games);

                const res = await fetch('/nextapi/gameheaders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ teamIds: games.map((game: any) => game.HomeTeamID) }),
                });
                if (!res.ok) throw new Error('Failed to load game headers');
                const data: GameHeaderApiResponse[] = await res.json();
                setGames(data);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        APICalls();
    }, [day]);

    if (loading ) return (<Loading />);

    if (games.length === 0 && dayGames?.length) return (
        <main className="mt-16">
            <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-20 max-w-3xl mx-auto">
                <div className="flex justify-center items-center mb-4 gap-4">
                    <button onClick={() => setDay((d) => Math.max(1, d - 2))}className="px-2 py-1 bg-theme-primary rounded">
                        Prev
                    </button>
                    <div>Day {day}</div>
                    <button onClick={() => setDay((d) => Math.min(300, d + 2))} className="px-2 py-1 bg-theme-primary rounded">
                        Next
                    </button>
                </div>
                
                <h1 className="text-2xl font-bold text-center mb-2">
                    Season {season}, Regular Season, Day {day} Games
                </h1>
                <div className="text-center mb-4 font-semibold">Greater League</div>
                {dayGames.map((game: DayGame) => {
                    return <MinifiedGameHeader key={game.game_id} game={game} />
                })}  
            </div>
        </main>
    );

    return (
        <main className="mt-16">
            <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-20 max-w-3xl mx-auto">
                <div className="flex justify-center items-center mb-4 gap-4">
                    <button onClick={() => setDay((d) => Math.max(1, d - 2))}className="px-2 py-1 bg-theme-primary rounded">
                        Prev
                    </button>
                    <div>Day {day}</div>
                    <button onClick={() => setDay((d) => Math.min(300, d + 2))} className="px-2 py-1 bg-theme-primary rounded">
                        Next
                    </button>
                </div>
                
                <h1 className="text-2xl font-bold text-center mb-2">
                    Season {season}, Regular Season, Day {day} Games
                </h1>
                <div className="text-center mb-4 font-semibold">Greater League</div>
                {settings.homePage?.useBlasesloaded ? games.map(({ teamId, gameHeader }) => (
                    <Link key={teamId + "link"} href={"/game/" + gameHeader.gameId}>
                        <FullBlobileDisplay key={teamId} gameId={gameHeader.gameId} homeTeam={gameHeader.homeTeam} awayTeam={gameHeader.awayTeam} game={gameHeader.game} />
                    </Link>
                )) : (<>
                    {games.map(({ teamId, gameHeader }) => (
                        <Link key={teamId + "link"} href={"/game/" + gameHeader.gameId}>
                            <LiveGameCompact key={teamId} gameId={gameHeader.gameId} homeTeam={MapAPITeamResponse(gameHeader.homeTeam)} awayTeam={MapAPITeamResponse(gameHeader.awayTeam)} game={MapAPIGameResponse(gameHeader.game)} killLinks={true} />
                        </Link>
                    ))}
            </>)}  
            </div>
        </main>
    );
}