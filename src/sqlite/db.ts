import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const dbPromise = open({
  filename: './custom_leagues.sqlite',
  driver: sqlite3.Database,
});

export default dbPromise;
