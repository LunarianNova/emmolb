import { NextResponse } from 'next/server';
import dbPromise from '@/sqlite/db';

export async function GET() {
    try {
        const db = await dbPromise;

        const rows = await db.all(`SELECT league_id, season, team_id FROM season_winners`);

        const result: Record<string, Record<number, string>> = {};

        for (const row of rows) {
            if (!result[row.league_id]) result[row.league_id] = {};
            result[row.league_id][row.season] = row.team_id;
        }

        return NextResponse.json(result);
    } catch (err) {
        return NextResponse.json({ error: 'Database read failed' }, { status: 500 });
    }
}
