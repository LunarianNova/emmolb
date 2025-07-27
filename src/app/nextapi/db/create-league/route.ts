import { NextRequest, NextResponse } from 'next/server';
import db from '@/sqlite/db';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { league_name, league_emoji, league_color } = body;

  const stmt = db.prepare(`
    INSERT INTO leagues (league_name, league_emoji, league_color, league_teams)
    VALUES (?, ?, ?, ?)
  `);

  try {
    stmt.run(league_name, league_emoji, league_color, '');
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to insert' }, { status: 500 });
  }
}