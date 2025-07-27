import { NextRequest, NextResponse } from 'next/server';
import db from '@/sqlite/db';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { league_name } = body;

    const statement = db.prepare(`SELECT * FROM leagues WHERE league_name = ?`);

    try {
        const league = statement.get(league_name);
        return NextResponse.json({ league });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to retrieve league' }, { status: 500 });
    }
}