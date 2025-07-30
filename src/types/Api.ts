'use server'

import { League } from "./League";
import { Team, MapAPILeagueTeamResponse } from "./Team";
import { Time } from "./Time";

export async function fetchLeague(id: string): Promise<League> {
    'use server';
    const res = await fetch(`https://mmolb.com/api/league/${id}`);
    if (!res.ok) throw new Error('Failed to load league data');
    const data = await res.json();
    return {
        color: data.Color,
        emoji: data.Emoji,
        league_type: data.LeagueType,
        name: data.Name,
        teams: data.Teams,
        id: data._id,
    };
}

export async function fetchTopTeamsFromLeague(id: string): Promise<Team[]> {
    'use server';
    const teamsRes = await fetch(`https://mmolb.com/api/league-top-teams/${id}`);
    if (!teamsRes.ok) throw new Error('Failed to load teams');
    const json = await teamsRes.json();

    if (!Array.isArray(json.teams)) throw new Error('Teams response was not an array');
    return json.teams.map((team: any) => MapAPILeagueTeamResponse(team));
}

export async function fetchTime(): Promise<Time> {
    const res = await fetch(`/nextapi/time`);
    if (!res.ok) throw new Error('Failed to load time');
    const data = await res.json();
    return {
        seasonDay: data.season_day,
        seasonNumber: data.season_number,
        seasonStatus: data.season_status,
        phaseTimes: {
            electionStart: data.phase_timesElectionStart,
            holidayStart: data.phase_timesHolidayStart,
            homeRunChallenge: data.phase_timesHomeRunChallenge,
            openingDay: data.phase_timesOpeningDay,
            postseasonPreview: data.phase_timesPostseasonPreview,
            postseasonRound1: data.phase_timesPostseasonRound1,
            postseasonRound2: data.phase_timesPostseasonRound2,
            postseasonRound3: data.phase_timesPostseasonRound3,
            preseason: data.phase_timesPreseason,
            regularSeasonResume: data.phase_timesRegularSeasonResume,
            superstarBreakStart: data.phase_timesSuperstarBreakStart,
            superstarGame: data.phase_timesSuperstarGame,
        },
    };
}
