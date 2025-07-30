// components/LeaguePage.tsx
'use client'

import GamesRemaining, { getGamesLeft } from "@/components/leagues/GamesRemaining";
import LeagueHeader from "@/components/leagues/LeagueHeader";
import { LeagueStandings } from "@/components/leagues/LeagueStandings";
import Loading from "@/components/Loading";
import { fetchLeague, fetchTopTeamsFromLeague, fetchTime } from "@/types/Api";
import { League } from "@/types/League";
import { Team } from "@/types/Team";
import { Time } from "@/types/Time";
import { useState, useEffect } from "react";

interface PageProps {
    id: string;
}

export default function LesserLeaguePage({ id }: PageProps) {
    const [loading, setLoading] = useState(true);
    const [league, setLeague] = useState<League>();
    const [teams, setTeams] = useState<Team[]>([]);
    const [time, setTime] = useState<Time>();

    useEffect(() => {
        async function APICalls() {
            try {
                setLeague(await fetchLeague(id));
                setTeams(await fetchTopTeamsFromLeague(id));
                setTime(await fetchTime());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        APICalls();
    }, [id]);

    if (loading) return (<Loading />);
    if (!league || !teams.length || !time) return (<div className="text-white text-center mt-10">Can't find that league</div>);

    const gamesLeft = getGamesLeft(time, false);
    const topTeamWinDiff = teams[0].record.regular_season.wins - teams[0].record.regular_season.losses;

    return (
        <div className="flex flex-col items-center min-h-screen">
            <LeagueHeader league={league} />
            <GamesRemaining time={time} playsOnOddDays={false} />

            <div className='w-[36rem]'>
                <LeagueStandings
                    league={league}
                    teams={teams}
                    cutoff={{winDiff: topTeamWinDiff, gamesLeft: gamesLeft[1], text: '#1 CUTOFF'}}
                    showIndex={false} />
            </div>
        </div>
    );
}
