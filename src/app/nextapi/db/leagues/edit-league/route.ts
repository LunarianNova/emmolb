import { NextRequest, NextResponse } from 'next/server';
import dbPromise from '@/sqlite/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { league_name, league_emoji, league_color, league_id } = body;

        console.log(league_name, league_emoji, league_color, league_id)

        const db = await dbPromise;
        await db.run(
            `UPDATE leagues SET league_name = ?, league_emoji = ?, league_color = ? WHERE league_id = ?`,
            league_name,
            league_emoji,
            league_color,
            league_id
        );

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
