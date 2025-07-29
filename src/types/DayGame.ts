import { Weather } from "./Weather"

export type DayGame = {
    away_team_color: string,
    away_team_emoji: string,
    away_team_id: string,
    away_team_name: string,
    away_team_runs: number,
    home_team_color: string,
    home_team_emoji: string,
    home_team_id: string,
    home_team_name: string,
    home_team_runs: number,
    weather: Weather,
    game_id: string,
    status: string,
}

export function MapDayGameAPIResponse(data: any): DayGame {
    return {
        away_team_color: data.AwayTeamColor,
        away_team_emoji: data.AwayTeamEmoji,
        away_team_id: data.AwayTeamID,
        away_team_name: data.AwayTeamName,
        away_team_runs: data.AwayTeamRuns,
        home_team_color: data.HomeTeamColor,
        home_team_emoji: data.HomeTeamEmoji,
        home_team_id: data.HomeTeamID,
        home_team_name: data.HomeTeamName,
        home_team_runs: data.HomeTeamRuns,
        weather: {
            emoji: data.Weather.Emoji,
            name: data.Weather.Name,
            tooltip: data.Weather.tooltip,
        },
        game_id: data.game_id,
        status: data.status,
    };
}