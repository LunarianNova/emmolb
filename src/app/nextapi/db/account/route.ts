import { NextRequest, NextResponse } from 'next/server';
import dbPromise from '@/sqlite/userdb';

export async function GET(req: NextRequest) {
    const cookie = req.cookies.get('session')?.value;
    if (!cookie) return NextResponse.json({ error: 'Unauthorized (No cookie)' }, { status: 401 });

    const db = await dbPromise;
    const session = await db.get('SELECT user_id FROM sessions WHERE token = ?', cookie);
    if (!session) return NextResponse.json({ error: 'Unauthorized (Mismatch in cookies)' }, { status: 401 });

    const user = await db.get('SELECT username FROM users WHERE id = ?', session.user_id);
    if (!user) return NextResponse.json({ error: 'Unauthorized (Issue finding username)' }, { status: 401 });

    const teamId = await db.get('SELECT mmolb_team_id FROM user_mmolb_links WHERE user_id = ?', session.user_id);
    const settings = await db.get('SELECT settings FROM user_settings WHERE user_id = ?', session.user_id);
    const teams = await db.get(`SELECT teams FROM user_teams WHERE user_id = ?`, session.user_id);

    return NextResponse.json({ 
        username: user.username, 
        team_id: teamId?.mmolb_team_id ?? null, 
        settings: settings?.settings ? JSON.parse(settings?.settings) : null, 
        teams: teams?.teams ? JSON.parse(teams.teams) : null,
    });
}
