import { getCachedSeasonWinners } from '@/lib/cache';
export const dynamic = 'force-dynamic'; // Disables static caching

export async function GET() {
    const data = await getCachedSeasonWinners();
    return Response.json(data);
}
