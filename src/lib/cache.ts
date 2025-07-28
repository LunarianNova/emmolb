import { unstable_cache } from 'next/cache';

const fetchData = async () => {
    const res = await fetch('https://freecashe.ws/api/teams');
    if (!res.ok) throw new Error('Fetch failed');
    return res.json();
};

export const getCachedLiteTeams = unstable_cache(
    fetchData,
    ['cached-data-key'],
    { revalidate: 86400 }
);
