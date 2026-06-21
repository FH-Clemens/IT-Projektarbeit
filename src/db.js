import sqlite3 from 'sqlite3';
import {open} from 'sqlite';

let dbPromise = null;

async function initDB() {

    const db = await open ({
       filename: process.env.DB_PATH,
       driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS employees(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS service_points(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            status TEXT NOT NULL,
            current_number INTEGER DEFAULT NULL
        );
    `);

    return db;
}

export function getDB() {
    if (!dbPromise) {
        dbPromise = initDB();
    }
    return dbPromise;
}
