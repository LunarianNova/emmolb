import { Player, EquipmentEffect } from "@/types/Player";
import { pitchingAttrs, battingAttrs, defenseAttrs, runningAttrs, trunc } from "./Constants";
import { boonTable } from "./BoonDictionary";

const buildCSVRows = (teamPlayers: Player[], feedTotals: Record<string, Record<number, Record<number, Record<string, number>>>>) => {
    const headers = [
        "PlayerName",
        "Category",
        "Stat",
        "Stars",
        "StarBucketLower",
        "StarBucketUpper",
        "ItemTotal",
        "AugmentTotal",
        "TotalBucketLower",
        "TotalBucketUpper",
        "NominalTotal"
    ];

    const categories = {
        Pitching: pitchingAttrs,
        Batting: battingAttrs,
        Defense: defenseAttrs,
        Baserunning: runningAttrs
    };

    const rows = [];

    for (const statsPlayer of teamPlayers) {
        if (!statsPlayer) continue;
        const name = `${statsPlayer.first_name} ${statsPlayer.last_name}`;
        const talk = statsPlayer?.talk;
        const boon = statsPlayer?.lesser_boon?.name;
        const playerFeed = feedTotals[name];
        const itemTotals: Map<string, number> = new Map<string, number>();
        const items = [statsPlayer.equipment.head, statsPlayer.equipment.body, statsPlayer.equipment.hands, statsPlayer.equipment.feet, statsPlayer.equipment.accessory];
        items.map((item) => {
            if (item == null || item.rarity == 'Normal') return null;
            item.effects.map((effect: EquipmentEffect) => {
                const amount = Math.round(effect.value * 100);
                itemTotals.set(effect.attribute, amount + (itemTotals.get(effect.attribute) ?? 0));
            })
        })

        for (const [category, stats] of Object.entries(categories)) {
            const mappedCategory = category === 'Baserunning' ? 'base_running' : category.toLowerCase();
            const talkData = talk?.[mappedCategory];
            const talkDay = talkData?.day ?? 0;
            const talkSeason = talkData?.season ?? 0;
            const starsObj = talkData?.stars;

            for (const stat of stats) {
                const boonMultiplier = boon ? boonTable?.[boon]?.[stat] ?? 1 : 1;
                const stars = starsObj?.[stat]?.length ?? null;

                const itemTotal = itemTotals.get(stat) ?? 0;

                let feedTotal = 0;
                if (playerFeed) {
                    for (const [seasonStr, seasonData] of Object.entries(playerFeed)) {
                        const season = Number(seasonStr);
                        if (season < talkSeason) continue;

                        for (const [dayStr, statMap] of Object.entries(seasonData)) {
                            const day = Number(dayStr);
                            if (season === talkSeason && day < talkDay) continue;

                            const amount = statMap[stat];
                            if (amount) feedTotal += amount;
                        }
                    }
                }

                const bottom = stars !== null ? stars * 25 - 12.5 : null;
                const top = stars !== null ? stars * 25 + 12.5 : null;
                const lower = bottom !== null ? bottom + itemTotal + feedTotal : null;
                const upper = top !== null ? top + itemTotal + feedTotal : null;
                const nominal = stars !== null ? stars * 25 + itemTotal + feedTotal : null;

                rows.push([
                    name,
                    category,
                    stat,
                    stars ?? "???",
                    bottom !== null ? trunc(bottom * boonMultiplier) : "???",
                    top !== null ? trunc(top * boonMultiplier) : "???",
                    trunc(itemTotal * boonMultiplier),
                    trunc(feedTotal * boonMultiplier),
                    lower !== null ? trunc(lower * boonMultiplier) : "???",
                    upper !== null ? trunc(upper * boonMultiplier) : "???",
                    nominal !== null ? trunc(nominal * boonMultiplier) : "???"
                ]);
            }
        }
    }

    return [headers, ...rows];
};

export const downloadCSV = (players: Player[], feedTotals: Record<string, Record<number, Record<number, Record<string, number>>>>) => {
    const rows = buildCSVRows(players, feedTotals);
    const csvContent = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "player_stats.csv";
    a.click();
    URL.revokeObjectURL(url);
};