// components/LeaguePage.tsx
'use client';
import MiniTeamHeader from "../MiniTeamHeader";
import { LeagueStandingsProps } from "./LeaguePage";

export function LeagueStandings({ league, teams, cutoff, showIndex }: LeagueStandingsProps) {
    if (!league || !teams.length) return (<div className="text-white text-center mt-10">Can't find that league</div>);
    const columnWidths = [14, 9, 10, 9];

    return <div className="w-full space-y-2">
        <div className='flex justify-end px-2 text-xs font-semibold uppercase'>
            <div className={`ml-1 w-${columnWidths[0]} text-right`}>Record</div>
            <div className={`ml-1 w-${columnWidths[1]} text-right`}>WD</div>
            <div className={`ml-1 w-${columnWidths[2]} text-right`}>RD</div>
            <div className={`ml-1 w-${columnWidths[3]} text-right`}>GB</div>
        </div>
        {teams.map((team: any, index) => (
            <div key={team.id || index}>
                {index === cutoff?.index && (
                    <div className="relative my-4 flex items-center" aria-label="Cutoff line">
                        <div className="absolute -left-2 sm:left-0 sm:-translate-x-full bg-theme-text text-xs font-bold px-2 py-0.5 rounded-sm select-none text-theme-background whitespace-nowrap">
                            {cutoff?.text}
                        </div>
                        <div className="flex-grow border-t-2 border-theme-text"></div>
                    </div>
                )}
                <MiniTeamHeader team={team} leader={teams[0]} index={showIndex ? index + 1 : undefined} columnWidths={columnWidths} />
            </div>
        ))}
    </div>;
}
