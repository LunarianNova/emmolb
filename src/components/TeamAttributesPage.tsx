'use client'
import Loading from "@/components/Loading";
import { Dispatch, Fragment, SetStateAction, useEffect, useState } from "react";
import { MapAPITeamResponse, PlaceholderTeam, Team, TeamPlayer } from "@/types/Team";
import { MapAPIPlayerResponse, Player } from "@/types/Player";
import { FeedMessage } from "@/types/FeedMessage";

const battingAttrs = ['Aiming', 'Contact', 'Cunning', 'Determination', 'Discipline', 'Insight', 'Intimidation', 'Lift', 'Muscle', 'Selflessness', 'Vision', 'Wisdom'];
const pitchingAttrs = ['Accuracy', 'Control', 'Defiance', 'Guts', 'Persuasion', 'Presence', 'Rotation', 'Stamina', 'Stuff', 'Velocity'];
const defenseAttrs = ['Acrobatics', 'Agility', 'Arm', 'Awareness', 'Composure', 'Dexterity', 'Patience', 'Reaction'];
const runningAttrs = ['Greed', 'Performance', 'Speed', 'Stealth'];
const otherAttrs = ['Luck'];
const attrTypes: Record<string, string> = {};
for (const a of battingAttrs) attrTypes[a] = 'Batting';
for (const a of pitchingAttrs) attrTypes[a] = 'Pitching';
for (const a of defenseAttrs) attrTypes[a] = 'Defense';
for (const a of runningAttrs) attrTypes[a] = 'Running';
for (const a of otherAttrs) attrTypes[a] = 'Other';

type OpenDropboxes = {
    [name: string]: {
        [category: string]: boolean;
    };
};

export default function TeamAttributesPage({ id }: { id: string }) {
    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState<Team>(PlaceholderTeam);
    const [players, setPlayers] = useState<Player[] | undefined>(undefined);
    const [subpage, setSubpage] = useState<string>('items');
    const [feed, setFeed] = useState<FeedMessage[]>([]);

    async function APICalls() {
        try {
            const teamRes = await fetch(`/nextapi/team/${id}`);
            if (!teamRes.ok) throw new Error('Failed to load team data');
            const team = MapAPITeamResponse(await teamRes.json());
            setTeam(team);

            const playersRes = await fetch(`/nextapi/players?ids=${team.players.map((p: TeamPlayer) => p.player_id).join(',')}`);
            if (!playersRes.ok) throw new Error('Failed to load player data');
            const players = await playersRes.json();
            setPlayers(players.players.map((p: any) => MapAPIPlayerResponse(p)));

            const feedRes = await fetch(`/nextapi/feed/${id}`);
            if (!feedRes.ok) throw new Error('Failed to load feed data');
            const feed = await feedRes.json();
            setFeed(feed.feed as FeedMessage[]);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        APICalls();
    }, [id]);

    if (loading) return (
        <>
            <Loading />
        </>
    );

    if (!team) return (
        <>
            <div className="text-white text-center mt-10">Can't find that team</div>
        </>
    );

    return (<>
        {subpage === 'items' && (<TeamItemsPage setSubpage={setSubpage} APICalls={APICalls} team={team} players={players} />)}
        {subpage === 'summary' && (<TeamSummaryPage setSubpage={setSubpage} APICalls={APICalls} team={team} players={players} feed={feed} />)}
    </>);
}

function TeamSummaryPage ({ setSubpage, APICalls, team, players, feed, }: { setSubpage: Dispatch<SetStateAction<string>>; APICalls: () => void; team: Team; players: Player[] | undefined; feed: FeedMessage[] }) {
    const [highlights, setHighlights] = useState<Record<string, boolean>>({});
    const [openDropboxes, setOpenDropboxes] = useState<OpenDropboxes>({}) // PlayerName: "batting: true, defense: false, etc"
    
    function toggleAttr(attribute: string): void {
        const newHighlights = { ...highlights };
        newHighlights[attribute] = !highlights[attribute];
        setHighlights(newHighlights);
    }

    const boonTable: Record<string, Record<string, number>> = {
        "ROBO": {
            "Accuracy": 1.5,
            "Discipline": 1.5,
            "Arm": 1.5,
            "Cunning": .5,
            "Presence": .5,
            "Speed": .5,
        },
        "Demonic": {
            "Muscle": 1.5,
            "Velocity": 1.5,
            "Reaction": 1.5,
            "Discipline": .5,
            "Control": .5,
            "Composure": .5,
        },
        "Angelic": {
            "Discipline": 1.5,
            "Control": 1.5,
            "Awareness": 1.5,
            "Muscle": 0.5,
            "Velocity": 0.5,
            "Reaction": 0.5,
        },
        "Undead": {
            "Determination": 1.5,
            "Stamina": 1.5,
            "Composure": 1.5,
            "Contact": 0.5,
            "Presence": 0.5,
            "Speed": 0.5,
        },
        "Giant": {
            "Muscle": 1.5,
            "Stamina": 1.5,
            "Arm": 1.5,
            "Contact": 0.5,
            "Control": 0.5,
            "Agility": 0.5,
        },
        "Fire Elemental": {
            "Lift": 1.5,
            "Velocity": 1.5,
            "Speed": 1.5,
            "Vision": 0.5,
            "Control": 0.5,
            "Composure": 0.5,
        },
        "Water Elemental": {
            "Contact": 1.5,
            "Control": 1.5,
            "Dexterity": 1.5,
            "Muscle": 0.5,
            "Velocity": 0.5,
            "Reaction": 0.5,
        },
        "Air Elemental": {
            "Aiming": 1.5,
            "Accuracy": 1.5,
            "Agility": 1.5,
            "Muscle": 0.5,
            "Velocity": 0.5,
            "Arm": 0.5,
        },
        "Earth Elemental": {
            "Contact": 1.5,
            "Stamina": 1.5,
            "Patience": 1.5,
            "Vision": 0.5,
            "Control": 0.5,
            "Speed": 0.5,
        },
        "Draconic": {
            "Lift": 1.5,
            "Presence": 1.5,
            "Arm": 1.5,
            "Discipline": 0.5,
            "Control": 0.5,
            "Agility": 0.5,
        },
        "Fae": {
            "Cunning": 1.5,
            "Persuasion": 1.5,
            "Dexterity": 1.5,
            "Muscle": 0.5,
            "Velocity": 0.5,
            "Arm": 0.5,
        },
        "One With All": {
            "Selflessness": 1.3,
            "Contact": 1.3,
            "Control": 1.3,
            "Velocity": 1.3,
            "Determination": 0.7,
            "Greed": 0.7,
            "Persuasion": 0.7,
            "Presence": 0.7,
        },
        "Archer's Mark": {
            "Aiming": 1.3,
            "Vision": 1.3,
            "Velocity": 1.3,
            "Accuracy": 1.3,
            "Intimidation": 0.7,
            "Greed": 0.7,
            "Stuff": 0.7,
            "Presence": 0.7,
        },
        "Geometry Expert": {
            "Insight": 1.3,
            "Contact": 1.3,
            "Control": 1.3,
            "Rotation": 1.3,
            "Muscle": 0.7,
            "Vision": 0.7,
            "Velocity": 0.7,
            "Defiance": 0.7,
        },
        "Scooter": {
            "Speed": 1.3,
            "Intimidation": 1.3,
            "Velocity": 1.3,
            "Defiance": 1.3,
            "Muscle": 0.7,
            "Discipline": 0.7,
            "Control": 0.7,
            "Stamina": 0.7,
        },
        "The Light": {
            "Vision": 1.3,
            "Discipline": 1.3,
            "Control": 1.3,
            "Presence": 1.3,
            "Contact": 0.7,
            "Performance": 0.7,
            "Velocity": 0.7,
            "Stuff": 0.7,
        },
        "Tenacious Badger": {
            "Determination": 1.3,
            "Muscle": 1.3,
            "Stamina": 1.3,
            "Guts": 1.3,
            "Vision": 0.7,
            "Speed": 0.7,
            "Persuasion": 0.7,
            "Defiance": 0.7,
        },
        "Stormrider": {
            "Lift": 1.3,
            "Speed": 1.3,
            "Velocity": 1.3,
            "Stuff": 1.3,
            "Wisdom": 0.7,
            "Stealth": 0.7,
            "Control": 0.7,
            "Rotation": 0.7,
        },
        "Insectoid": {
            "Intimidation": 1.3,
            "Muscle": 1.3,
            "Accuracy": 1.3,
            "Persuasion": 1.3,
            "Discipline": 0.7,
            "Insight": 0.7,
            "Defiance": 0.7,
            "Presence": 0.7,
        },
        "Clean": {
            "Determination": 1.3,
            "Discipline": 1.3,
            "Persuasion": 1.3,
            "Presence": 1.3,
            "Wisdom": 0.7,
            "Insight": 0.7,
            "Velocity": 0.7,
            "Defiance": 0.7,
        },
        "Shiny": {
            "Insight": 1.3,
            "Vision": 1.3,
            "Presence": 1.3,
            "Accuracy": 1.3,
            "Cunning": 0.7,
            "Stealth": 0.7,
            "Stuff": 0.7,
            "Guts": 0.7,
        },
        "Psychic": {
            "Vision": 1.3,
            "Wisdom": 1.3,
            "Accuracy": 1.3,
            "Persuasion": 1.3,
            "Intimidation": 0.7,
            "Muscle": 0.7,
            "Velocity": 0.7,
            "Stuff": 0.7,
        },
        "UFO": {
            "Contact": 1.3,
            "Lift": 1.3,
            "Rotation": 1.3,
            "Stuff": 1.3,
            "Discipline": 0.7,
            "Wisdom": 0.7,
            "Control": 0.7,
            "Stamina": 0.7,
        },
        "Spectral": {
            "Stealth": 1.3,
            "Intimidation": 1.3,
            "Presence": 1.3,
            "Rotation": 1.3,
            "Muscle": 0.7,
            "Contact": 0.7,
            "Stuff": 0.7,
            "Guts": 0.7,
        },
        "Amphibian": {
            "Speed": 1.3,
            "Performance": 1.3,
            "Velocity": 1.3,
            "Persuasion": 1.3,
            "Insight": 0.7,
            "Muscle": 0.7,
            "Presence": 0.7,
            "Defiance": 0.7,
        },
        "Mer": {
            "Determination": 1.3,
            "Wisdom": 1.3,
            "Control": 1.3,
            "Stuff": 1.3,
            "Lift": 0.7,
            "Aiming": 0.7,
            "Rotation": 0.7,
            "Guts": 0.7,
        },
        "Calculated": {
            "Discipline": 1.3,
            "Insight": 1.3,
            "Control": 1.3,
            "Accuracy": 1.3,
            "Muscle": 0.7,
            "Greed": 0.7,
            "Guts": 0.7,
            "Stamina": 0.7,
        },
    };

    const feedTotals: Record<string, Record<number, Record<number, Record<string, number>>>> = {} // Name: {Season: {Day: {Stat: Buff}}}
    for (const message of feed) {
        if (message.type != 'augment') continue;
        const regex = /([\p{L}\s.'-]+?) gained \+(\d+) (\w+)\./gu;
        const matches = [...message.text.matchAll(regex)];

        for (const match of matches) {
            const name = match[1].trim();
            const amount = Number(match[2]);
            const attribute = match[3];
            let day = Number(message.day);
            if (Number.isNaN(day)) day = 240;
            const season = Number(message.season);

            if (!feedTotals[name]) feedTotals[name] = {};
            if (!feedTotals[name][season]) feedTotals[name][season] = {};
            if (!feedTotals[name][season][day]) feedTotals[name][season][day] = {};
            if (!feedTotals[name][season][day][attribute]) feedTotals[name][season][day][attribute] = 0;

            feedTotals[name][season][day][attribute] += amount;
        }
    }

    return (
        <>
            <main className='mt-16'>
                <div className='flex flex-col items-center-safe min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-24 mx-auto'>
                    <h2 className='text-2xl font-bold mb-2 text-center'>Team Stats Summary</h2>
                    <button onClick={() => setSubpage('items')} className="self-center px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md mb-4">
                        Swap to Equipment
                    </button>
                    <div className='mt-4 flex flex-col'>
                        <div className='text-md text-center'>Click on an attribute to highlight it.</div>
                        <div className='flex mt-2 gap-2 justify-center'>
                            <button onClick={() => APICalls()} className="self-center px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md">
                                Refresh stats
                            </button>
                            <button onClick={() => setHighlights({})} className="self-center px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md">
                                Reset highlights
                            </button>
                        </div>
                        <div className='flex mt-6 gap-2 justify-start'>
                            <div className='text-sm font-semibold'>Batting:</div>
                            {battingAttrs.map(attr =>
                                <button key={attr} onClick={() => toggleAttr(attr)} className={`px-3 py-1 text-xs ${highlights[attr] ? 'bg-(--theme-score)' : 'bg-theme-primary'} hover:opacity-80 rounded-md`}>
                                    {attr}
                                </button>
                            )}
                        </div>
                        <div className='flex mt-2 gap-2 justify-start'>
                            <div className='text-sm font-semibold'>Pitching:</div>
                            {pitchingAttrs.map(attr =>
                                <button key={attr} onClick={() => toggleAttr(attr)} className={`px-3 py-1 text-xs ${highlights[attr] ? 'bg-(--theme-score)' : 'bg-theme-primary'} hover:opacity-80 rounded-md`}>
                                    {attr}
                                </button>
                            )}
                        </div>
                        <div className='flex mt-2 gap-2 justify-start'>
                            <div className='text-sm font-semibold'>Defense:</div>
                            {defenseAttrs.map(attr =>
                                <button key={attr} onClick={() => toggleAttr(attr)} className={`px-3 py-1 text-xs ${highlights[attr] ? 'bg-(--theme-score)' : 'bg-theme-primary'} hover:opacity-80 rounded-md`}>
                                    {attr}
                                </button>
                            )}
                        </div>
                        <div className='flex mt-2 gap-2 justify-start'>
                            <div className='text-sm font-semibold'>Baserunning:</div>
                            {runningAttrs.map(attr =>
                                <button key={attr} onClick={() => toggleAttr(attr)} className={`px-3 py-1 text-xs ${highlights[attr] ? 'bg-(--theme-score)' : 'bg-theme-primary'} hover:opacity-80 rounded-md`}>
                                    {attr}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className='grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_auto] gap-2 mt-6'>
                        {team.players.map((player, i) => {
                            const statsPlayer = players?.find((p: Player) => p.id === player.player_id);
                            if (!statsPlayer) return null;
                            const name = `${player.first_name} ${player.last_name}`;
                            const boon = statsPlayer.lesser_boon?.name;
                            const items = [statsPlayer.equipment.head, statsPlayer.equipment.body, statsPlayer.equipment.hands, statsPlayer.equipment.feet, statsPlayer.equipment.accessory];
                            const itemTotals: Map<string, number> = new Map<string, number>();
                            items.map((item) => {
                                if (item == null || item.rarity == 'Normal') return null;
                                item.effects.map((effect) => {
                                    const amount = Math.round(effect.value * 100);
                                    itemTotals.set(effect.attribute, amount + (itemTotals.get(effect.attribute) ?? 0));
                                })
                            })
                            const baseRow: number = i * 3 + 2;
                            return (
                                <div key={`player-${i}`} className={`row-${baseRow} col-span-full grid grid-cols-subgrid pt-2 border-t border-[--theme-text]/50`}>
                                    <div className='col-1'>
                                        <div className='grid grid-cols-[min-content_max-content] grid-rows-[min-content_min-content] gap-x-2 gap-y-0'>
                                            <div className='row-1 col-1 text-sm font-semibold self-baseline'>{player.slot}</div>
                                            <div className='row-1 col-2 text-md self-baseline'>{player.first_name}</div>
                                            <div className='row-2 col-2 text-md'>{player.last_name}</div>
                                        </div>
                                    </div>
                                    <div key={`stats-${i}`} className={`row-[${baseRow + 2}] col-[2/8] grid grid-cols-5 gap-2`}>
                                        {['Pitching', 'Batting', 'Defense', 'Baserunning'].map((category, j) => {
                                            let stats: string[] = [];
                                            switch (category){
                                                case 'Pitching':
                                                    stats = pitchingAttrs;
                                                    break;
                                                case 'Batting':
                                                    stats = battingAttrs;
                                                    break;
                                                case 'Defense':
                                                    stats = defenseAttrs;
                                                    break;
                                                case 'Baserunning':
                                                    stats = runningAttrs;
                                                    break;
                                            }
                                            const mappedCategory = category === 'Baserunning' ? 'base_running' : category.toLowerCase();
                                            const talk = statsPlayer.talk?.[mappedCategory];
                                            const talkDay = talk?.day ?? 0;
                                            const talkSeason = talk?.season ?? 0;
                                            return (<>
                                                <button
                                                    key={`${name}-${category}`}
                                                    onClick={() =>
                                                    setOpenDropboxes(prev => ({
                                                        ...prev,
                                                        [name]: {
                                                            ...prev[name],
                                                            [category]: !prev[name]?.[category],
                                                        },
                                                    }))
                                                    }
                                                    className={`row-[${baseRow + 2 + j}] col-[1/6] w-[60rem] px-3 py-1 text-l ${talk ? `bg-theme-primary hover:opacity-80` : `bg-theme-secondary opacity-80 hover:opacity-60`} rounded-md`}
                                                >
                                                    {category}
                                                </button>
                                                <div className={`row-[${baseRow + 1 + 2 * j}] col-[1/6] w-full px-3 py-1 ${openDropboxes[name]?.[category] ? '' : 'hidden'}`}>
                                                    <div className="grid grid-cols-[8.2rem_auto_8.2rem_8.2rem_8.2rem_8.2rem_8.2rem] mb-2">
                                                        <div className="bg-theme-primary px-1 text-center font-bold py-2 text-md text-theme-secondary">
                                                            Stat Name
                                                        </div>
                                                        <div className="bg-theme-primary px-1 text-center font-bold py-2 text-md text-theme-secondary">
                                                            Stars
                                                        </div>
                                                        <div className="bg-theme-primary px-1 text-center font-bold py-2 text-md text-theme-secondary">
                                                            Star Bucket
                                                        </div>
                                                        <div className="bg-theme-primary px-1 text-center font-bold py-2 text-md text-theme-secondary">
                                                            Item Total
                                                        </div>
                                                        <div className="bg-theme-primary px-1 text-center font-bold py-2 text-md text-theme-secondary">
                                                            Augment Total
                                                        </div>
                                                        <div className="bg-theme-primary px-1 text-center font-bold py-2 text-md text-theme-secondary">
                                                            Total Bucket
                                                        </div>
                                                        <div className="bg-theme-primary px-1 text-center font-bold py-2 text-md text-theme-secondary">
                                                            Nominal Total
                                                        </div>
                                                        {stats.map((stat, k) => {
                                                            let feedTotal = 0;
                                                            const playerFeed = feedTotals[name];
                                                            const boonMultiplier = boon ? Object.keys(boonTable[boon]).includes(stat) ? boonTable[boon][stat] : 1 : 1;
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

                                                            const stars = talk ? talk.stars?.[stat].length : null;
                                                            const starText = (
                                                                <div className="flex items-center">
                                                                    {stars ? (
                                                                        <>
                                                                            <span className="text-xl">{"🌟".repeat(Math.floor(stars / 5))}</span>
                                                                            <span>{"⭐".repeat(stars % 5)}</span>
                                                                        </>
                                                                    ) : ''}
                                                                </div>
                                                            );                                                            
                                                            const itemTotal = itemTotals.get(stat) ?? 0;
                                                            const bottomBucket = stars !== null ? Math.max(0, stars*25-12.5) : null;
                                                            const topBucket = stars !== null ? Math.max(0, stars*25+12.5) : null;
                                                            return (
                                                                <Fragment key={stat}>
                                                                    <div className={`${!highlights[stat] ? k%2==1 ? 'bg-theme-primary' : 'bg-theme-secondary' : 'bg-theme-score'} p-1 font-semibold relative`}>
                                                                        {stat}
                                                                        {boonMultiplier !== 1 && (
                                                                            <span className="absolute -right-1 text-xs">ㅤ *{boonMultiplier}</span>
                                                                        )}
                                                                    </div>
                                                                    <div className={`${!highlights[stat] ? k%2==1 ? 'bg-theme-primary' : 'bg-theme-secondary' : 'bg-theme-score'} p-1 font-semibold`}>
                                                                        {starText ? starText : '???'}
                                                                    </div>
                                                                    <div className={`${!highlights[stat] ? k%2==1 ? 'bg-theme-primary' : 'bg-theme-secondary' : 'bg-theme-score'} p-1 font-semibold`}>
                                                                        <div className="flex justify-between w-full opacity-80">
                                                                            <div className='text-start'>
                                                                                {stars !== null ? 
                                                                                    `${bottomBucket ? bottomBucket*boonMultiplier : bottomBucket}` 
                                                                                    : '???'
                                                                                }
                                                                            </div>
                                                                            <div className="absolute h-2 mt-0.7 ml-14 mx-2">–</div>
                                                                            <div className='text-end'>
                                                                                {stars !== null ? 
                                                                                    `${topBucket ? topBucket*boonMultiplier : topBucket}` 
                                                                                    : '???'
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className={`${!highlights[stat] ? k%2==1 ? 'bg-theme-primary' : 'bg-theme-secondary' : 'bg-theme-score'} p-1 text-center font-semibold`}>
                                                                        {itemTotal*boonMultiplier}
                                                                    </div>
                                                                    <div className={`${!highlights[stat] ? k%2==1 ? 'bg-theme-primary' : 'bg-theme-secondary' : 'bg-theme-score'} p-1 text-center font-semibold`}>
                                                                        {feedTotal*boonMultiplier}
                                                                    </div>
                                                                    <div className={`${!highlights[stat] ? k%2==1 ? 'bg-theme-primary' : 'bg-theme-secondary' : 'bg-theme-score'} p-1 font-semibold`}>
                                                                        <div className="flex justify-between w-full opacity-80">
                                                                            <span className="text-start">
                                                                                {stars !== null ? 
                                                                                    `${(bottomBucket! + itemTotal + feedTotal)*boonMultiplier}` 
                                                                                    : '???'
                                                                                }
                                                                            </span>
                                                                            <div className="absolute h-2 mt-0.7 ml-14 mx-2">–</div>
                                                                            <span className="text-end">
                                                                                {stars !== null ? 
                                                                                    `${(topBucket! + itemTotal + feedTotal)*boonMultiplier}` 
                                                                                    : '???'
                                                                                }
                                                                            </span>
                                                                        </div>                                                                    
                                                                    </div>
                                                                    <div className={`${!highlights[stat] ? k%2==1 ? 'bg-theme-primary' : 'bg-theme-secondary' : 'bg-theme-score'} p-1 text-center font-semibold`}>
                                                                        {stars !== null ? 
                                                                            `${(stars*25+itemTotal+feedTotal)*boonMultiplier}` 
                                                                            : `???`
                                                                        }
                                                                    </div>
                                                                </Fragment>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </>);
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </>
    );
}

function TeamItemsPage({ setSubpage, APICalls, team, players, }: { setSubpage: Dispatch<SetStateAction<string>>; APICalls: () => void; team: Team; players: Player[] | undefined }) {

    const [highlights, setHighlights] = useState<Record<string, boolean>>({});

    function toggleAttr(attribute: string): void {
        const newHighlights = { ...highlights };
        newHighlights[attribute] = !highlights[attribute];
        setHighlights(newHighlights);
    }

    function isRelevantAttr(player: TeamPlayer, attribute: string) {
        const attrType = attrTypes[attribute];
        switch (attrType) {
            case 'Batting':
            case 'Running':
                return player.position_type == 'Batter';
            case 'Pitching':
                return player.position_type == 'Pitcher';
            case 'Defense':
                return player.slot != 'DH';
            case 'Other':
                return true;
        }
        return false
    }

    return (
        <>
            <main className='mt-16'>
                <div className='flex flex-col items-center-safe min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-24 mx-auto'>
                    <h2 className='text-2xl font-bold mb-2 text-center'>Team Equipment</h2>
                    <button onClick={() => setSubpage('summary')} className="self-center px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md mb-4">
                        Swap to Summary
                    </button>
                    <div className='mt-4 flex flex-col'>
                        <div className='text-md text-center'>Click on an attribute to highlight it.</div>
                        <div className='flex mt-2 gap-2 justify-center'>
                            <button onClick={() => APICalls()} className="self-center px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md">
                                Refresh items
                            </button>
                            <button onClick={() => setHighlights({})} className="self-center px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md">
                                Reset highlights
                            </button>
                        </div>
                        <div className='flex mt-6 gap-2 justify-start'>
                            <div className='text-sm font-semibold'>Batting:</div>
                            {battingAttrs.map(attr =>
                                <button key={attr} onClick={() => toggleAttr(attr)} className={`px-3 py-1 text-xs ${highlights[attr] ? 'bg-(--theme-score)' : 'bg-theme-primary'} hover:opacity-80 rounded-md`}>
                                    {attr}
                                </button>
                            )}
                        </div>
                        <div className='flex mt-2 gap-2 justify-start'>
                            <div className='text-sm font-semibold'>Pitching:</div>
                            {pitchingAttrs.map(attr =>
                                <button key={attr} onClick={() => toggleAttr(attr)} className={`px-3 py-1 text-xs ${highlights[attr] ? 'bg-(--theme-score)' : 'bg-theme-primary'} hover:opacity-80 rounded-md`}>
                                    {attr}
                                </button>
                            )}
                        </div>
                        <div className='flex mt-2 gap-2 justify-start'>
                            <div className='text-sm font-semibold'>Defense:</div>
                            {defenseAttrs.map(attr =>
                                <button key={attr} onClick={() => toggleAttr(attr)} className={`px-3 py-1 text-xs ${highlights[attr] ? 'bg-(--theme-score)' : 'bg-theme-primary'} hover:opacity-80 rounded-md`}>
                                    {attr}
                                </button>
                            )}
                        </div>
                        <div className='flex mt-2 gap-2 justify-start'>
                            <div className='text-sm font-semibold'>Baserunning:</div>
                            {runningAttrs.map(attr =>
                                <button key={attr} onClick={() => toggleAttr(attr)} className={`px-3 py-1 text-xs ${highlights[attr] ? 'bg-(--theme-score)' : 'bg-theme-primary'} hover:opacity-80 rounded-md`}>
                                    {attr}
                                </button>
                            )}
                            <div className='text-sm font-semibold ml-10'>Other:</div>
                            {otherAttrs.map(attr =>
                                <button key={attr} onClick={() => toggleAttr(attr)} className={`px-3 py-1 text-xs ${highlights[attr] ? 'bg-(--theme-score)' : 'bg-theme-primary'} hover:opacity-80 rounded-md`}>
                                    {attr}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className='grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_auto] gap-2 mt-6'>
                        <div className='row-1 col-2 flex flex-col items-center'>
                            <div className='text-2xl'>🧢</div>
                            <div className='text-sm font-semibold uppercase'>Head</div>
                        </div>
                        <div className='row-1 col-3 flex flex-col items-center'>
                            <div className='text-2xl'>👕</div>
                            <div className='text-sm font-semibold uppercase'>Body</div>
                        </div>
                        <div className='row-1 col-4 flex flex-col items-center'>
                            <div className='text-2xl'>🧤</div>
                            <div className='text-sm font-semibold uppercase'>Hands</div>
                        </div>
                        <div className='row-1 col-5 flex flex-col items-center'>
                            <div className='text-2xl'>👟</div>
                            <div className='text-sm font-semibold uppercase'>Feet</div>
                        </div>
                        <div className='row-1 col-6 flex flex-col items-center'>
                            <div className='text-2xl'>💍</div>
                            <div className='text-sm font-semibold uppercase'>Accessory</div>
                        </div>
                        <div className='row-1 col-7 flex flex-col items-center justify-end'>
                            <div className='text-sm font-semibold uppercase'>Total</div>
                        </div>
                        {team.players.map((player, i) => {
                            const statsPlayer = players?.find((p: Player) => p.id === player.player_id);
                            if (!statsPlayer) return null;
                            const items = [statsPlayer.equipment.head, statsPlayer.equipment.body, statsPlayer.equipment.hands, statsPlayer.equipment.feet, statsPlayer.equipment.accessory];
                            const totals: Map<string, number> = new Map<string, number>();
                            return (
                                <div key={i} className={`row-${i + 2} col-span-full grid grid-cols-subgrid pt-2 border-t border-(--theme-text)/50`}>
                                    <div className='col-1'>
                                        <div className='grid grid-cols-[min-content_max-content] grid-rows-[min-content_min-content] gap-x-2 gap-y-0'>
                                            <div className='row-1 col-1 text-sm font-semibold self-baseline'>{player.slot}</div>
                                            <div className='row-1 col-2 text-md self-baseline'>{player.first_name}</div>
                                            <div className='row-2 col-2 text-md'>{player.last_name}</div>
                                        </div>
                                    </div>
                                    {items.map((item, i) => {
                                        if (item == null || item.rarity == 'Normal') return null;
                                        let name = item.name;
                                        let color = '#1c2a3a';
                                        switch (item.rarity) {
                                            case 'Rare':
                                                name = `${item.rareName!} ${item.name}`;
                                                color = '#ffee58';
                                                break;
                                            case 'Magic':
                                                name = `${item.prefix![0]} ${item.name} ${item.suffix![0]}`;
                                                color = '#42a5f5';
                                                break;
                                        }
                                        return <div key={i} className={`col-${i + 2}`}>
                                            <div className={`flex flex-col bg-(--theme-primary) border-2 rounded-lg text-theme-primary py-2 px-1 gap-0.5`} style={{ borderColor: color }}>
                                                {/* <div className='text-[7pt] font-semibold mb-1'>{name}</div> */}
                                                {item.effects.map((effect, i) => {
                                                    const amount = Math.round(effect.value * 100);
                                                    const relevant = isRelevantAttr(player, attrTypes[effect.attribute]);
                                                    totals.set(effect.attribute, amount + (totals.get(effect.attribute) ?? 0));
                                                    return <div key={i} className={`flex text-sm gap-1.5 px-1 rounded-lg ${!isRelevantAttr(player, effect.attribute) && 'text-(--theme-text)/60'} ${highlights[effect.attribute] && 'bg-(--theme-score) font-semibold'}`}>
                                                        <div className='w-5 text-right'>{amount}</div>
                                                        <div>{effect.attribute}</div>
                                                    </div>
                                                })}
                                            </div>
                                        </div>
                                    })}
                                    <div className='col-7 grid grid-rows-5 grid-flow-col grid-auto-cols-min justify-start gap-x-1'>
                                        {Array.from(totals).sort((a, b) => b[1] - a[1]).map(kvp =>
                                            <div key={kvp[0]} className={`flex text-sm gap-1.5 w-32 px-1 rounded-lg ${!isRelevantAttr(player, kvp[0]) && 'text-(--theme-text)/60'} ${highlights[kvp[0]] && 'bg-(--theme-score) font-semibold'}`}>
                                                <div className='w-5 text-right'>{kvp[1]}</div>
                                                <div>{kvp[0]}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </>
    );
}
