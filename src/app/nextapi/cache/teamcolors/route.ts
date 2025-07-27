import { NextRequest, NextResponse } from 'next/server';
import { getCachedLiteTeams } from '@/lib/cache';
export const dynamic = 'force-dynamic'; // Disables static caching

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { team_ids } = body;

        const data = await getCachedLiteTeams();

        return NextResponse.json({
            data: Object.fromEntries(data.items.filter((team: any) => team_ids.includes(team.team_id)).map((team: any) => [team.team_id, team.color]))
    });
    } catch {
        return NextResponse.json({ error: 'Failed to retrieve data' }, { status: 500 });
    }
}
