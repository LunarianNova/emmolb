import { NextRequest, NextResponse } from 'next/server';
import dbPromise from '@/sqlite/userdb';
import { adjectives, nouns, suffix } from '@/components/account/Words';

const choice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export async function GET(req: NextRequest) {
    const cookie = req.cookies.get('session')?.value;
    if (!cookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await dbPromise;
    const session = await db.get('SELECT user_id FROM sessions WHERE token = ?', cookie);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const team = await db.get(`SELECT mmolb_team_id FROM user_mmolb_links WHERE user_id = ?`, session.user_id);
    if (team?.mmolb_team_id) return NextResponse.json({ error: 'Already authenticated', team_id: team.mmolb_team_id }, { status: 401 });

    const one = choice([...nouns, ...adjectives]);
    const two = choice([...nouns, ...adjectives]);
    const three = choice(suffix);
    const stadium = `${one} ${two} ${three}`;

    await db.run(`INSERT INTO user_mmolb_links (user_id, ballpark_check) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET ballpark_check = excluded.ballpark_check`, session.user_id, stadium);

    return NextResponse.json({ stadium_name: stadium });
}
