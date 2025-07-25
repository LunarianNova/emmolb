import LiveGame from '@/components/LiveGame';
import { MapAPIPlayerResponse } from '@/types/Player';
import { TeamPlayer } from '@/types/Team';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function GamePage({ params }: PageProps) {
    const { id } = await params;

    const res = await fetch(`https://lunanova.space/nextapi/gameheader/${id}`, {
        next: { revalidate: 0 },
    });

    if (!res.ok) throw new Error('Failed to load game + team data');
    const { game, gameId, awayTeam, homeTeam } = await res.json();

    const homePlayers = await fetch(`http://localhost:3000/nextapi/players?ids=${homeTeam.Players.map((p: any) => p.PlayerID).join(',')}`)
    const awayPlayers = await fetch(`http://localhost:3000/nextapi/players?ids=${awayTeam.Players.map((p: any) => p.PlayerID).join(',')}`)
    if (!homePlayers.ok || !awayPlayers.ok) throw new Error('Failed to load player data');
    const homeData = await homePlayers.json();
    const awayData = await awayPlayers.json();

    const combinedPlayers = [...homeData.players, ...awayData.players];
    
    return <LiveGame awayTeamArg={awayTeam} homeTeamArg={homeTeam} initialDataArg={game} gameId={id} playerObjects={combinedPlayers.map((p) => MapAPIPlayerResponse(p))} />;
}
