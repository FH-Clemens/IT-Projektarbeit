import db from '../../db.js';

export async function findByUsername(username) {
    return db.get(`
        SELECT * FROM employees
        WHERE
            name = ?
        LIMIT 1;
    `, username);
}