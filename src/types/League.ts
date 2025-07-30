import { Team, MapAPILeagueTeamResponse } from "./Team";

export type League = {
    color?: string;
    emoji?: string;
    league_type?: string;
    name?: string;
    teams: string[];
    id: string;
}

export async function fetchLeague(id: string): Promise<League> {
    const leagueRes = await fetch(`/nextapi/league/${id}`);
    if (!leagueRes.ok) throw new Error('Failed to load league data');
    const data = await leagueRes.json();
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
    const teamsRes = await fetch(`/nextapi/league-top-teams/${id}`);
    if (!teamsRes.ok) throw new Error('Failed to load teams');
    const json = await teamsRes.json();

    if (!Array.isArray(json.teams)) throw new Error('Teams response was not an array');
    return json.teams.map((team: any) => MapAPILeagueTeamResponse(team));
}
