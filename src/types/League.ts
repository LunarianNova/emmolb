export type League = {
    color?: string;
    emoji?: string;
    league_type?: string;
    name?: string;
    teams: string[];
    id: string;
}

export function MapAPILeagueResponse(data: any): League {
    return {
        color: data.Color,
        emoji: data.Emoji,
        league_type: data.LeagueType,
        name: data.Name,
        teams: data.Teams,
        id: data._id,
    };
}