import LiveGame from '@/components/LiveGame';

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

    return <LiveGame awayTeamArg={awayTeam} homeTeamArg={homeTeam} initialDataArg={game} gameId={id} />;
}
