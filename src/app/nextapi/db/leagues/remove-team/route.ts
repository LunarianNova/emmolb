import { NextRequest, NextResponse } from 'next/server';
import dbPromise from '@/sqlite/db';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { league_name, team_id } = body;

    try {
        const db = await dbPromise;
        const result: { league_teams: string } | undefined = await db.get(`SELECT league_teams FROM leagues WHERE league_name = ?`, league_name);

        const teams: string = result?.league_teams || '';
        const updatedTeams = teams.split(',').filter(team => team !== team_id).join(',');

        await db.run(`UPDATE leagues SET league_teams = ? WHERE league_name = ?`, updatedTeams, league_name);
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
