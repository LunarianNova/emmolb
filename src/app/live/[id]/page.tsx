import AnimatedGame from '@/components/NeoAnimatedGame';
import { MapAPIGameResponse } from '@/types/Game';
import { MapAPITeamResponse } from '@/types/Team';

export default async function LiveGamePage({ params }: { params: { id: string } }) {
    const { id } = await params;

    const res = await fetch(`https://lunanova.space/nextapi/gameheader/${id}`, {
        next: { revalidate: 0 },
    });

    if (!res.ok) throw new Error('Failed to load game + team data');
    const { game, gameId, awayTeam, homeTeam } = await res.json();
    return <AnimatedGame homeTeam={MapAPITeamResponse(homeTeam)} awayTeam={MapAPITeamResponse(awayTeam)} game={MapAPIGameResponse(game)} id={id} />;
}
