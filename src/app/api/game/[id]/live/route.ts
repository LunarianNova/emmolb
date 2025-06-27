import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const after = req.nextUrl.searchParams.get('after') ?? '0';

  const response = await fetch(`https://mmolb.com/api/game/${id}/live?after=${after}`, {
    headers: {
      'Accept': 'application/json',
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    // Forward error status as is
    return new Response(null, { status: response.status });
  }

  const data = await response.json();

  if (data.State === 'Complete') {
    // Game is complete: respond with 410 Gone to tell clients to stop polling
    return new Response(JSON.stringify({ message: 'Game complete. Polling disabled.' }), {
      status: 410,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Otherwise forward data as normal
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
