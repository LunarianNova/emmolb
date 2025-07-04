import { MapAPIPlayerStats, PlayerStats } from "./PlayerStats";

export type EquipmentEffect = {
    attribute: string;
    type: string;
    value: number;
}

export type Equipment = {
    effects: EquipmentEffect[];
    emoji: string;
    name: string;
    prefix: string | null;
    rarity: string;
    slot?: string;
    suffix: string | null;
}

export type Player = {
    augments: number;
    bats: string;
    birthday: string;
    birth_season: number;
    dislikes: string;
    durability: number;
    equipment: {
        accessory: Equipment | null;
        body: Equipment | null;
        feet: Equipment | null;
        hands: Equipment | null;
        head: Equipment | null;
    }
    feed: any[];
    first_name: string;
    greater_boon: string | null;
    home: string;
    last_name: string;
    lesser_boon: string | null;
    likes: string;
    modifications: any[];
    number: number;
    position: string;
    position_type: string;
    season_stats: Record<string, Record<string, string>>;
    stats: Record<string, PlayerStats>;
    team_id: string;
    throws: string;
    id: string;
}

function mapEffect(effect: any): EquipmentEffect {
    return {
        attribute: effect.Attribute,
        type: effect.Type,
        value: effect.Value,
    };
}

function mapEquipment(raw: any): Equipment | null {
    if (!raw) return null;

    return {
        effects: Array.isArray(raw.Effects) ? raw.Effects.map(mapEffect) : [],
        emoji: raw.Emoji,
        name: raw.Name,
        prefix: raw.Prefix,
        rarity: raw.Rarity,
        slot: raw.Slot,
        suffix: raw.Suffix,
    };
}

export function MapAPIPlayerResponse(data: any): Player {
    return {
        augments: data.Augments,
        bats: data.Bats,
        birthday: data.Birthday,
        birth_season: data.Birthseason,
        dislikes: data.Dislikes,
        durability: data.Durability,
        equipment: {
            accessory: mapEquipment(data.Equipment.Accessory),
            body: mapEquipment(data.Equipment.Body),
            feet: mapEquipment(data.Equipment.Feet),
            hands: mapEquipment(data.Equipment.Hands),
            head: mapEquipment(data.Equipment.Head),
        },
        feed: data.Feed,
        first_name: data.FirstName,
        greater_boon: data.GreaterBoon,
        home: data.Home,
        last_name: data.LastName,
        lesser_boon: data.LesserBoon,
        likes: data.Likes,
        modifications: data.Modifications,
        number: data.Number,
        position: data.Position,
        position_type: data.PositionType,
        season_stats: data.SeasonStats,
        stats: Object.fromEntries(Object.entries(data.Stats ?? {}).map(([season, stats]) => [season, MapAPIPlayerStats(stats as Partial<PlayerStats>)])),
        team_id: data.TeamID,
        throws: data.Throws,
        id: data._id,
    };
}