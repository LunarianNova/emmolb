import { getContrastTextColor } from "@/helpers/ColorHelper";

type CustomLeagueHeaderProps = {
    league: any;
};

export default function CustomLeagueHeader({ league }: CustomLeagueHeaderProps) {
    return (
        <div className='relative w-2xl h-28 px-6 py-4 border-2 rounded-2xl shadow-xl overflow-hidden mb-4 flex items-center' style={{background: `${league.league_color}`, color: getContrastTextColor(league.league_color ? league.league_color : '')}}>
            <span className="text-7xl flex-shrink-0">
                {league.league_emoji}
            </span>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2">
                <span className="text-2xl font-bold tracking-wide leading-tight text-center">
                    {league.league_name} League
                </span>
                <span>
                    Custom League
                </span>
            </div>
        </div>
    );
}