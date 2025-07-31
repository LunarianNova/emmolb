'use client'
import { DayGame, MapDayGameAPIResponse } from "@/types/DayGame";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Link from "next/link";
import { LiveGameTiny } from "./LiveGameTiny";
import { fetchTime } from "@/types/Api";
import { usePathname } from "next/navigation";

type GameHeaderApiResponse = {
    teamId: string;
    gameHeader: GameHeaderResponse;
}

type GameHeaderResponse = {
    game: any;
    gameId: any;
    awayTeam: any;
    homeTeam: any;
}

type MMOLBWatchPageHeaderProps = {
    setDay: Dispatch<SetStateAction<number>>;
    day: number;
    season: number;
};

export function MMOLBWatchPageHeader({setDay, day, season,}: MMOLBWatchPageHeaderProps) {
    return (
        <>
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
        </>
    );
}

export default function LeagueScoreboard() {
    const [dayGames, setDayGames] = useState<DayGame[]>([]);
    const [day, setDay] = useState<number>();
    const path = usePathname();

    useEffect(() => {
        async function APICalls() {
            try {
                const time = await fetchTime();
                setDay(time.seasonDay);
            } catch (err) {
                console.error(err);
            } finally {
            }
        }

        APICalls();
    }, []);

    useEffect(() => {
        async function APICalls() {
            try {
                if (!day) return;
                const gamesRes = await fetch(`/nextapi/day-games/${day}?limit=10`);
                if (!gamesRes.ok) throw new Error('Failed to load game data');
                const gamesData = await gamesRes.json();
                const games = gamesData.games.map((game: any): DayGame => MapDayGameAPIResponse(game)).filter((dayGame: DayGame) => !path.includes(dayGame.game_id));
                setDayGames(games);
            } catch (err) {
                console.error(err);
            } finally {
            }
        }

        APICalls();
    }, [day]);

    return (
        <div className='flex flex-row flex-nowrap gap-4 justify-center'>
            {dayGames.map((dayGame, i) => (
                <Link key={i + 'link'} href={'/game/' + dayGame.game_id}>
                    <LiveGameTiny key={i} dayGame={dayGame} />
                </Link>
            ))}
        </div>
    );
}