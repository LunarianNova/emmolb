import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get('ids');

  if (!idsParam) {
    return NextResponse.json({ error: 'Missing "ids" query parameter' }, { status: 400 });
  }

  const response = await fetch(`https://freecashe.ws/api/chron/v0/entities?kind=team_lite&id=${idsParam}`, {
    headers: {
      'Accept': 'application/json',
    },
    next: { revalidate: 0 }, // no caching
  });

  const data = await response.json();

  return NextResponse.json(data.items, {
    status: response.status,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}
