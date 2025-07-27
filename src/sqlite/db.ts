import Database from 'better-sqlite3';

const db = new Database('./custom_leagues.sqlite');
export default db;