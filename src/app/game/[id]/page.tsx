import LiveGame from '@/components/LiveGame';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GamePage({ params }: PageProps) {
  const { id } = await params;

  const base = process.env.VERCEL_URL ? 'https://shardsof.space' : 'http://localhost:3000';

  const res = await fetch(`${base}/api/gameheader/${id}`, {
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error('Failed to load game + team data');
  const { game, gameId, awayTeam, homeTeam } = await res.json();

  return <LiveGame awayTeam={awayTeam} homeTeam={homeTeam} initialData={game} gameId={id} />;
}
