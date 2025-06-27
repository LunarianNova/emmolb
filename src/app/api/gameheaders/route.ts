import { Console } from 'console';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { teamIds } = await req.json() as { teamIds: string[] };

    const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

    if (!Array.isArray(teamIds)) {
      return new Response(JSON.stringify({ error: 'teamIds must be an array' }), { status: 400 });
    }

    // For each team, fetch latest game ID
    const gamesPromises = teamIds.map(async (teamId) => {
      let gameId = null;
      const gameRes = await fetch(`https://mmolb.com/api/game-by-team/${teamId}`);
      console.log(`https://mmolb.com/api/game-by-team/${teamId}`);
      if (!gameRes.ok) {
        console.log('game res failed');
        const teamRes = await fetch(`https://mmolb.com/api/team/${teamId}`)
        console.log('team res ' + teamRes.ok);
        if (!teamRes.ok) return null;
        const teamData = await teamRes.json();
        gameId = teamData.Feed[teamData.Feed.length - 1].links[2].id;
      } else {
        const gameData = await gameRes.json();
        gameId = gameData.game_id;
      }

      // Fetch game header from your API
      const gameHeaderRes = await fetch(`${base}/api/gameheader/${gameId}`);
      console.log(`${base}/api/gameheader/${gameId}`)
      console.log('gameheader res', gameHeaderRes.status, gameHeaderRes.ok)
      if (!gameHeaderRes.ok) return null;

      const gameHeader = await gameHeaderRes.json();

      return { teamId, gameHeader };
    });

    const results = await Promise.all(gamesPromises);

    // Filter out nulls (teams with missing data)
    const filtered = results.filter(r => r !== null);

    return new Response(JSON.stringify(filtered), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
