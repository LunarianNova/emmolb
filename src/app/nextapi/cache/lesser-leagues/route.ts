import { getCachedLiteTeams } from '@/lib/cache';
export const dynamic = 'force-dynamic'; // Disables static caching

export async function GET() {
    const data = await getCachedLiteTeams();
    return Response.json(data);
}
