import { League } from '@/types/League';
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

const fetchLeagues: () => Promise<League[]> = async () => {
        const league_ids: string[] = [
            '6805db0cac48194de3cd3fe7',
            '6805db0cac48194de3cd3fe8',
            '6805db0cac48194de3cd3fe9',
            '6805db0cac48194de3cd3fea',
            '6805db0cac48194de3cd3feb',
            '6805db0cac48194de3cd3fec',
            '6805db0cac48194de3cd3fed',
            '6805db0cac48194de3cd3fee',
            '6805db0cac48194de3cd3fef',
            '6805db0cac48194de3cd3ff0',
            '6805db0cac48194de3cd3ff1',
            '6805db0cac48194de3cd3ff2',
            '6805db0cac48194de3cd3ff3',
            '6805db0cac48194de3cd3ff4',
            '6805db0cac48194de3cd3ff5',
            '6805db0cac48194de3cd3ff6',
        ];

        const responses = await Promise.all(league_ids.map(id => fetch(`https://mmolb.com/api/league/${id}`)));
        const data: any[] = await Promise.all(responses.map(r => r.json()));
        return data.map((game: any) => ({
            color: game.Color,
            emoji: game.Emoji,
            league_type: game.LeagueType,
            name: game.Name,
            teams: game.Teams,
            id: game._id,
        }));
};

export const getCachedLesserLeagues = unstable_cache(
    fetchLeagues,
    ['lesser-league-key'],
    { revalidate: 86400 * 7 }
);
