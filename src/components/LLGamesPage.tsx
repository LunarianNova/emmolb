'use client'
import { DayGame, MapDayGameAPIResponse } from "@/types/DayGame";
import { useEffect, useMemo, useState } from "react";
import Loading from "./Loading";
import { MapAPIGameResponse } from "@/types/Game";
import { MapAPITeamResponse } from "@/types/Team";
import { useSettings } from "./Settings";
import { FullBlobileDisplay } from "./BlobileLayout";
import Link from "next/link";
import { LiveGameCompact } from "./LiveGameCompact";
import { MinifiedGameHeader } from "./GameHeader";
import { MMOLBWatchPageHeader } from "./GLGamesPage";

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

type LLGamesPageProps = {
    season: number;
    initialDay: number; 
    league: string;
}

export default function LLGamesPage({ season, initialDay, league }: LLGamesPageProps) {
    const { settings } = useSettings();
    const [dayGames, setDayGames] = useState<DayGame[]>([]);
    const [leagueName, setLeagueName] = useState<string>('');
    const [gameHeaders, setGameHeaders] = useState<Record<string, GameHeaderResponse>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [updating, setUpdating] = useState<boolean>(false);
    const [teamOrder, setTeamOrder] = useState<string[]>([]);
    const [page, setPage] = useState<number>(1);
    const [gamesPerPage, setGamesPerPage] = useState<number>(20); // Unused currently
    const [favoriteTeams, setFavoriteTeams] = useState<string[]>();
    const [gridView, setGridView] = useState<boolean>(false);
    const [day, setDay] = useState<number>(initialDay);

    useEffect(() => {
        async function getLeague() {
            const leagueTeamsRes = await fetch(`/nextapi/league-top-teams/${league}`);
            if (!leagueTeamsRes.ok) throw new Error('Failed to load league team data');
            const leagueTeamData = await leagueTeamsRes.json();
            setTeamOrder(leagueTeamData.teams.map((team: any) => team._id));
            
            const leagueRes = await fetch(`/nextapi/league/${league}`);
            if (!leagueRes.ok) throw new Error('Failed to load league data');
            const leagueData = await leagueRes.json();
            setLeagueName(leagueData.Name)
        }

        getLeague();
    }, [league])

    useEffect(() => {
        async function fetchDayGames() {
            try {
                setUpdating(true);
                setDayGames([]);
                setGameHeaders({});
                
                const gameRes = await fetch(`/nextapi/day-games/${day}?league=${league}`);
                if (!gameRes.ok) throw new Error('Failed to load game data');
                const gamesData = await gameRes.json();
                setDayGames(gamesData.games.map((game: any) => MapDayGameAPIResponse(game)));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchDayGames();
        setFavoriteTeams(JSON.parse(localStorage.getItem('favoriteTeamIDs') || '[]'));
    }, [day, league]);

    const sortedDayGames = useMemo(() => {
        if (teamOrder.length === 0) return [];

        const ranks: Record<string, number> = Object.fromEntries(
            teamOrder.map((id: string, index: number) => [id, index])
        );

        const favoriteSet = new Set(favoriteTeams);

        const getGameRank = (game: DayGame) => {
            const homeFav = favoriteSet.has(game.home_team_id);
            const awayFav = favoriteSet.has(game.away_team_id);
            const favBonus = (homeFav || awayFav) ? -1000 : 0; // Prioritize any favorite team game
            const homeRank = ranks[game.home_team_id] ?? Infinity;
            const awayRank = ranks[game.away_team_id] ?? Infinity;
            return favBonus + Math.min(homeRank, awayRank);
        };

        return [...dayGames].sort((a, b) => getGameRank(a) - getGameRank(b));
    }, [dayGames, teamOrder, favoriteTeams]);

    useEffect(() => {
        async function fetchGameHeaders() {
            setUpdating(true);
            if (sortedDayGames.length === 0 || sortedDayGames[0].status === 'Scheduled' || sortedDayGames.every((game: DayGame) => game.status === 'Final')) {
                setUpdating(false);
                return;
            }

            try {
                const liveTeamIDs = sortedDayGames.map((game: DayGame) => game.home_team_id).slice((page-1)*gamesPerPage, page*gamesPerPage);
                if (liveTeamIDs.length === 0 || Object.keys(gameHeaders).includes(liveTeamIDs[gamesPerPage-1])) {
                    setUpdating(false);
                    return;
                }

                const gameheadersRes = await fetch('/nextapi/gameheaders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ teamIds: liveTeamIDs }),
                });
                if (!gameheadersRes.ok) throw new Error('Failed to load game headers');
                const data: GameHeaderApiResponse[] = await gameheadersRes.json();
                
                setGameHeaders(prev => ({
                    ...prev,
                    ...Object.fromEntries(data.map(({ teamId, gameHeader }) => [teamId, gameHeader]))
                }));
            } catch (err) {
                console.error(err);
            } finally {
                setUpdating(false);
            }
        }

        fetchGameHeaders();
    }, [sortedDayGames, page, gamesPerPage])

    const totalPages = sortedDayGames ? Math.ceil(sortedDayGames.length / gamesPerPage) : 0;
    const paginatedDayGames = sortedDayGames.slice((page-1)*gamesPerPage, gamesPerPage*page);

    if (loading) return (<Loading />);

    return (
        <main className="mt-16">
            <div className={`min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-20 ${gridView ? '' : 'max-w-3xl mx-auto'}`}>
                <MMOLBWatchPageHeader setDay={setDay} day={day} season={season} />

                <div className="text-center mb-4 font-semibold">{leagueName} League</div>

                {totalPages > 1 && (
                    <div className="flex justify-center items-center mb-2 gap-4">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || updating} className="px-2 py-1 bg-theme-primary rounded">
                            Prev
                        </button>
                        <div>Page {page} of {totalPages}</div>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || updating} className="px-2 py-1 bg-theme-primary rounded">
                            Next
                        </button>
                    </div>
                )}
                <div className="flex justify-center mb-4">
                    <button onClick={() => setGridView((prev) => !prev)}className="px-2 py-1 bg-theme-primary rounded">
                        Toggle Grid View
                    </button>
                </div>

                {updating && (<div className="text-center">Loading Games...</div>)}

                {!updating && day <= initialDay && sortedDayGames.length === 0 && (<div className="text-center">Loading Games...</div>)}

                {!updating && day > initialDay && (<div className="text-center">You're in the future 🎉<br></br>As far as the eye can see... no games... <br></br>MMOLB promises unlimited games... but... no games</div>)}

                <div className={`${gridView ? 'grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(40rem,1fr))] gap-4' : 'flex flex-col gap-4'}`}>
                    {!updating && paginatedDayGames.map((game) => {
                        const gameHeader = gameHeaders[game.home_team_id];

                        if (gameHeader) {
                            return settings.homePage?.useBlasesloaded ? (
                                <Link key={game.game_id} href={"/game/" + game.game_id}>
                                    <FullBlobileDisplay gameId={gameHeader.gameId} homeTeam={gameHeader.homeTeam} awayTeam={gameHeader.awayTeam} game={gameHeader.game} />
                                </Link>
                            ) : (
                                <Link key={game.game_id} href={"/game/" + game.game_id}>
                                    <LiveGameCompact gameId={gameHeader.gameId} homeTeam={MapAPITeamResponse(gameHeader.homeTeam)} awayTeam={MapAPITeamResponse(gameHeader.awayTeam)} game={MapAPIGameResponse(gameHeader.game)} killLinks={true} />
                                </Link>
                            )
                        } else {
                            return (
                                <Link key={game.game_id} href={`/watch/${game.game_id}`}>
                                    <MinifiedGameHeader game={game} />
                                </Link>
                            );
                        }
                    })}
                </div>
            </div>
        </main>
    );
}