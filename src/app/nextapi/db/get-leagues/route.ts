import { NextResponse } from 'next/server';
import db from '@/sqlite/db';

export async function GET() {
    const statement = db.prepare(`SELECT * FROM leagues`);

    try {
        const leagues = statement.all();
        return NextResponse.json({ leagues });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}
