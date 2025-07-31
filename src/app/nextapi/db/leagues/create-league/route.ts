import { NextRequest, NextResponse } from 'next/server';
import dbPromise from '@/sqlite/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { league_name, league_emoji, league_color } = body;

        const db = await dbPromise;
        await db.run(
            `INSERT INTO leagues (league_name, league_emoji, league_color, league_teams) VALUES (?, ?, ?, ?)`,
            league_name,
            league_emoji,
            league_color,
            ''
        );

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'Failed to insert' }, { status: 500 });
    }
}
