export type Event = {
    away_score: number;
    balls: number;
    batter?: string;
    event: string;
    home_score: number;
    index: number;
    inning: number;
    inning_side: number;
    message: string;
    on_1b: boolean;
    on_2b: boolean;
    on_3b: boolean;
    on_deck?: string;
    outs: number;
    pitch_info: string;
    pitcher?: string;
    strikes: number;
    zone: string;
}