import { NextRequest, NextResponse } from 'next/server';
import dbPromise from '@/sqlite/userdb';

export async function POST(req: NextRequest) {
    const cookie = req.cookies.get('session')?.value;
    const { settings } = await req.json();
    if (!cookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await dbPromise;
    const session = await db.get('SELECT user_id FROM sessions WHERE token = ?', cookie);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await db.run(`INSERT INTO user_settings (user_id, settings) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET settings=excluded.settings`, session.user_id, JSON.stringify(settings, null, 2));
    return NextResponse.json({ success: true });
}
