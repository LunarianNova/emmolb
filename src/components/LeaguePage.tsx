// components/LeaguePage.tsx
'use client'

import Loading from "@/components/Loading";
import { useEffect, useState } from "react";
import LeagueHeader from "./LeagueHeader";
import MiniTeamHeader from "./MiniTeamHeader";
import { MapAPILeagueTeamResponse, Team } from "@/types/Team";
import { League, MapAPILeagueResponse } from "@/types/League";

type LeagueStandingsProps = {
    league: League;
    teams: Team[];
    cutoff?: { index: number, text: string },
    showIndex?: boolean;
}

type LeaguePageProps = {
    id?: string;
    greaterLeague?: boolean;
}

function getCurrentPhase(now: Date, phases: { name: string, start: string }[]): string {
    const preview = phases.find(p => p.name === "PostseasonPreview");
    if (!preview) return "Unknown";
    return now >= new Date(preview.start) ? "Postseason" : "Regular Season";
}

function LeagueStandings({ league, teams, cutoff, showIndex }: LeagueStandingsProps) {
    if (!league || !teams.length) return (<div className="text-white text-center mt-10">Can't find that league</div>);
    const columnWidths = [14, 9, 10, 9];

    return <div className="w-full space-y-2">
        <div className='flex justify-end px-2 text-xs font-semibold uppercase'>
            <div className={`ml-1 w-${columnWidths[0]} text-right`}>Record</div>
            <div className={`ml-1 w-${columnWidths[1]} text-right`}>WD</div>
            <div className={`ml-1 w-${columnWidths[2]} text-right`}>RD</div>
            <div className={`ml-1 w-${columnWidths[3]} text-right`}>GB</div>
        </div>
        {teams.map((team: any, index) => (
            <div key={team.id || index}>
                {index === cutoff?.index && (
                    <div className="relative my-4 flex items-center" aria-label="Cutoff line">
                        <div className="absolute -left-2 sm:left-0 sm:-translate-x-full bg-theme-text text-xs font-bold px-2 py-0.5 rounded-sm select-none text-theme-background whitespace-nowrap">
                            {cutoff?.text}
                        </div>
                        <div className="flex-grow border-t-2 border-theme-text"></div>
                    </div>
                )}
                <MiniTeamHeader team={team} leader={teams[0]} index={showIndex ? index + 1 : undefined} columnWidths={columnWidths} />
            </div>
        ))}
    </div>
}

export default function LeaguePage({ id, greaterLeague }: LeaguePageProps) {
    const ids = greaterLeague ? ['6805db0cac48194de3cd3fe4', '6805db0cac48194de3cd3fe5',] : [id];
    const [loading, setLoading] = useState(true);
    const [leagueStandingsProps, setLeagueStandingsProps] = useState<LeagueStandingsProps[]>([]);
    const [time, setTime] = useState<any>();

    useEffect(() => {
        async function APICalls() {
            try {
                const responses = await Promise.all(ids.map(async id => {
                    const leagueRes = await fetch(`/nextapi/league/${id}`);
                    if (!leagueRes.ok) throw new Error('Failed to load league data');
                    const league = MapAPILeagueResponse(await leagueRes.json());

                    const teamsRes = await fetch(`/nextapi/league-top-teams/${id}`);
                    if (!teamsRes.ok) throw new Error('Failed to load teams');
                    const json = await teamsRes.json();

                    if (!Array.isArray(json.teams)) throw new Error('Teams response was not an array');
                    const teams = json.teams.map((team: any) => MapAPILeagueTeamResponse(team));
                    return { league, teams };
                }));
                setLeagueStandingsProps(responses);

                const timeRes = await fetch(`/nextapi/time`);
                if (!timeRes.ok) throw new Error('Failed to load time');
                setTime(await timeRes.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        APICalls();
    }, [id]);

    if (loading) return (<Loading />);

    const totalGamesInSeason = 120;
    const day = time.season_day;
    const gamesPlayed = greaterLeague ? Math.floor((day+1)/2) : Math.floor(day/2);
    const gamesLeft = totalGamesInSeason - gamesPlayed;

    const wildcardWinDiff = greaterLeague
        ? [...leagueStandingsProps[0].teams.slice(1), ...leagueStandingsProps[1].teams.slice(1)]
            .map(team => team.record.regular_season.wins - team.record.regular_season.losses).sort()[3]
        : undefined;

    const phase = getCurrentPhase(new Date(), Object.entries(time.phase_times as Record<string, string>).map(([name, start]) => ({ name, start })));
    const isPostseason = phase === 'Postseason';
    const postSeasonGL = `Final Standings for Season ${time.season_number}`

    const isCurrentGameDay = time.season_day % 2 === (greaterLeague ? 1 : 0);
    const pluralGamesLeft = gamesLeft !== 1;
    const formattedGL = `${gamesLeft}${isCurrentGameDay ? `-${gamesLeft + 1}` : ''} Game${pluralGamesLeft ? 's' : ''} Remain${pluralGamesLeft ? '' : 's'}`;

    return (
        <main className="mt-16">
            <div className="flex flex-col items-center min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-20 mx-auto">
                {greaterLeague
                    ? <h1 className="text-2xl font-bold text-center mb-2">Greater League Standings</h1>
                    : (ids.length == 1 ? <LeagueHeader league={leagueStandingsProps[0].league} /> : '')}
                <div className="text-center mt-0 mb-4 text-lg font-bold">{isPostseason ? postSeasonGL : formattedGL}</div>
                <div className="flex flex-wrap justify-center gap-8 mb-8">

                    {leagueStandingsProps.map(({ league, teams }, i) => {
                        const topTeamWinDiff = greaterLeague
                            ? wildcardWinDiff!
                            : teams[0].record.regular_season.wins - teams[0].record.regular_season.losses;

                        const worstCaseTopTeam = isCurrentGameDay ? topTeamWinDiff - gamesLeft + 1 : topTeamWinDiff - gamesLeft;
                        let cutoffIndex = teams.findIndex(team => (((team.record.regular_season.wins + gamesLeft) - team.record.regular_season.losses) < (worstCaseTopTeam)));
                        cutoffIndex = cutoffIndex === 0 ? 1 : cutoffIndex;
                        const cutoff = { index: cutoffIndex, text: greaterLeague ? 'PLAYOFFS' : '#1 CUTOFF' }

                        return <div className={`w-[${greaterLeague ? '30' : '36'}rem]`}>
                            {greaterLeague
                                ? <h2 className="text-xl font-bold text-center mb-4">{league.name} Division</h2>
                                : (ids.length > 1 ? <LeagueHeader league={league} /> : '')}
                            <div className="flex justify-center">
                                <LeagueStandings league={league} teams={teams} cutoff={cutoff} showIndex={!greaterLeague} />
                            </div>
                        </div>
                    })}
                </div>
            </div>
        </main>
    );
}
