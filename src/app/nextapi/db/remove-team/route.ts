import { NextRequest, NextResponse } from 'next/server';
import db from '@/sqlite/db';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { league_name, team_id } = body;

    const fetchStatement = db.prepare(`SELECT league_teams FROM leagues WHERE league_name = ?`);
    const insertStatement = db.prepare(`UPDATE leagues SET league_teams = ? WHERE league_name = ?`);

    try {
        const result = fetchStatement.get(league_name) as {league_teams: string};
        const teams = result?.league_teams || '';
        const updatedTeams = teams.split(',').filter(team => team !== team_id).join(',');
        insertStatement.run(updatedTeams, league_name);
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}