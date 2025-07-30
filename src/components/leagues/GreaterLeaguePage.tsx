'use client'

import GamesRemaining, { getGamesLeft } from "@/components/leagues/GamesRemaining";
import { LeagueStandings } from "@/components/leagues/LeagueStandings";
import Loading from "@/components/Loading";
import { fetchLeague, fetchTopTeamsFromLeague, fetchTime } from "@/types/Api";
import { League } from "@/types/League";
import { Team } from "@/types/Team";
import { Time } from "@/types/Time";
import { useState, useEffect } from "react";

export default function Page() {
    const ids = ['6805db0cac48194de3cd3fe4', '6805db0cac48194de3cd3fe5',];
    const [loading, setLoading] = useState(true);
    const [leagues, setLeagues] = useState<{ league: League, teams: Team[] }[]>([]);
    const [time, setTime] = useState<Time>();

    useEffect(() => {
        async function APICalls() {
            try {
                const responses = await Promise.all(ids.map(async id => {
                    const league = await fetchLeague(id);
                    const teams = await fetchTopTeamsFromLeague(id);
                    return { league, teams };
                }));
                setLeagues(responses);
                setTime(await fetchTime());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        APICalls();
    }, []);

    if (loading) return (<Loading />);
    if (!leagues.length || !time) return (<div className="text-white text-center mt-10">Can't find that league</div>);

    const gamesLeft = getGamesLeft(time, true);
    const wildcardWinDiff = [...leagues[0].teams.slice(1), ...leagues[1].teams.slice(1)]
        .map(team => team.record.regular_season.wins - team.record.regular_season.losses).sort()[3];

    return (
        <div className="flex flex-col items-center min-h-screen">
            <h1 className="text-2xl font-bold text-center mb-2">Greater League Standings</h1>
            <GamesRemaining time={time} playsOnOddDays={true} />
            <div className="flex flex-wrap justify-center gap-8">
                {leagues.map(({ league, teams }, i) => {
                    return <div key={i} className='w-[28rem]'>
                        <h2 className="text-xl font-bold text-center mb-4">{league.name} Division</h2>
                        <LeagueStandings
                            league={league}
                            teams={teams}
                            cutoff={{ winDiff: wildcardWinDiff, gamesLeft: gamesLeft[1], text: 'PLAYOFF' }}
                            showIndex={false} />
                    </div>
                })}
            </div>
        </div>
    );
}
