
import db from '../../db.js';

export async function createEmployee(name, email, passwordHash, role) {
    const query = `INSERT INTO employees (name, email, password_hash, role) VALUES (?, ?, ?, ?);`;
    return db.run(query, name, email, passwordHash, role)
        .then(result => result.lastID)
}

export async function deleteEmployee(id) {

}