'use client'
import Loading from "@/components/Loading";
import { useEffect, useState } from "react";
import { MapAPITeamResponse, PlaceholderTeam, Team, TeamPlayer } from "@/types/Team";
import { MapAPIPlayerResponse, Player } from "@/types/Player";

export default function TeamItemsPage({ id }: { id: string }) {

    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState<Team>(PlaceholderTeam);
    const [players, setPlayers] = useState<Player[] | undefined>(undefined);

    useEffect(() => {
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

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

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

    return (
        <>
            <main className='mt-16'>
                <div className='min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-24 mx-auto'>
                    <h2 className='text-xl font-bold mb-4 text-center'>Team Equipment</h2>
                    <div className='grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_auto] gap-2'>
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
                                        console.log(item);
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
                                        return <div key={i} className={`col-${i+2}`}>
                                            <div className={`flex flex-col bg-(--theme-primary) border-2 rounded-lg text-theme-primary p-2`} style={{borderColor: color}}>
                                                {/* <div className='text-[7pt] font-semibold mb-1'>{name}</div> */}
                                                {item.effects.map((effect, i) => {
                                                    const amount = Math.round(effect.value*100);
                                                    totals.set(effect.attribute, amount + (totals.get(effect.attribute) ?? 0));
                                                    return <div key={i} className='flex text-sm gap-1.5'>
                                                        <div className='w-5 text-right'>{amount}</div>
                                                        <div>{effect.attribute}</div>
                                                    </div>
                                                })}
                                            </div>
                                        </div>
                                    })}
                                    <div className='col-7 grid grid-rows-5 grid-flow-col grid-auto-cols-min justify-start'>
                                        {Array.from(totals).sort((a, b) => b[1] - a[1]).map(kvp => 
                                            <div key={kvp[0]} className='flex text-sm gap-1.5 w-32'>
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
