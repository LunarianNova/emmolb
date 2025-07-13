export type CashewsEquipment = {
    Name?: string;
    Emoji?: string;
    Prefix?: string;
    Rarity?: string;
    Suffix?: string;
    Effects: any[];
}

export type CashewsPlayer = {
    kind: string;
    entity_id: string;
    valid_from: string;
    valid_to?: string;
    data: {
        _id: string;
        Bats: string;
        Feed: any[];
        Home: string;
        Likes: string;
        Stats: Record<any, any>;
        Number: number;
        TeamID: string;
        Throws: string;
        Augments: number;
        Birthday: string;
        Dislikes: string;
        LastName: string;
        Position: string;
        Equipment: {
            Body?: CashewsEquipment;
            Feet?: CashewsEquipment;
            Head?: CashewsEquipment;
            Hands?: CashewsEquipment;
            Accessory?: CashewsEquipment; 
        }
        FirstName: string;
        Durability: number;
        LesserBoon?: string;
        Birthseason: number;
        GreaterBoon?: string;
        SeasonStats: Record<string, Record<string, string>>;
        PositionType: string;
        Modifications: any[];
    }
}

export type CashewsPlayers = {
    items: CashewsPlayer[]
}