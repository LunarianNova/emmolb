'use client'
import { DayGame, MapDayGameAPIResponse } from "@/types/DayGame";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Link from "next/link";
import { LiveGameTiny } from "./LiveGameTiny";
import { fetchLeague, fetchTime } from "@/types/Api";
import { usePathname } from "next/navigation";
import { League, lesserLeagueIds } from "@/types/League";

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

export function MMOLBWatchPageHeader({ setDay, day, season, }: MMOLBWatchPageHeaderProps) {
    return (
        <>
            <div className="flex justify-center items-center mb-4 gap-4">
                <button onClick={() => setDay((d) => Math.max(1, d - 2))} className="px-2 py-1 bg-theme-primary rounded">
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
    const [league, setLeague] = useState('favorites');
    const [leagues, setLeagues] = useState<League[]>([]);
    const path = usePathname();

    useEffect(() => {
        async function APICalls() {
            try {
                const time = await fetchTime();
                setDay(time.seasonDay);

                const leaguesRes = await Promise.all(lesserLeagueIds.map(id => fetchLeague(id)));
                setLeagues(leaguesRes);
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
                if (league === 'favorites') {
                    const favoriteTeamIDs = JSON.parse(localStorage.getItem('favoriteTeamIDs') || '[]');
                    const res = await fetch('/nextapi/gameheaders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ teamIds: favoriteTeamIDs }),
                    });
                    if (!res.ok) throw new Error('Failed to load game headers');

                    const data: GameHeaderApiResponse[] = await res.json();
                    //setGameHeaders(data);
                } else {
                    let gamesRes;
                    if (league === 'greater') {
                        const nearestDay = day % 2 === 1 ? day : day - 1;
                        gamesRes = await fetch(`/nextapi/day-games/${nearestDay}`);
                    } else {
                        const nearestDay = day % 2 === 0 ? day : day - 1;
                        gamesRes = await fetch(`/nextapi/day-games/${nearestDay}?league=${league}&limit=8`);
                    }

                    if (!gamesRes.ok) throw new Error('Failed to load game data');
                    const gamesData = await gamesRes.json();
                    const games = gamesData.games.map((game: any): DayGame => MapDayGameAPIResponse(game)).filter((dayGame: DayGame) => !path.includes(dayGame.game_id));
                    setDayGames(games);
                }
            } catch (err) {
                console.error(err);
            } finally {
            }
        }

        APICalls();
    }, [day, league]);

    return (
        <div className='flex flex-row flex-nowrap gap-4 justify-center-safe max-w-screen'>
            <div className='grid content-center justify-items-center items-center gap-x-4 gap-y-1'>
                <div className='row-1 col-1 text-xs font-semibold uppercase'>League</div>
                <select className='row-2 col-1 text-sm bg-(--theme-primary) p-1 rounded-sm' value={league} onChange={(evt) => setLeague(evt.target.value)}>
                    <option className='bg-(--theme-primary)' value='favorites'>❤️ Favorites</option>
                    <option className='bg-(--theme-primary)' value='greater'>🏆 Greater</option>
                    {leagues.map((l, idx) => <option key={idx} value={l.id}>{l.emoji} {l.name}</option>)}
                </select>
                <div className='row-1 col-2 text-xs font-semibold uppercase'>Day</div>
                <div className='flex text-md gap-1'>
                    <div>◀</div>
                    <div>{day}</div>
                    <div>▶</div>
                </div>
            </div>
            <div className='flex flex-row flex-nowrap gap-2 overflow-x-auto'>
                {dayGames.map((dayGame, i) => (
                    <Link key={dayGame.game_id + 'link'} href={'/game/' + dayGame.game_id}>
                        <LiveGameTiny key={dayGame.game_id} dayGame={dayGame} />
                    </Link>
                ))}
            </div>
        </div>
    );
}