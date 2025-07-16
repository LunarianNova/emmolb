import { useState } from "react";
import { useSettings } from "./Settings";
import { getContrastTextColor } from "@/helpers/Colors";
import Link from "next/link";

export default function GameSchedule({ id }: { id: string }) {
    const { settings } = useSettings();
    const [loading, setLoading] = useState(false);
    const [schedule, setSchedule] = useState<any>(null);
    const [visible, setVisible] = useState(false);

    async function loadSchedule() {
        if (schedule || loading) return;
        setLoading(true);
        try {
            const res = await fetch(`/nextapi/team-schedule/${id}`);
            if (!res.ok) throw new Error('Failed to load team data');
            setSchedule(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function handleClick() {
        setVisible((v) => !v);
        if (!schedule) loadSchedule();
    }

    return (
        <>
            <div className="mb-4 flex justify-center gap-4">
                {settings.teamPage?.showMMOLBLinks && (<a target="_blank" className="px-4 py-2 link-hover text-theme-secondary rounded mb-4" href="https://mmolb.com/edit-team">
                    <span>Edit Team Info</span>
                </a>)}
                <button onClick={() => handleClick()} className="px-4 py-2 link-hover text-theme-secondary rounded mb-4">
                    {visible ? "Hide Schedule" : "Season Schedule"}
                </button>
                {settings.teamPage?.showMMOLBLinks && (<a target="_blank" className="px-4 py-2 link-hover text-theme-secondary rounded mb-4" href="https://mmolb.com/manage-team/inventory">
                    <span>Inventory</span>
                </a>)}
            </div>

            {visible && (
                <div className="mb-4">
                    {loading ? (
                        <div className="text-white">Loading schedule…</div>
                    ) : (
                        <div className="grid gap-4 grid-cols-[repeat(auto-fit,_minmax(100px,_1fr))]">
                            {schedule.games.map((game: any, i: number) => {
                                const isHome = game.home_team_id === id;
                                const color = isHome ? game.away_team_color : game.home_team_color;
                                const name = isHome ? game.away_team_name : game.home_team_name;
                                const emoji = isHome ? game.away_team_emoji : game.home_team_emoji;
                                const won = isHome ? game.home_score > game.away_score : game.away_score > game.home_score;
                                const inProgress = game.state !== "Complete";
                                return (
                                    <Link key={i} href={`/watch/${game.game_id}`} className="relative rounded-md p-1 text-xs min-h-[100px] flex flex-col items-center justify-center cursor-pointer hover:opacity-80" style={{background: `#${color}`, color: getContrastTextColor(color)}}>
                                        <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold">{game.day}</span>
                                        <span className="absolute top-1 right-1 text-xs">{game.weather.Emoji}</span>
                                        <span className="absolute top-1 left-1">{isHome ? '🏠' : '✈️'}</span>
                                        <div className="flex flex-col items-center justify-center mt-2 text-center leading-tight">
                                            <span className="text-lg">{emoji}</span>
                                            <span className="text-xs font-semibold">{name}</span>
                                        </div>
                                        <div className="mt-1 text-sm font-bold">{game.away_score}-{game.home_score}</div>
                                        {!inProgress ? won ? <div className="absolute bottom-1 left-1 text-[10px] font-bold w-4 h-4 rounded-full bg-black flex items-center justify-center text-green-300">W</div> 
                                        : <div className="absolute bottom-1 left-1 text-[10px] font-bold w-4 h-4 rounded-full bg-black flex items-center justify-center text-red-400">L</div> 
                                        : <div className="absolute bottom-1 left-1 text-[10px] font-bold w-8 h-4 rounded-full bg-black flex items-center justify-center text-white">LIVE</div>}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
