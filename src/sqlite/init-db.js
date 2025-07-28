// const sqlite3 = require('sqlite3').verbose();
// const { open } = require('sqlite');

// (async () => {
//     const db = await open({
//         filename: './custom_leagues.sqlite',
//         driver: sqlite3.Database
//     });

//     await db.exec(`
//         CREATE TABLE IF NOT EXISTS leagues (
//             league_name TEXT PRIMARY KEY,
//             league_emoji TEXT,
//             league_color TEXT,
//             league_teams TEXT
//         );
//     `);

//     await db.exec(`
//         CREATE TABLE IF NOT EXISTS season_winners (
//             league_id TEXT,
//             season INTEGER,
//             team_id TEXT,
//             PRIMARY KEY (league_id, season)
//         );
//     `);

//     await db.close();
//     console.log('Database initialised.');
// })();
