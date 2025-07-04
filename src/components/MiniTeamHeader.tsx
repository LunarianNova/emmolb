import { getContrastTextColor } from "@/helpers/Colors";
import { Team } from "@/types/Team";
import Link from "next/link";

export default function MiniTeamHeader({team, index}: { team: Team, index?: number }) {
    if (!team) return null;
    if (!('color' in team)) return null;
    return (
        <Link href={`/team/${team.id}`} className='block'>
            <div className='flex justify-between items-center p-2 rounded cursor-pointer transition h-12' style={{background: `#${team.color}`, color: getContrastTextColor(team.color)}}>
                <div className='flex items-center gap-3 overflow-hidden min-w-0'>
                    {index ? <span className='w-5 text-right font-mono text-sm opacity-70 flex-shrink-0'>{index}.</span> : ''}
                    <span className='w-6 text-xl text-center flex-shrink-0'>{team.emoji}</span>
                    <span className="flex-1 font-semibold text-left truncate min-w-0">{team.location} {team.name}</span>
                </div>
                <span className='text-sm font-semibold opacity-80 flex-shrink-0'>
                    {team.record.regular_season.wins} - {team.record.regular_season.losses}
                    <span className="ml-1">
                        ({team.record.regular_season.run_differential > 0 ? '+' : ''}{team.record.regular_season.run_differential})
                    </span>
                </span>
            </div>
        </Link>
    );
}