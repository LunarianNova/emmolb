// components/LeagueHeader.tsx
// Author: Navy
import { getContrastTextColor } from "@/helpers/Colors";
import { League } from "@/types/League";

export default function LeagueHeader({ league }: { league: League }) {
    return (
        <div className='relative w-full h-28 px-6 py-4 border-2 rounded-2xl shadow-xl overflow-hidden mb-4 flex items-center' style={{background: `#${league.color}`, color: getContrastTextColor(league.color ? league.color : '')}}>
            <span className="text-7xl flex-shrink-0">
                {league.emoji}
            </span>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2">
                <span className="text-2xl font-bold tracking-wide leading-tight text-center">
                    {league.name} League
                </span>
                <span>
                    {league.league_type} League
                </span>
            </div>
        </div>
    );
}