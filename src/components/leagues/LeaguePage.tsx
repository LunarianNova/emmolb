// components/LeaguePage.tsx
'use client'

import Loading from "@/components/Loading";
import { useEffect, useState } from "react";
import LeagueHeader from "./LeagueHeader";
import { MapAPILeagueTeamResponse, Team } from "@/types/Team";
import { League, MapAPILeagueResponse } from "@/types/League";
import GamesRemaining, { getGamesLeft } from "./GamesRemaining";
import { LeagueStandings } from "./LeagueStandings";

export type LeagueStandingsProps = {
    league: League;
    teams: Team[];
    cutoff?: { index: number, text: string },
    showIndex?: boolean;
}

type LeaguePageProps = {
    id?: string;
    greaterLeague?: boolean;
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

    const gamesLeft = getGamesLeft(time, !!greaterLeague);
    const wildcardWinDiff = greaterLeague
        ? [...leagueStandingsProps[0].teams.slice(1), ...leagueStandingsProps[1].teams.slice(1)]
            .map(team => team.record.regular_season.wins - team.record.regular_season.losses).sort()[3]
        : undefined;

    const isCurrentGameDay = time.season_day % 2 === (greaterLeague ? 1 : 0);

    return (
        <div className="flex flex-col items-center min-h-screen">
            {greaterLeague
                ? <h1 className="text-2xl font-bold text-center mb-2">Greater League Standings</h1>
                : (ids.length == 1 ? <LeagueHeader league={leagueStandingsProps[0].league} /> : '')}
            <GamesRemaining time={time} playsOnOddDays={!!greaterLeague} />
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
    );
}
