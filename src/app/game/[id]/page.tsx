// app/game/[id]/page.tsx (Server Component)
import LiveGame from '@/components/LiveGame';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getGameData(id: string) {
  const res = await fetch(`https://mmolb.com/api/game/${id}`);
  if (!res.ok) throw new Error('Failed to fetch game data');
  return res.json();
}

async function getTeamData(id: string) {
  const res = await fetch(`https://mmolb.com/api/team/${id}`);
  if (!res.ok) throw new Error('Failed to fetch team data');
  return res.json();
}

export default async function GamePage({ params }: PageProps) {
  const awaitedParams = await params; // await params before using
  const data = await getGameData(awaitedParams.id);
  const awayTeam = await getTeamData(data.AwayTeamID);
  const homeTeam = await getTeamData(data.HomeTeamID);
  return <LiveGame awayTeam={awayTeam} homeTeam={homeTeam} initialData={data} gameId={awaitedParams.id} />;
}