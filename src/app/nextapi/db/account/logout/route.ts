import { NextRequest, NextResponse } from 'next/server';
import dbPromise from '@/sqlite/userdb';

export async function GET(req: NextRequest) {
    const cookie = req.cookies.get('session')?.value;
    if (!cookie) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

    const db = await dbPromise;
    const session = await db.get('SELECT user_id FROM sessions WHERE token = ?', cookie);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await db.get(`DELETE FROM sessions WHERE token = ?`, cookie);

    return NextResponse.json({ success: true });
}
