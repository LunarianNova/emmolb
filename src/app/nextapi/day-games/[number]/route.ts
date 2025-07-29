import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, {params}: {params: Promise<{ number: string }>}) {
    const { number } = await params;
    const url = req.nextUrl;

    if (!number || isNaN(Number(number))) {
        return NextResponse.json({ error: 'Invalid or missing "number" route parameter' }, { status: 400 });
    }

    const limit = url.searchParams.get('limit');
    const league = url.searchParams.get('league');

    const apiUrl = new URL(`https://mmolb.com/api/day-games/${number}`);
    if (limit) apiUrl.searchParams.set('limit', limit);
    if (league) apiUrl.searchParams.set('league', league);

    const response = await fetch(apiUrl.toString(), {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 0 },
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });
}
