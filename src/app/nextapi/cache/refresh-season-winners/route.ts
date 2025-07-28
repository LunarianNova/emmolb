import { NextResponse } from 'next/server';
import dbPromise from '@/sqlite/db';
import { getCachedLiteTeams } from '@/lib/cache';

export async function GET() {
    try {
        const baseData = await getCachedLiteTeams();

        const ids: string[] = baseData.items.map((team: any) => team.team_id);
        const chunks: string[][] = [];
        for (let i = 0; i < ids.length; i += 100)
            chunks.push(ids.slice(i, i + 100));

        const results: any[] = [];
        for (const chunk of chunks) {
            const idParam = chunk.join(',');
            const fullRes = await fetch(`https://freecashe.ws/api/chron/v0/entities?kind=team&id=${idParam}`, {
                headers: { 'Accept': 'application/json' },
                next: { revalidate: 0 },
            });
            if (!fullRes.ok) throw new Error('Failed to fetch chunk');
            const data = await fullRes.json();
            results.push(...data.items);
        }

        const leagueRecords: Record<string, Record<string, Record<number, number>>> = {};
        for (let team of results) {
            team = team.data;
            if (team._id === '6805f2d34277d0dcecdd3b2e') continue; // Danny's team can't be pulled-up
            const seasonRecords: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
            if (!Array.isArray(team.Feed)) continue;

            for (const event of team.Feed) {
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
                const isHome = team._id === homeID;
                const teamScore: number = isHome ? homeScore : awayScore;
                const oppScore: number = isHome ? awayScore : homeScore;
                const season = Number(event.season);
                if (Number.isNaN(season)) continue;

                if (!seasonRecords[season]) seasonRecords[season] = 0;
                if (teamScore > oppScore) seasonRecords[season] += 1;
                else seasonRecords[season] -= 1;
            }

            if (!leagueRecords[team.League]) leagueRecords[team.League] = {};
            leagueRecords[team.League][team._id] = seasonRecords;
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
