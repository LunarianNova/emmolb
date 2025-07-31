import { NextResponse } from 'next/server';
import dbPromise from '@/sqlite/db';

export async function GET() {
    try {
        const db = await dbPromise;
        const leagues = await db.all(`SELECT * FROM leagues`);
        return NextResponse.json({ leagues });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}
