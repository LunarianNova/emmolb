import { NextRequest } from 'next/server';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const gameRes = await fetch(`https://mmolb.com/api/game/${id}`);
    console.log(`https://mmolb.com/api/game/${id}` + gameRes.ok);
    if (!gameRes.ok) return new Response('Failed to fetch game', { status: 502 });

    const gameData = await gameRes.json();

    const [awayRes, homeRes] = await Promise.all([
      fetch(`https://mmolb.com/api/team/${gameData.AwayTeamID}`),
      fetch(`https://mmolb.com/api/team/${gameData.HomeTeamID}`),
    ]);

    if (!awayRes.ok || !homeRes.ok) {
      return new Response('Failed to fetch one or both teams', { status: 502 });
    }

    const [awayTeam, homeTeam] = await Promise.all([awayRes.json(), homeRes.json()]);

    return Response.json({
      game: gameData,
      gameId: id,
      awayTeam,
      homeTeam,
    });
  } catch (err) {
    console.error(err);
    return new Response('Internal error', { status: 500 });
  }
}
