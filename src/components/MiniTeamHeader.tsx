import { getContrastTextColor } from "@/helpers/ColorHelper";
import { Team } from "@/types/Team";
import Link from "next/link";

type MiniTeamHeaderProps = {
    team: Team;
    leader?: Team;
    index?: number;
    alignValues?: boolean;
};

export default function MiniTeamHeader({team, leader, index, alignValues}: MiniTeamHeaderProps) {
    if (!team) return null;
    if (!('color' in team)) return null;

    const gamesBehind = (leader) ? (leader.record.regular_season.wins - team.record.regular_season.wins + team.record.regular_season.losses - leader.record.regular_season.losses) / 2 : null;
    let formattedGB: React.ReactNode = '';
    if (gamesBehind != null) {
        if (gamesBehind === 0) {
            formattedGB = '-';
        } else if (gamesBehind < 1) {
            formattedGB = <span style={{ fontFamily: 'geist, sans-serif' }}>½</span>;
        } else if (Number.isInteger(gamesBehind)) {
            formattedGB = `${gamesBehind}`;
        } else {
            formattedGB = (
                <>
                    {Math.floor(gamesBehind)}
                    <span style={{ fontFamily: 'geist, sans-serif' }}>½</span>
                </>
            );
        }
    }

    return (
        <Link href={`/team/${team.id}`} className='block'>
            <div className='flex justify-between items-center p-2 rounded cursor-pointer transition h-12' style={{background: `#${team.color}`, color: getContrastTextColor(team.color)}}>
                <div className='flex items-center gap-3 overflow-hidden min-w-0'>
                    {index ? <span className='w-5 text-right font-mono text-sm opacity-70 flex-shrink-0'>{index}.</span> : ''}
                    <span className='w-6 text-xl text-center flex-shrink-0'>{team.emoji}</span>
                    <span className="flex-1 font-semibold text-left truncate min-w-0">{team.location} {team.name}</span>
                </div>
                <span className='text-sm font-semibold opacity-80 flex-shrink-0'>
                    <span className={`ml-1 ${alignValues && 'inline-block w-14 text-right'}`}>
                        {team.record.regular_season.wins}–{team.record.regular_season.losses}
                    </span>
                    <span className={`ml-1 ${alignValues && 'inline-block w-10 text-right'}`}>
                        {!alignValues && '('}{team.record.regular_season.wins - team.record.regular_season.losses > 0 ? '+' : ''}{team.record.regular_season.wins - team.record.regular_season.losses}{!alignValues && ')'}
                    </span>
                    <span className={`ml-1 ${alignValues && 'inline-block w-10 text-right'}`}>
                        {!alignValues && '('}{team.record.regular_season.run_differential > 0 ? '+' : ''}{team.record.regular_season.run_differential}{!alignValues && ')'}
                    </span>
                    {leader && (
                        <span className={`ml-1 ${alignValues && 'inline-block w-9 text-right'}`}>
                            {formattedGB}
                        </span>
                    )}
                </span>
            </div>
        </Link>
    );
}