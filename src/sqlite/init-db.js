const Database = require('better-sqlite3');
const db = new Database('./custom_leagues.sqlite');

db.prepare(`
    CREATE TABLE IF NOT EXISTS leagues (
        league_name TEXT PRIMARY KEY,
        league_emoji TEXT,
        league_color TEXT,
        league_teams TEXT
    )
`).run();
db.close();

console.log('Database initialised.');