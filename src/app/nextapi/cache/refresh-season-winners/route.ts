import { NextRequest, NextResponse } from 'next/server';
import dbPromise from '@/sqlite/db';
import { getCachedLiteTeams } from '@/lib/cache';
import crypto from 'crypto';

const AUTH_USER = 'admin';
const AUTH_PASSWORD = '49cefdc84d1e8940e33cac06707b2bae33a116ed08d353ef2d9ebc86eef02e8e';

function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

export async function GET(req: NextRequest) {
    const auth = req.headers.get('authorization');
    if (!auth || !auth.startsWith('Basic ')) {
        return new NextResponse('Unauthorized', {
            status: 401,
            headers: {'WWW-Authenticate': 'Basic realm="Secure Endpoint"'}
        })
    }
    const base64 = auth.split(' ')[1];
    const [username, password] = Buffer.from(base64, 'base64').toString().split(':');
    if (username !== AUTH_USER || hashPassword(password) !== AUTH_PASSWORD){
        return new NextResponse('Forbidden', { status: 403 });
    }

    try {
        const seasonTimestamps: Record<number, string> = {
            1: '2025-06-19T00:00:00Z',
            2: '2025-07-03T00:00:00Z',
            3: '2025-07-24T00:00:00Z'
        }

        const leagueMembershipMap: Record<string, Record<number, string>> = {} // team_id: {season: league}

        const baseData = await getCachedLiteTeams();

        const ids: string[] = baseData.items.map((team: any) => team.team_id);
        const chunks: string[][] = [];
        for (let i = 0; i < ids.length; i += 100)
            chunks.push(ids.slice(i, i + 100));

        const results: any[] = [];
        for (const chunk of chunks) {
            // Get Feed stuff (full team)
            const idParam = chunk.join(',');
            const fullRes = await fetch(`https://freecashe.ws/api/chron/v0/entities?kind=team_feed&id=${idParam}`, {
                headers: { 'Accept': 'application/json' },
                next: { revalidate: 0 },
            });
            if (!fullRes.ok) throw new Error('Failed to fetch chunk');
            const data = await fullRes.json();
            results.push(...data.items);

            for (const [season, timestamp] of Object.entries(seasonTimestamps)) {
                // Get season details (feed excluded as it is the largest part of the response)
                const res = await fetch(`https://freecashe.ws/api/chron/v0/entities?kind=team_lite&id=${idParam}&at=${timestamp}`, {
                    headers: { Accept: 'application/json' },
                    next: { revalidate: 0 },
                });
                const data = await res.json();
                for (const team of data.items) {
                    const teamID = team.data._id;
                    const leagueID = team.data.League;
                    if (!leagueMembershipMap[teamID]) leagueMembershipMap[teamID] = {};
                    leagueMembershipMap[teamID][+season] = leagueID;
                }
            }
        }

        const leagueRecords: Record<string, Record<string, Record<number, number>>> = {}; // league_id: {team_id: {season: winDiff}}
        for (let team of results) {
            const feed = team.data.feed;
            const id = team.entity_id;
            if (id === '6805f2d34277d0dcecdd3b2e') continue; // Danny's team can't be pulled-up
            const seasonRecords: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
            if (!Array.isArray(feed)) continue;

            for (const event of feed) {
                if (event.type !== 'game') continue;
                if (!event.text.includes('FINAL')) continue;

                const scoreText = event.text.split("FINAL ")[1];
                if (!scoreText || !scoreText.includes("-")) continue;
                const [awayScoreStr, homeScoreStr] = scoreText.split("-");
                const awayScore = Number(awayScoreStr);
                const homeScore = Number(homeScoreStr);
                if (Number.isNaN(awayScore) || Number.isNaN(homeScore)) continue;

                const homeID = event.links?.[1]?.id;
                if (!homeID) continue;
                const isHome = id === homeID;
                const teamScore: number = isHome ? homeScore : awayScore;
                const oppScore: number = isHome ? awayScore : homeScore;
                const season = Number(event.season);
                if (Number.isNaN(season)) continue;

                if (!seasonRecords[season]) seasonRecords[season] = 0;
                if (teamScore > oppScore) seasonRecords[season] += 1;
                else seasonRecords[season] -= 1;
            }

            for (const [season, wins] of Object.entries(seasonRecords)) {
                const leagueID = leagueMembershipMap[id]?.[+season];
                if (!leagueID) continue;

                if (!leagueRecords[leagueID]) leagueRecords[leagueID] = {};
                if (!leagueRecords[leagueID][id]) leagueRecords[leagueID][id] = {};
                leagueRecords[leagueID][id][+season] = wins;
            }
        }

        const leagueTopTeams: { league_id: string, season: number, team_id: string }[] = [];

        for (const [leagueID, teams] of Object.entries(leagueRecords)) {
            const seasons = new Set<number>();
            for (const records of Object.values(teams)) {
                for (const seasonStr of Object.keys(records)) {
                    seasons.add(Number(seasonStr));
                }
            }

            for (const season of seasons) {
                let topTeam: string | null = null;
                let topWins = -Infinity;

                for (const [teamID, seasonRecords] of Object.entries(teams)) {
                    const wins = seasonRecords[season] ?? 0;
                    if (wins > topWins) {
                        topWins = wins;
                        topTeam = teamID;
                    }
                }

                if (topTeam) {
                    leagueTopTeams.push({ league_id: leagueID, season, team_id: topTeam });
                }
            }
        }

        const db = await dbPromise;
        await db.run(`DELETE FROM season_winners`);
        const statement = await db.prepare(`INSERT INTO season_winners (league_id, season, team_id) VALUES (?, ?, ?)`);
        for (const row of leagueTopTeams) {
            await statement.run(row.league_id, row.season, row.team_id);
        }
        await statement.finalize();

        return NextResponse.json({ status: 'ok', inserted: leagueTopTeams.length });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'failed to update season winners' }, { status: 500 });
    }
}
