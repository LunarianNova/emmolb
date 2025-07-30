function getCurrentPhase(now: Date, phases: { name: string, start: string }[]): string {
    const preview = phases.find(p => p.name === "PostseasonPreview");
    if (!preview) return "Unknown";
    return now >= new Date(preview.start) ? "Postseason" : "Regular Season";
}

export function getGamesLeft(time: any, playsOnOddDays: boolean): number {
    const totalGamesInSeason = 120;
    const day = time.season_day;
    const gamesPlayed = playsOnOddDays ? Math.floor((day+1)/2) : Math.floor(day/2);
    return totalGamesInSeason - gamesPlayed;
}

type GamesRemainingProps = {
    time: any;
    playsOnOddDays: boolean;
}

export default function GamesRemaining({ time, playsOnOddDays }: GamesRemainingProps) {
    const gamesLeft = getGamesLeft(time, playsOnOddDays);
    const phase = getCurrentPhase(new Date(), Object.entries(time.phase_times as Record<string, string>).map(([name, start]) => ({ name, start })));
    const isPostseason = phase === 'Postseason';
    const postSeasonGL = `Final Standings for Season ${time.season_number}`

    const isCurrentGameDay = time.season_day % 2 === (playsOnOddDays ? 1 : 0);
    const pluralGamesLeft = gamesLeft !== 1;
    const formattedGL = `${gamesLeft}${isCurrentGameDay ? `-${gamesLeft + 1}` : ''} Game${pluralGamesLeft ? 's' : ''} Remain${pluralGamesLeft ? '' : 's'}`;

    return <div className="text-center mt-0 mb-4 text-lg font-bold">{isPostseason ? postSeasonGL : formattedGL}</div>
}