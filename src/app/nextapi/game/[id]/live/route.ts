import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const after = req.nextUrl.searchParams.get('after') ?? '0';

  const response = await fetch(`https://mmolb.com/api/game/${id}/live?after=${after}`, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    return new Response(null, { status: response.status, statusText: response.statusText });
  }

  const data = await response.json();

  // Check if last event indicates game over
  const entries = data.entries ?? [];

  if (entries.length === 0){
    return new Response(null, { status: 500, statusText: 'No new events!!'})
  }

  const lastEvent = entries.length > 0 ? entries[entries.length - 1] : null;

  // Example condition - adjust to your actual data structure
  if (lastEvent?.event === "Recordkeeping") {
    return new Response(null, { status: 410, statusText: 'Game Over' });
  }

  // Otherwise return the data as usual
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
