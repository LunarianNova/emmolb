import { defaultStats, DerivedPlayerStats, MapAPIPlayerStats, PlayerStats } from "./PlayerStats";

export type TeamPlayer = {
    emoji: string;
    first_name: string;
    last_name: string;
    number: number;
    player_id: string;
    position: string;
    position_type: string;
    slot: string;
    stats: DerivedPlayerStats;
}

export type Team = {
    abbreviation: string;
    active: boolean;
    augments: number;
    ballpark_name?: string,
    ballpark_suffix?: string,
    ballpark_use_city?: boolean,
    ballpark_word_1?: string,
    ballpark_word_2?: string,
    championships: number;
    color: string;
    emoji: string;
    feed: any[];
    full_location: string;
    league: string;
    location: string;
    modifications: any[];
    motes_used: number;
    motto?: string;
    name: string;
    owner_id: string;
    players: TeamPlayer[];
    record: {
        regular_season: {
            losses: number;
            run_differential: number;
            wins: number
        };
    };
    season_records: Record<string, string>;
    id: string;
}

export function MapTeamLite(data: any): Team {
    data = data.data;
    return {
        abbreviation: data.Abbreviation,
        active: data.Active,
        augments: data.Augments,
        ballpark_name: data.BallparkName,
        ballpark_suffix: data.BallparkSuffix,
        ballpark_use_city: data.BallparkUseCity,
        ballpark_word_1: data.BallparkWord1,
        ballpark_word_2: data.BallparkWord2,
        championships: data.Championships,
        color: data.Color,
        emoji: data.Emoji,
        feed: [],
        full_location: data.FullLocation,
        league: data.League,
        location: data.Location,
        modifications: data.Modifications,
        motes_used: data.MotesUsed,
        motto: data.Motto,
        name: data.Name,
        owner_id: data.OwnerID,
        players: data.Players.map((p: any) => ({
            emoji: p.Emoji,
            first_name: p.FirstName,
            last_name: p.LastName,
            number: p.Number,
            player_id: p.PlayerID,
            position: p.Position,
            position_type: p.PositionType,
            slot: p.Slot,
            stats: null
        })),
        record: {
            regular_season: {
                losses: data.Record["Regular Season"].Losses,
                run_differential: data.Record["Regular Season"].RunDifferential,
                wins: data.Record["Regular Season"].Wins,
            },
        },
        season_records: data.SeasonRecords,
        id: data._id,
    };
}

export function MapAPITeamResponse(data: any): Team {
    return {
        abbreviation: data.Abbreviation,
        active: data.Active,
        augments: data.Augments,
        ballpark_name: data.BallparkName,
        ballpark_suffix: data.BallparkSuffix,
        ballpark_use_city: data.BallparkUseCity,
        ballpark_word_1: data.BallparkWord1,
        ballpark_word_2: data.BallparkWord2,
        championships: data.Championships,
        color: data.Color,
        emoji: data.Emoji,
        feed: data.Feed,
        full_location: data.FullLocation,
        league: data.League,
        location: data.Location,
        modifications: data.Modifications,
        motes_used: data.MotesUsed,
        motto: data.Motto,
        name: data.Name,
        owner_id: data.OwnerID,
        players: data.Players.map((p: any) => ({
            emoji: p.Emoji,
            first_name: p.FirstName,
            last_name: p.LastName,
            number: p.Number,
            player_id: p.PlayerID,
            position: p.Position,
            position_type: p.PositionType,
            slot: p.Slot,
            stats: MapAPIPlayerStats(p.Stats as Partial<PlayerStats>)
        })),
        record: {
            regular_season: {
                losses: data.Record["Regular Season"].Losses,
                run_differential: data.Record["Regular Season"].RunDifferential,
                wins: data.Record["Regular Season"].Wins,
            },
        },
        season_records: data.SeasonRecords,
        id: data._id,
    };
}

export function MapAPILeagueTeamResponse(data: any): Team {
    const regularSeasonRecord = data.Record?.["Regular Season"] ?? {};

    return {
        abbreviation: data.Abbreviation,
        active: data.Active,
        augments: data.Augments,
        ballpark_name: data.BallparkName,
        championships: data.Championships,
        color: data.Color,
        emoji: data.Emoji,
        feed: data.Feed,
        full_location: data.FullLocation,
        league: data.League,
        location: data.Location,
        modifications: data.Modifications,
        motes_used: data.MotesUsed,
        motto: data.Motto,
        name: data.Name,
        owner_id: data.OwnerID,
        players: [{
            emoji: '',
            first_name: '',
            last_name: '',
            number: 0,
            player_id: '',
            position: '',
            position_type: '',
            slot: '',
            stats: MapAPIPlayerStats(defaultStats)
        }],
        record: {
            regular_season: {
                losses: regularSeasonRecord.Losses ?? 0,
                run_differential: regularSeasonRecord.RunDifferential ?? 0,
                wins: regularSeasonRecord.Wins ?? 0,
            },
        },
        season_records: data.SeasonRecords,
        id: data._id,
    };
}

export const PlaceholderTeam: Team = {
    abbreviation: "PHT",
    active: false,
    augments: 0,
    championships: 0,
    color: 'ffffff',
    emoji: '🧩',
    feed: [],
    full_location: 'Placeholder, Placeholder',
    league: 'placeholder',
    location: 'Placeholder',
    modifications: [],
    motes_used: 0,
    name: 'Placeholders',
    owner_id: 'placeholder',
    players: [],
    record: {
        regular_season: {
            wins: 0,
            losses: 0,
            run_differential: 0
        }
    },
    season_records: {'placeholder': 'placeholder'},
    id: 'placeholder'
}