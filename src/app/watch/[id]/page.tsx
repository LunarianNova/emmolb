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

    const cashewsHome = await fetch(`https://lunanova.space/nextapi/teamplayers/${awayTeam._id}`)
    const cashewsAway = await fetch(`https://lunanova.space/nextapi/teamplayers/${homeTeam._id}`)
    if (!cashewsHome.ok || !cashewsAway.ok) throw new Error('Failed to load player data');
    const homeData = await cashewsHome.json();
    const awayData = await cashewsAway.json();

    const cashewsPlayers = {
        items: [...homeData.items, ...awayData.items]
    };
    
    return <LiveGame awayTeamArg={awayTeam} homeTeamArg={homeTeam} initialDataArg={game} gameId={id} cashewsPlayers={cashewsPlayers} />;
}
