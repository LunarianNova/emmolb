import { NextRequest, NextResponse } from 'next/server';
import dbPromise from '@/sqlite/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { league_name } = body;

        const db = await dbPromise;
        const league = await db.get(`SELECT * FROM leagues WHERE league_name = ?`, league_name);

        return NextResponse.json({ league });
    } catch {
        return NextResponse.json({ error: 'Failed to retrieve league' }, { status: 500 });
    }
}
