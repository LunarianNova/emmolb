// components/LeagueHeader.tsx
// Author: Navy
import { getContrastTextColor } from "@/helpers/ColorHelper";
import { CustomLeague } from "@/types/CustomLeague";
import { League } from "@/types/League";

function isFullLeague(league: League | CustomLeague): league is League {
    return typeof league === 'object' && league !== null && 'name' in league;
}

export default function LeagueHeader({ league }: { league: League | CustomLeague }) {
    const fullLeague = isFullLeague(league);
    const name = fullLeague ? league.name : league.league_name;
    const color = fullLeague ? league.color : league.league_color;
    const emoji = fullLeague ? league.emoji : league.league_emoji

    return (
        <div className='relative w-full h-20 px-6 py-4 rounded-2xl shadow-xl overflow-hidden flex items-center transition' style={{background: `#${color?.charAt(0) === '#' ? color.substring(1) : color}`, color: getContrastTextColor(color ? color : '')}}>
            <span className="text-5xl flex-shrink-0">
                {emoji}
            </span>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2">
                <span className="text-xl font-bold tracking-wide leading-tight text-center">
                    {name}
                </span>
            </div>
        </div>
    );
}