import { getCachedData } from '@/lib/cache';
export const dynamic = 'force-dynamic'; // Disables static caching

export async function GET() {
    const data = await getCachedData();
    return Response.json(data);
}
