import { MapAPITeamResponse, TeamPlayer } from '@/types/Team';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, {params}: {params: Promise<{ id: string }>}) {
  const { id } = await params;

  const response = await fetch(`https://mmolb.com/api/team/${id}`, {
    headers: {
      'Accept': 'application/json',
    },
    next: { revalidate: 0 }, // Make sure it's not cached
  });

  const data = await response.json();
  const team = MapAPITeamResponse(data);
  const players: string[] = [];
  team.players.forEach((p: TeamPlayer) => {
    players.push(p.player_id);
  })

  const playerResponse = await fetch(`https://freecashe.ws/api/chron/v0/entities?kind=player&id=${players.concat(',')}`);
  const playerData = await playerResponse.json();

  return new Response(JSON.stringify(playerData), {
    status: playerResponse.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
